"""
ARGOS AI - Deepfake Forensic Analysis, Windowing & Evidence Database Models
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class Analysis(Base, TimestampMixin):
    """Represents a full multi-modal deepfake forensic analysis run."""
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_id = Column(String(64), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)

    # Execution State
    # queued, preprocessing, extracting_features, analyzing_sync, temporal_analysis, classifying, generating_evidence, completed, failed
    status = Column(String(32), default="queued", index=True, nullable=False)
    current_stage = Column(String(64), default="Queued in Job Matrix")
    stage_number = Column(Integer, default=1)
    progress_pct = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    # Core Classification Verdict
    verdict = Column(String(32), nullable=True)  # REAL vs POTENTIALLY_MANIPULATED
    confidence = Column(Float, nullable=True)     # Calibrated confidence 0.0 - 1.0
    real_probability = Column(Float, nullable=True)
    fake_probability = Column(Float, nullable=True)

    # Cross-Modal Anomaly Metrics (0.0 to 100.0)
    visual_score = Column(Float, nullable=True)
    audio_score = Column(Float, nullable=True)
    sync_score = Column(Float, nullable=True)
    temporal_mismatch_ms = Column(String(32), default="0ms")

    # Pipeline & System Telemetry
    device_used = Column(String(64), default="CPU")
    model_version = Column(String(64), default="Argos-SyncNet-v3.4")
    execution_time_sec = Column(Float, default=0.0)
    total_windows_evaluated = Column(Integer, default=0)
    metadata_json = Column(JSON, default=dict)

    # Relationships
    asset = relationship("MediaAsset", back_populates="analyses")
    user = relationship("User", back_populates="analyses")
    windows = relationship("AnalysisWindow", back_populates="analysis", cascade="all, delete-orphan")
    evidence_frames = relationship("EvidenceFrame", back_populates="analysis", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="analysis", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis", cascade="all, delete-orphan")


class AnalysisWindow(Base, TimestampMixin):
    """Individual synchronized sliding temporal window evaluated by SyncNet."""
    __tablename__ = "analysis_windows"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)

    window_index = Column(Integer, nullable=False)
    start_sec = Column(Float, nullable=False)
    end_sec = Column(Float, nullable=False)
    start_frame = Column(Integer, nullable=False)
    end_frame = Column(Integer, nullable=False)

    sync_score = Column(Float, nullable=False)  # Cosine correlation in [0.0, 1.0]
    risk_level = Column(String(16), default="LOW")  # LOW, SUSPICIOUS, HIGH
    anomaly_reason = Column(String(256), nullable=True)

    # Relationships
    analysis = relationship("Analysis", back_populates="windows")


class EvidenceFrame(Base, TimestampMixin):
    """Representative video keyframe extracted at forensic anomaly peaks."""
    __tablename__ = "evidence_frames"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)

    frame_index = Column(Integer, nullable=False)
    timestamp_sec = Column(Float, nullable=False)
    timestamp_formatted = Column(String(16), nullable=False)  # e.g. "00:01.80"
    risk_pct = Column(Float, nullable=False)
    reason = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=False)
    filename = Column(String(128), nullable=False)

    # Relationships
    analysis = relationship("Analysis", back_populates="evidence_frames")
