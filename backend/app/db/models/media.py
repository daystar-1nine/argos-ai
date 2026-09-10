"""
ARGOS AI - Media Asset & Fingerprint (Media DNA) Models
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin, generate_uuid


class MediaAsset(Base, TimestampMixin):
    __tablename__ = "media_assets"

    id = Column(String(64), primary_key=True, default=generate_uuid)  # Asset UUID or ARG-2026-XXXX format
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    media_type = Column(String(32), default="video")  # video, audio, image
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    storage_path = Column(String(512), nullable=False)
    mime_type = Column(String(128), default="video/mp4")
    
    # Extracted FFprobe Metadata
    duration_seconds = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    resolution = Column(String(32), nullable=True)  # e.g. "1920x1080"
    fps = Column(Float, nullable=True)
    frame_count = Column(Integer, nullable=True)
    video_codec = Column(String(64), nullable=True)
    audio_codec = Column(String(64), nullable=True)
    audio_sample_rate = Column(Integer, nullable=True)
    audio_channels = Column(Integer, nullable=True)
    bitrate_kbps = Column(Integer, nullable=True)

    # Protection & Provenance State
    is_protected = Column(Boolean, default=False)
    protection_seal = Column(String(128), nullable=True)
    watermark_strength = Column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="media_assets")
    fingerprint = relationship("MediaFingerprint", back_populates="asset", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="asset", cascade="all, delete-orphan")
    detections = relationship("Detection", back_populates="asset", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="asset", cascade="all, delete-orphan")


class MediaFingerprint(Base, TimestampMixin):
    """
    ARGOS Media DNA: Cryptographic integrity hashes, perceptual hashes,
    and multi-modal acoustic/visual feature vectors.
    """
    __tablename__ = "media_fingerprints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    asset_id = Column(String(64), ForeignKey("media_assets.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    sha256_hash = Column(String(64), nullable=False, index=True)
    phash = Column(String(64), nullable=True)  # Perceptual hash of representative frames
    visual_signature = Column(String(256), nullable=True)
    audio_signature = Column(String(256), nullable=True)
    temporal_signature = Column(String(256), nullable=True)
    
    # Serialized sampled feature vectors for future derivative comparison
    feature_vector_sample = Column(JSON, default=list)
    entropy_score = Column(Float, default=0.90)

    # Relationships
    asset = relationship("MediaAsset", back_populates="fingerprint")
