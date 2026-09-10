"""
ARGOS AI - User Profile API Endpoints
Provides profile telemetry, account details, usage quotas, security management, and preference updates.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import verify_password, get_password_hash
from app.core.exceptions import ArgosException, AuthenticationException
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.profile import (
    UserProfileResponse,
    UserProfileUpdate,
    PasswordChangeRequest,
    UserSummary,
    SubscriptionInfo,
    UsageInfo,
)
from app.services.subscription_service import subscription_service

router = APIRouter(prefix="/profile", tags=["User Profile & Settings"])


@router.get("", response_model=UserProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/profile
    Retrieves composite profile containing user details, subscription status,
    dynamic usage counters, and granular feature access flags.
    """
    sub = subscription_service.get_or_create_subscription(current_user, db)
    plan = sub.plan
    plan_name = plan.name if plan else ("ARGOS PRO" if sub.plan_id == "pro" else "ARGOS FREE")
    price_inr = plan.price_inr if plan else (199 if sub.plan_id == "pro" else 0)

    usage = subscription_service.get_user_usage_summary(current_user, db)
    features = subscription_service.get_feature_map(current_user, db)

    # In avatar_url, return a deterministic avatar or user custom URL
    avatar = f"https://api.dicebear.com/7.x/identicon/svg?seed={current_user.id[:8]}"

    return UserProfileResponse(
        user=UserSummary(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            organization=current_user.organization,
            role=current_user.role,
            created_at=current_user.created_at,
            avatar_url=avatar,
        ),
        subscription=SubscriptionInfo(
            plan=sub.plan_id,
            name=plan_name,
            status=sub.status,
            price_inr=price_inr,
            billing_period=plan.billing_period if plan else None,
            started_at=sub.started_at,
            expires_at=sub.expires_at,
            provider=sub.provider,
        ),
        usage=UsageInfo(**usage),
        features=features,
    )


@router.patch("", response_model=UserSummary)
def update_user_profile(
    req: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    PATCH /api/profile
    Updates user personal metadata.
    Strictly ignores or disallows any plan/role tampering.
    """
    if req.name is not None:
        current_user.name = req.name.strip()
    if req.organization is not None:
        current_user.organization = req.organization.strip()

    db.commit()
    db.refresh(current_user)

    avatar = f"https://api.dicebear.com/7.x/identicon/svg?seed={current_user.id[:8]}"
    return UserSummary(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        organization=current_user.organization,
        role=current_user.role,
        created_at=current_user.created_at,
        avatar_url=avatar,
    )


@router.patch("/password")
@router.post("/change-password")
def change_user_password(
    req: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    PATCH /api/profile/password (or POST /api/profile/change-password)
    Validates current password and securely updates with salted bcrypt hash.
    """
    if not verify_password(req.old_password, current_user.hashed_password):
        raise AuthenticationException("Current password is not correct.")

    if len(req.new_password) < 8:
        raise ArgosException(
            "New password must be at least 8 characters long.",
            code="PASSWORD_TOO_SHORT",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    current_user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    subscription_service.record_audit_event(
        user_id=current_user.id,
        action="PASSWORD_CHANGED",
        details="User updated account password successfully.",
        db=db,
    )

    return {"status": "success", "message": "Password updated successfully."}

