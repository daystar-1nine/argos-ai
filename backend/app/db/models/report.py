"""
ARGOS AI - Forensic Dossier & Sealed Report Database Model
"""

from sqlalchemy import Column, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    report_number = Column(String(64), unique=True, index=True, nullable=False)  # e.g. REP-ARG-2026-9904
    asset_id = Column(String(64), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True, index=True)
    incident_id = Column(String(36), nullable=True)

    title = Column(String(255), nullable=False)
    classification = Column(String(64), default="CONFIDENTIAL FORENSIC DOSSIER")
    summary = Column(Text, nullable=False)
    pdf_path = Column(String(512), nullable=True)
    verification_hash = Column(String(64), nullable=False)  # SHA-256 seal of the generated report
    data_snapshot = Column(JSON, default=dict)

    # Relationships
    asset = relationship("MediaAsset", back_populates="reports")
    analysis = relationship("Analysis", back_populates="reports")
