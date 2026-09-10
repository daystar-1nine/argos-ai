"""
ARGOS AI - Alert Database Model
"""

from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Alert(Base, TimestampMixin):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(64), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=True, index=True)
    match_id = Column(String(36), nullable=True)

    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(32), default="HIGH")  # critical, high, medium, low
    is_read = Column(Boolean, default=False)
    source_label = Column(String(128), default="Sovereign Sensor Relay")
    action_required = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="alerts")
