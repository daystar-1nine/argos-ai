"""
ARGOS AI - Notification Preferences API Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.schemas.profile import NotificationPreferenceResponse, NotificationPreferenceUpdate
from app.services.subscription_service import subscription_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/notifications/preferences
    Retrieves user alert channel and threshold preferences.
    """
    pref = subscription_service.get_or_create_notification_preferences(current_user, db)
    return NotificationPreferenceResponse(
        email_alerts=pref.email_alerts,
        push_alerts=pref.push_alerts,
        detection_alerts=pref.detection_alerts,
        incident_alerts=pref.incident_alerts,
    )


@router.patch("/preferences", response_model=NotificationPreferenceResponse)
def update_notification_preferences(
    req: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    PATCH /api/notifications/preferences
    Updates user notification preferences and commits to database.
    """
    pref = subscription_service.get_or_create_notification_preferences(current_user, db)

    if req.email_alerts is not None:
        pref.email_alerts = req.email_alerts
    if req.push_alerts is not None:
        pref.push_alerts = req.push_alerts
    if req.detection_alerts is not None:
        pref.detection_alerts = req.detection_alerts
    if req.incident_alerts is not None:
        pref.incident_alerts = req.incident_alerts

    db.commit()
    db.refresh(pref)

    return NotificationPreferenceResponse(
        email_alerts=pref.email_alerts,
        push_alerts=pref.push_alerts,
        detection_alerts=pref.detection_alerts,
        incident_alerts=pref.incident_alerts,
    )
