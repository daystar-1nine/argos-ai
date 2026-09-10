"""
ARGOS AI - FastAPI Dependency Injection
Provides database sessions, JWT authentication, user context, and ownership checks.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.core.exceptions import AuthenticationException, AuthorizationException, EntityNotFoundException
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.media import MediaAsset

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_STR}/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Extracts and validates the current authenticated user from the Bearer token."""
    if not token:
        # Development / Demo mode fallback: return or create a default user if in DEMO_MODE
        if settings.DEMO_MODE:
            demo_user = db.query(User).filter(User.email == "analyst@argos.ai").first()
            if not demo_user:
                demo_user = User(
                    id="usr_default_demo_analyst",
                    email="analyst@argos.ai",
                    hashed_password="demo_hashed_placeholder",
                    name="Lead Forensic Analyst",
                    organization="ARGOS Sovereign Operations",
                    role="analyst"
                )
                db.add(demo_user)
                db.commit()
                db.refresh(demo_user)
            return demo_user
        raise AuthenticationException("Authentication required")

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise AuthenticationException("Invalid or expired session token")

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise AuthenticationException("User account not found or deactivated")

    return user


def get_current_active_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_active:
        raise AuthorizationException("Inactive user account")
    return user


def verify_asset_ownership(asset_id: str, user: User, db: Session) -> MediaAsset:
    """Verifies that the requested asset belongs to the user (or user is admin/analyst)."""
    asset = db.query(MediaAsset).filter(MediaAsset.id == asset_id).first()
    if not asset:
        raise EntityNotFoundException("MediaAsset", asset_id)

    if user.role not in ["admin", "analyst"] and asset.user_id != user.id:
        raise AuthorizationException("You do not have permission to access this media asset")

    return asset
