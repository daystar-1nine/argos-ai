"""
ARGOS AI - Usage Quotas & Metrics API Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.profile import UsageInfo
from app.services.subscription_service import subscription_service

router = APIRouter(prefix="/usage", tags=["Usage & Quotas"])


@router.get("", response_model=UsageInfo)
def get_user_usage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/usage
    Returns real-time usage metrics and remaining quotas for current billing period.
    """
    summary = subscription_service.get_user_usage_summary(current_user, db)
    return UsageInfo(**summary)
