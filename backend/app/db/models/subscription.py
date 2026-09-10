"""
ARGOS AI - Subscription, Usage & Profile Database Models
Defines two-tier subscription architecture (ARGOS FREE @ ₹0 vs ARGOS PRO @ ₹199/month),
usage quotas, notification preferences, and audit logs.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


def utc_now():
    return datetime.now(timezone.utc)


class Plan(Base, TimestampMixin):
    __tablename__ = "plans"

    id = Column(String(50), primary_key=True)  # "free", "pro"
    name = Column(String(100), nullable=False)  # "ARGOS FREE", "ARGOS PRO"
    price_inr = Column(Integer, nullable=False, default=0)  # 0 or 199
    billing_period = Column(String(50), nullable=True)  # "monthly", None
    is_active = Column(Boolean, default=True)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    plan_id = Column(String(50), ForeignKey("plans.id"), default="free", nullable=False)
    status = Column(String(50), default="active", nullable=False)  # active, trialing, past_due, cancelled, expired, pending
    started_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    provider = Column(String(50), default="manual", nullable=True)  # manual, razorpay, stripe
    provider_subscription_id = Column(String(255), nullable=True)

    # Relationships
    user = relationship("User", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")


class UsageRecord(Base, TimestampMixin):
    __tablename__ = "usage_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    metric = Column(String(100), index=True, nullable=False)  # "analyses_count", "protected_assets_count"
    period_start = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    count = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="usage_records")


class NotificationPreference(Base, TimestampMixin):
    __tablename__ = "notification_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    email_alerts = Column(Boolean, default=True, nullable=False)
    push_alerts = Column(Boolean, default=False, nullable=False)
    detection_alerts = Column(Boolean, default=True, nullable=False)
    incident_alerts = Column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="notification_preference")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # UPGRADE_INITIATED, PRO_FEATURE_ACCESS_DENIED, etc.
    feature = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="audit_logs")
