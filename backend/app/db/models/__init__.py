"""
ARGOS AI - Database Models Package
Exports all SQLAlchemy entities for application use and Alembic autogeneration.
"""

from app.db.base import Base
from app.db.models.user import User
from app.db.models.media import MediaAsset, MediaFingerprint
from app.db.models.analysis import Analysis, AnalysisWindow, EvidenceFrame
from app.db.models.detection import Detection
from app.db.models.incident import Incident
from app.db.models.alert import Alert
from app.db.models.report import Report
from app.db.models.monitoring import MonitoringSource
from app.db.models.subscription import (
    Plan,
    Subscription,
    UsageRecord,
    NotificationPreference,
    AuditLog,
)

__all__ = [
    "Base",
    "User",
    "MediaAsset",
    "MediaFingerprint",
    "Analysis",
    "AnalysisWindow",
    "EvidenceFrame",
    "Detection",
    "Incident",
    "Alert",
    "Report",
    "MonitoringSource",
    "Plan",
    "Subscription",
    "UsageRecord",
    "NotificationPreference",
    "AuditLog",
]
