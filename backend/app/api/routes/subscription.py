"""
ARGOS AI - Subscription & Billing API Endpoints
Manages plan tiers (ARGOS FREE vs ARGOS PRO), feature authorization, checkout initiation, and cancellation.
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.profile import SubscriptionCheckoutRequest, SubscriptionInfo
from app.services.subscription_service import subscription_service
from app.services.payment_service import payment_service

router = APIRouter(prefix="/subscription", tags=["Subscriptions & Billing"])


@router.get("", response_model=SubscriptionInfo)
def get_user_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/subscription
    Returns authenticated user's current subscription record.
    """
    sub = subscription_service.get_or_create_subscription(current_user, db)
    plan = sub.plan
    plan_name = plan.name if plan else ("ARGOS PRO" if sub.plan_id == "pro" else "ARGOS FREE")
    price_inr = plan.price_inr if plan else (199 if sub.plan_id == "pro" else 0)

    return SubscriptionInfo(
        plan=sub.plan_id,
        name=plan_name,
        status=sub.status,
        price_inr=price_inr,
        billing_period=plan.billing_period if plan else None,
        started_at=sub.started_at,
        expires_at=sub.expires_at,
        provider=sub.provider,
    )


@router.get("/features")
def get_user_features(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/subscription/features
    Returns dictionary of enabled/disabled capabilities according to active plan.
    """
    effective_plan = subscription_service.get_effective_plan_id(current_user, db)
    features = subscription_service.get_feature_map(current_user, db)
    return {
        "plan": effective_plan,
        "features": features,
    }


@router.post("/checkout")
def initiate_subscription_checkout(
    req: SubscriptionCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /api/subscription/checkout
    Initiates upgrade flow for ARGOS PRO.
    Strictly verifies payment gateway credentials; returns PAYMENT_PROVIDER_NOT_CONFIGURED
    if payment credentials are not present, refusing to fabricate payment completion.
    """
    return payment_service.create_checkout(current_user, req.plan_id, db)


@router.post("/cancel")
def cancel_active_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /api/subscription/cancel
    Cancels recurring subscription while retaining Pro access until current billing period ends.
    """
    return payment_service.cancel_subscription(current_user, db)
