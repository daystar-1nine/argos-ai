"""
ARGOS AI - Media Asset & Fingerprint Schemas
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class MediaUploadResponse(BaseModel):
    asset_id: str
    status: str = "uploaded"
    filename: str
    duration: Optional[float]
    has_audio: bool
    has_video: bool
    resolution: Optional[str] = None
    fps: Optional[float] = None
    file_size_bytes: int


class MediaFingerprintResponse(BaseModel):
    id: str
    asset_id: str
    sha256_hash: str
    phash: Optional[str]
    visual_signature: Optional[str]
    audio_signature: Optional[str]
    temporal_signature: Optional[str]
    entropy_score: float
    feature_vector_sample: List[float] = []

    class Config:
        from_attributes = True


class MediaAssetResponse(BaseModel):
    id: str
    user_id: str
    title: str
    media_type: str
    file_name: str
    file_size_bytes: int
    duration_seconds: Optional[float]
    resolution: Optional[str]
    fps: Optional[float]
    video_codec: Optional[str]
    audio_codec: Optional[str]
    audio_sample_rate: Optional[int]
    bitrate_kbps: Optional[int]
    is_protected: bool
    protection_seal: Optional[str]
    watermark_strength: float
    created_at: datetime
    fingerprint: Optional[MediaFingerprintResponse] = None

    class Config:
        from_attributes = True
