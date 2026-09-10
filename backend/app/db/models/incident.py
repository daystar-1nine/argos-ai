"""
ARGOS AI - Incident & Legal Takedown Database Model
"""

from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Incident(Base, TimestampMixin):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=generate_uuid)  # e.g. ARG-8291
    asset_id = Column(String(64), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    detection_id = Column(String(36), ForeignKey("detections.id", ondelete="SET NULL"), nullable=True, index=True)

    title = Column(String(255), nullable=False)
    status = Column(String(32), default="open")  # open, investigating, notice_sent, resolved, closed
    platform_target = Column(String(128), nullable=False)  # e.g. "X / Twitter", "YouTube", "TikTok"
    suspect_url = Column(String(512), nullable=True)
    takedown_type = Column(String(64), default="DMCA 512(c)")  # DMCA 512(c), EU DSA Notice, Platform Integrity
    notes = Column(Text, nullable=True)

    # Relationships
    detection = relationship("Detection", back_populates="incidents")
