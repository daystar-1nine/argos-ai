"""
ARGOS AI - FastAPI Dependency Injection
Provides database sessions, JWT authentication, user context, and ownership checks.
"""

from typing import Optional
from fastapi import Depends, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationException, AuthorizationException, EntityNotFoundException
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.session import UserSession
from app.db.models.media import MediaAsset
from app.db.models.analysis import Analysis

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_STR}/auth/login", auto_error=False)


def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts and validates the current authenticated user.
    Inspects:
    1. Authorization: Bearer <token> header
    2. argos_access_token HttpOnly cookie
    """
    auth_token = token
    if not auth_token:
        auth_token = request.cookies.get("argos_access_token")

    if not auth_token:
        raise AuthenticationException("Authentication is required.")

    payload = decode_access_token(auth_token)
    if not payload or "sub" not in payload:
        raise AuthenticationException("Invalid or expired authentication session.")

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AuthenticationException("User account not found.")

    if not user.is_active:
        raise AuthenticationException("Account is deactivated.")

    # Validate session revocation if session ID is attached
    session_id = payload.get("sid")
    if session_id:
        session = db.query(UserSession).filter(UserSession.id == session_id).first()
        if session and session.revoked_at is not None:
            raise AuthenticationException("Session has been terminated.")

    return user


def get_current_active_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_active:
        raise AuthorizationException("Inactive user account.")
    return user


def verify_asset_ownership(asset_id: str, user: User, db: Session) -> MediaAsset:
    """Verifies that the requested asset belongs to the user (or user is admin/analyst)."""
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    if not asset:
        raise EntityNotFoundException("MediaAsset", asset_id)

    if user.role not in ["admin", "analyst"] and asset.user_id != user.id:
        raise AuthorizationException("You do not have permission to access this media asset.")

    return asset


def verify_analysis_ownership(analysis_id: str, user: User, db: Session) -> Analysis:
    """Verifies that the requested analysis job belongs to the user (or user is admin/analyst)."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise EntityNotFoundException("Analysis", analysis_id)

    if user.role not in ["admin", "analyst"] and analysis.user_id != user.id:
        raise AuthorizationException("You do not have permission to access this analysis.")

    return analysis

