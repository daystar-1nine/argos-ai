"""
ARGOS AI - Centralized Subscription & Permission Service
Enforces two-tier subscription access rules (ARGOS FREE vs ARGOS PRO),
tracks metric quotas, audits subscription transitions, and provides FastAPI route guards.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, Set
from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ProFeatureRequiredException, UsageLimitExceededException
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.subscription import Plan, Subscription, UsageRecord, NotificationPreference, AuditLog
from app.db.models.media import MediaAsset
from app.db.models.incident import Incident
from app.db.models.monitoring import MonitoringSource


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


FREE_FEATURES: Set[str] = {
    "detect",
    "deepfake_analysis",
    "audio_analysis",
    "visual_analysis",
    "lip_sync_analysis",
    "temporal_analysis",
    "evidence",
    "verification",
}

PRO_FEATURES: Set[str] = FREE_FEATURES | {
    "media_dna",
    "watermark",
    "c2pa",
    "protection_certificate",
    "monitoring",
    "derivative_matching",
    "alerts",
    "incidents",
    "advanced_reports",
}


def to_utc_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class SubscriptionService:
    """Core domain service for subscription lifecycle, quotas, and permission verification."""

    def get_or_create_subscription(self, user: User, db: Session) -> Subscription:
        """Retrieves user subscription or initializes default ARGOS FREE subscription."""
        sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        if not sub:
            # Check if user role is analyst/admin or demo user
            is_pro_default = user.email == "analyst@argos.ai" or user.role == "admin"
            sub = Subscription(
                user_id=user.id,
                plan_id="pro" if is_pro_default else "free",
                status="active",
                provider="manual",
                started_at=utc_now(),
            )
            db.add(sub)
            db.commit()
            db.refresh(sub)

        # Check for expired subscription
        exp_aware = to_utc_aware(sub.expires_at)
        if exp_aware and exp_aware < utc_now() and sub.status in ["active", "cancelled"]:
            sub.status = "expired"
            sub.plan_id = "free"
            db.commit()
            db.refresh(sub)

        return sub

    def get_effective_plan_id(self, user: User, db: Session) -> str:
        """Determines active plan considering status and expiry."""
        sub = self.get_or_create_subscription(user, db)
        if sub.plan_id == "pro":
            exp_aware = to_utc_aware(sub.expires_at)
            # If expires_at is in the past, consider expired
            if exp_aware and exp_aware < utc_now():
                if sub.status != "expired":
                    sub.status = "expired"
                    sub.plan_id = "free"
                    db.commit()
                return "free"

            if sub.status in ["active", "trialing"]:
                return "pro"
            if sub.status == "cancelled" and exp_aware and exp_aware > utc_now():
                return "pro"
            return "free"
        return "free"

    def is_feature_allowed(self, user: User, feature: str, db: Session) -> bool:
        """Evaluates whether the user can access the given capability."""
        # Core deepfake detection features are ALWAYS available to FREE users
        if feature in FREE_FEATURES:
            return True

        # Protection and advanced features require active PRO tier
        plan_id = self.get_effective_plan_id(user, db)
        return plan_id == "pro"

    def enforce_feature_access(self, user: User, feature: str, db: Session) -> None:
        """Validates permission or raises HTTP 403 ProFeatureRequiredException with audit record."""
        if not self.is_feature_allowed(user, feature, db):
            self.record_audit_event(
                user_id=user.id,
                action="PRO_FEATURE_ACCESS_DENIED",
                feature=feature,
                details=f"User {user.email} attempted to access {feature} without active ARGOS PRO subscription.",
                db=db,
            )
            raise ProFeatureRequiredException(feature=feature)

    def get_current_period_bounds(self) -> tuple[datetime, datetime]:
        """Calculates current monthly billing/usage window."""
        now = utc_now()
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # Next month start
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start.month + 1)
        return start, end

    def get_or_create_usage_record(self, user: User, metric: str, db: Session) -> UsageRecord:
        """Retrieves or creates usage counter for current calendar period."""
        period_start, period_end = self.get_current_period_bounds()
        record = (
            db.query(UsageRecord)
            .filter(
                UsageRecord.user_id == user.id,
                UsageRecord.metric == metric,
                UsageRecord.period_start >= period_start,
                UsageRecord.period_start < period_end,
            )
            .first()
        )
        if not record:
            record = UsageRecord(
                user_id=user.id,
                metric=metric,
                period_start=period_start,
                period_end=period_end,
                count=0,
            )
            db.add(record)
            db.commit()
            db.refresh(record)
        return record

    def check_and_increment_usage(self, user: User, metric: str, db: Session) -> int:
        """Validates usage quota for Free users and increments counter."""
        plan_id = self.get_effective_plan_id(user, db)
        usage_record = self.get_or_create_usage_record(user, metric, db)

        if metric == "analyses_count" and plan_id == "free":
            if usage_record.count >= settings.FREE_ANALYSIS_LIMIT:
                self.record_audit_event(
                    user_id=user.id,
                    action="USAGE_LIMIT_EXCEEDED",
                    feature="deepfake_analysis",
                    details=f"Free tier limit of {settings.FREE_ANALYSIS_LIMIT} analyses exceeded (current: {usage_record.count}).",
                    db=db,
                )
                raise UsageLimitExceededException("analyses", settings.FREE_ANALYSIS_LIMIT)

        usage_record.count += 1
        db.commit()
        db.refresh(usage_record)
        return usage_record.count

    def get_user_usage_summary(self, user: User, db: Session) -> Dict[str, Any]:
        """Gathers real database counts for user profile and dashboard telemetry."""
        plan_id = self.get_effective_plan_id(user, db)
        analyses_record = self.get_or_create_usage_record(user, "analyses_count", db)

        # Count real protected assets owned by user
        protected_count = (
            db.query(MediaAsset)
            .filter(MediaAsset.user_id == user.id, MediaAsset.is_protected == True)
            .count()
        )

        # Count active monitoring sources in system
        monitoring_count = (
            db.query(MonitoringSource)
            .filter(MonitoringSource.status == "online")
            .count()
        )

        # Count incidents associated with user assets
        incidents_count = (
            db.query(Incident)
            .join(MediaAsset, Incident.asset_id == MediaAsset.id)
            .filter(MediaAsset.user_id == user.id)
            .count()
        )

        limit = settings.PRO_ANALYSIS_LIMIT if plan_id == "pro" else settings.FREE_ANALYSIS_LIMIT

        return {
            "analyses": analyses_record.count,
            "analysis_limit": limit,
            "analyses_remaining": max(0, limit - analyses_record.count),
            "protected_assets": protected_count,
            "monitoring_sources": monitoring_count if plan_id == "pro" else 0,
            "incidents": incidents_count,
        }

    def get_feature_map(self, user: User, db: Session) -> Dict[str, bool]:
        """Returns boolean map of capability permissions for frontend gating."""
        plan_id = self.get_effective_plan_id(user, db)
        is_pro = plan_id == "pro"
        return {
            "detection": True,
            "deepfake_analysis": True,
            "face_lip_analysis": True,
            "audio_spectral_analysis": True,
            "temporal_sync_analysis": True,
            "evidence_frames": True,
            "verification": True,
            "media_dna": is_pro,
            "watermark": is_pro,
            "c2pa": is_pro,
            "protection_certificate": is_pro,
            "monitoring": is_pro,
            "derivative_matching": is_pro,
            "alerts": is_pro,
            "incidents": is_pro,
            "advanced_reports": is_pro,
        }

    def get_or_create_notification_preferences(self, user: User, db: Session) -> NotificationPreference:
        """Retrieves or creates user notification preferences."""
        pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user.id).first()
        if not pref:
            pref = NotificationPreference(
                user_id=user.id,
                email_alerts=True,
                push_alerts=False,
                detection_alerts=True,
                incident_alerts=True,
            )
            db.add(pref)
            db.commit()
            db.refresh(pref)
        return pref

    def record_audit_event(
        self,
        user_id: Optional[str],
        action: str,
        feature: Optional[str] = None,
        details: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> None:
        """Persists audit log entry for security and subscription compliance."""
        if not db:
            return
        try:
            log = AuditLog(
                user_id=user_id,
                action=action,
                feature=feature,
                details=details,
                created_at=utc_now(),
            )
            db.add(log)
            db.commit()
        except Exception:
            db.rollback()


subscription_service = SubscriptionService()


def require_feature(feature_name: str):
    """FastAPI dependency factory enforcing feature permission."""
    def dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        subscription_service.enforce_feature_access(current_user, feature_name, db)
        return current_user
    return dependency
