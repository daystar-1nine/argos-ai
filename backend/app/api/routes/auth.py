"""
ARGOS AI - Authentication API Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.exceptions import AuthenticationException, ArgosException
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Access"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user account and returns a signed session token."""
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise ArgosException(
            message=f"User with email '{req.email}' already exists.",
            code="USER_EXISTS",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        name=req.name,
        organization=req.organization,
        role=req.role or "creator",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize Free subscription and notification preferences for new user
    from app.services.subscription_service import subscription_service
    subscription_service.get_or_create_subscription(user, db)
    subscription_service.get_or_create_notification_preferences(user, db)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=user)


@router.post("/login", response_model=TokenResponse)
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """Authenticates user credentials and issues a JWT token."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise AuthenticationException("Invalid email or password.")

    if not user.is_active:
        raise AuthenticationException("Account is deactivated.")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=user)


@router.get("/me", response_model=UserResponse)
def get_authenticated_profile(current_user: User = Depends(get_current_user)):
    """Returns currently authenticated operator profile."""
    return current_user
