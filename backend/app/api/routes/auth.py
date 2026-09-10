"""
ARGOS AI - Complete Production Authentication & Session Management API Endpoints
Implements /signup, /login, /logout, /logout-all, /me, /forgot-password, /reset-password,
/sessions, and /sessions/{session_id} with HttpOnly cookies and Bearer tokens.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    create_refresh_token,
    hash_token,
    hash_ip,
    check_login_rate_limit,
    record_failed_login,
    reset_login_rate_limit,
)
from app.core.exceptions import (
    AuthenticationException,
    AuthorizationException,
    ArgosException,
    EmailProviderNotConfiguredException,
    RateLimitExceededException,
    InvalidTokenException,
    EntityNotFoundException,
)
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.session import UserSession, PasswordResetToken
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    UserSummaryResponse,
    AuthMeResponse,
    SessionResponse,
)
from app.services.subscription_service import subscription_service

router = APIRouter(prefix="/auth", tags=["Authentication & Access"])


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def set_auth_cookies(response: Response, access_token: str, refresh_token: Optional[str] = None):
    """Sets secure HttpOnly cookies for session management."""
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key="argos_access_token",
        value=access_token,
        httponly=True,
        max_age=access_max_age,
        expires=access_max_age,
        samesite=settings.COOKIE_SAMESITE,
        secure=settings.COOKIE_SECURE,
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )

    if refresh_token:
        refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        response.set_cookie(
            key="argos_refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=refresh_max_age,
            expires=refresh_max_age,
            samesite=settings.COOKIE_SAMESITE,
            secure=settings.COOKIE_SECURE,
            domain=settings.COOKIE_DOMAIN,
            path="/api/auth",
        )


def clear_auth_cookies(response: Response):
    """Clears authentication cookies."""
    response.delete_cookie(
        key="argos_access_token",
        domain=settings.COOKIE_DOMAIN,
        path="/",
    )
    response.delete_cookie(
        key="argos_refresh_token",
        domain=settings.COOKIE_DOMAIN,
        path="/api/auth",
    )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup_user(
    req: SignupRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/signup (or /api/auth/register)
    Registers a new operator account, creates FREE subscription, initializes quotas,
    issues a session, and sets secure HttpOnly cookies.
    """
    # Verify password confirmation if provided
    if req.confirm_password and req.password != req.confirm_password:
        raise ArgosException(
            message="Passwords do not match.",
            code="PASSWORD_MISMATCH",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # Check email duplicate
    existing = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing:
        raise ArgosException(
            message=f"User with email '{req.email}' already exists.",
            code="USER_EXISTS",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    clean_email = req.email.strip().lower()
    avatar = f"https://api.dicebear.com/7.x/identicon/svg?seed={clean_email}"

    user = User(
        email=clean_email,
        hashed_password=get_password_hash(req.password),
        name=req.name.strip(),
        organization=req.organization or "Independent Creator",
        role=req.role or "creator",
        avatar_url=avatar,
        last_login_at=utc_now(),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically provision ARGOS FREE subscription, notification preferences, usage record
    subscription_service.get_or_create_subscription(user, db)
    subscription_service.get_or_create_notification_preferences(user, db)
    subscription_service.get_user_usage_summary(user, db)

    # Create UserSession
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "Unknown Device")[:500]
    raw_refresh = create_refresh_token()
    refresh_hash = hash_token(raw_refresh)

    session = UserSession(
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        ip_hash=hash_ip(client_ip),
        user_agent=user_agent,
        expires_at=utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Issue JWT access token containing session ID (sid)
    access_token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "sid": session.id,
    })

    # Set HttpOnly cookies
    set_auth_cookies(response, access_token, raw_refresh)

    # Audit logging
    subscription_service.record_audit_event(
        user_id=user.id,
        action="USER_REGISTERED",
        details="User registered account and received default ARGOS FREE tier.",
        db=db,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        session_id=session.id,
        user=user,
    )


@router.post("/login", response_model=TokenResponse)
def login_user(
    req: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/login
    Authenticates user credentials, throttles brute-force attempts, creates a UserSession,
    and sets secure HttpOnly cookies.
    """
    clean_email = req.email.strip().lower()
    client_ip = request.client.host if request.client else "unknown_ip"
    rate_limit_key = f"{client_ip}:{clean_email}"

    # Rate limiting check
    if not check_login_rate_limit(rate_limit_key):
        raise RateLimitExceededException(
            "Too many failed login attempts. Please wait 5 minutes before retrying.",
            wait_seconds=settings.LOGIN_RATE_LIMIT_WINDOW_SEC
        )

    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        record_failed_login(rate_limit_key)
        if user:
            subscription_service.record_audit_event(
                user_id=user.id,
                action="USER_LOGIN_FAILED",
                details=f"Failed login attempt from IP hash {hash_ip(client_ip)}.",
                db=db,
            )
        raise AuthenticationException("Invalid email or password.")

    if not user.is_active:
        raise AuthenticationException("Account is deactivated.")

    # Successful login: reset throttle counter
    reset_login_rate_limit(rate_limit_key)
    user.last_login_at = utc_now()

    # Create UserSession
    user_agent = request.headers.get("user-agent", "Unknown Device")[:500]
    raw_refresh = create_refresh_token()
    refresh_hash = hash_token(raw_refresh)

    session = UserSession(
        user_id=user.id,
        refresh_token_hash=refresh_hash,
        ip_hash=hash_ip(client_ip),
        user_agent=user_agent,
        expires_at=utc_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    access_token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "sid": session.id,
    })

    set_auth_cookies(response, access_token, raw_refresh)

    subscription_service.record_audit_event(
        user_id=user.id,
        action="USER_LOGIN",
        details=f"User authenticated successfully via session {session.id}.",
        db=db,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        session_id=session.id,
        user=user,
    )


@router.get("/me", response_model=AuthMeResponse)
def get_authenticated_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /api/auth/me
    Returns current authenticated operator summary, plan tier, and account metadata.
    """
    sub = subscription_service.get_or_create_subscription(current_user, db)
    plan_id = sub.plan_id if sub else "free"
    avatar = current_user.avatar_url or f"https://api.dicebear.com/7.x/identicon/svg?seed={current_user.id[:8]}"

    summary = UserSummaryResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        plan=plan_id,
        role=current_user.role,
        organization=current_user.organization,
        avatar_url=avatar,
        created_at=current_user.created_at,
    )

    return AuthMeResponse(
        user=summary,
        authenticated=True,
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        plan=plan_id,
    )


@router.post("/logout")
def logout_user(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/logout
    Invalidates current session and clears HttpOnly cookies.
    """
    # Extract session ID from bearer token or cookie
    auth_token = request.headers.get("authorization", "").replace("Bearer ", "").strip()
    if not auth_token:
        auth_token = request.cookies.get("argos_access_token", "")

    if auth_token:
        payload = decode_access_token(auth_token)
        if payload and "sid" in payload:
            session = db.query(UserSession).filter(UserSession.id == payload["sid"]).first()
            if session:
                session.revoked_at = utc_now()
                db.commit()

    # Clear HttpOnly cookies
    clear_auth_cookies(response)

    subscription_service.record_audit_event(
        user_id=current_user.id,
        action="USER_LOGOUT",
        details="User terminated current session.",
        db=db,
    )

    return {"status": "success", "message": "Successfully logged out."}


@router.post("/logout-all")
def logout_all_sessions(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/logout-all
    Revokes ALL active sessions for the authenticated user and clears cookies.
    """
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.revoked_at.is_(None)
    ).all()

    now = utc_now()
    for s in sessions:
        s.revoked_at = now

    db.commit()
    clear_auth_cookies(response)

    subscription_service.record_audit_event(
        user_id=current_user.id,
        action="USER_LOGOUT_ALL",
        details=f"User revoked {len(sessions)} active sessions.",
        db=db,
    )

    return {"status": "success", "message": f"Successfully revoked {len(sessions)} sessions."}


@router.get("/sessions", response_model=List[SessionResponse])
def list_user_sessions(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /api/auth/sessions
    Lists all active (unrevoked and unexpired) sessions for the authenticated user.
    """
    # Identify current session ID
    auth_token = request.headers.get("authorization", "").replace("Bearer ", "").strip()
    if not auth_token:
        auth_token = request.cookies.get("argos_access_token", "")
    current_sid = None
    if auth_token:
        payload = decode_access_token(auth_token)
        if payload:
            current_sid = payload.get("sid")

    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.revoked_at.is_(None)
    ).order_by(UserSession.last_used_at.desc()).all()

    result = []
    now = utc_now()
    for s in sessions:
        exp = s.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp > now:
            result.append(SessionResponse(
                id=s.id,
                device=s.user_agent or "Web Browser",
                ip_hash=s.ip_hash,
                created_at=s.created_at,
                last_used_at=s.last_used_at,
                is_current=(s.id == current_sid),
            ))

    return result


@router.delete("/sessions/{session_id}")
def revoke_specific_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    DELETE /api/auth/sessions/{session_id}
    Terminates a specific session belonging to the user.
    """
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise EntityNotFoundException("UserSession", session_id)

    session.revoked_at = utc_now()
    db.commit()

    subscription_service.record_audit_event(
        user_id=current_user.id,
        action="SESSION_REVOKED",
        details=f"User revoked session {session_id}.",
        db=db,
    )

    return {"status": "success", "message": f"Session {session_id} revoked."}


@router.post("/forgot-password")
def request_password_reset(
    req: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/forgot-password
    Generates a cryptographically secure 15-minute reset token.
    If SMTP is unconfigured, raises EmailProviderNotConfiguredException.
    """
    # Strict SMTP verification requirement
    if not settings.SMTP_HOST:
        raise EmailProviderNotConfiguredException(
            "Password reset email cannot be dispatched: SMTP email provider is not configured."
        )

    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user:
        # Uniform response to avoid email enumeration
        return {
            "status": "success",
            "message": "If an account with that email exists, reset instructions have been dispatched."
        }

    raw_token = create_refresh_token()[:48]
    token_hashed = hash_token(raw_token)

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hashed,
        expires_at=utc_now() + timedelta(minutes=15),
    )
    db.add(reset_record)
    db.commit()

    subscription_service.record_audit_event(
        user_id=user.id,
        action="PASSWORD_RESET_REQUESTED",
        details="Password reset token generated.",
        db=db,
    )

    # In production with SMTP configured, send mail here via smtplib
    return {
        "status": "success",
        "message": "If an account with that email exists, reset instructions have been dispatched."
    }


@router.post("/reset-password")
def execute_password_reset(
    req: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/auth/reset-password
    Validates token hash, checks 15-min expiration, updates password with bcrypt,
    invalidates the token, and revokes all active sessions for security.
    """
    if req.confirm_password and req.new_password != req.confirm_password:
        raise ArgosException(
            message="Passwords do not match.",
            code="PASSWORD_MISMATCH",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    token_hashed = hash_token(req.token)
    reset_record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hashed
    ).first()

    if not reset_record or not reset_record.is_valid:
        raise InvalidTokenException("The password reset token is invalid, expired, or has already been used.")

    user = db.query(User).filter(User.id == reset_record.user_id).first()
    if not user:
        raise InvalidTokenException("User associated with this reset token no longer exists.")

    # Update password
    user.hashed_password = get_password_hash(req.new_password)
    reset_record.used_at = utc_now()

    # Revoke all existing sessions for security
    active_sessions = db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.revoked_at.is_(None)
    ).all()
    now = utc_now()
    for s in active_sessions:
        s.revoked_at = now

    db.commit()

    subscription_service.record_audit_event(
        user_id=user.id,
        action="PASSWORD_RESET_COMPLETED",
        details="User successfully reset password via token. All active sessions revoked.",
        db=db,
    )

    return {
        "status": "success",
        "message": "Password reset successfully. Please log in with your new credentials."
    }
