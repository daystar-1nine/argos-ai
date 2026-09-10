"""
ARGOS AI - Detection Database Model
Represents suspected synthetic derivatives discovered or surfaced.
"""

from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Detection(Base, TimestampMixin):
    __tablename__ = "detections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_id = Column(String(64), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True, index=True)

    source_name = Column(String(128), nullable=False)  # e.g. "X (Public Relay)", "TikTok Indexed Mirror"
    source_url = Column(String(512), nullable=True)
    region = Column(String(64), default="Global")
    risk_level = Column(String(32), default="HIGH")  # critical, danger, warning, low
    match_type = Column(String(64), default="audio_visual_mismatch")
    confidence = Column(Float, default=0.0)
    status = Column(String(64), default="Under Investigation")
    detected_at = Column(DateTime, nullable=False)

    # Relationships
    asset = relationship("MediaAsset", back_populates="detections")
    analysis = relationship("Analysis", back_populates="detections")
    incidents = relationship("Incident", back_populates="detection", cascade="all, delete-orphan")
