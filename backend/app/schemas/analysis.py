"""
ARGOS AI - Deepfake Analysis, Windows & Evidence Schemas
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class AnalysisCreateRequest(BaseModel):
    asset_id: str


class AnalysisWindowResponse(BaseModel):
    id: str
    analysis_id: str
    window_index: int
    start_sec: float
    end_sec: float
    start_frame: int
    end_frame: int
    sync_score: float
    risk_level: str
    anomaly_reason: Optional[str]

    class Config:
        from_attributes = True


class EvidenceFrameResponse(BaseModel):
    id: str
    analysis_id: str
    frame_index: int
    timestamp_sec: float
    timestamp_formatted: str
    risk_pct: float
    reason: str
    filename: str
    file_path: str

    class Config:
        from_attributes = True


class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    status: str  # queued, preprocessing, extracting_features, analyzing_sync, temporal_analysis, classifying, generating_evidence, completed, failed
    progress: int
    current_stage: str
    error_message: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


class AnalysisResultResponse(BaseModel):
    analysis_id: str
    asset_id: str
    status: str
    verdict: Optional[str]
    confidence: Optional[float]
    real_probability: Optional[float]
    fake_probability: Optional[float]
    visual_score: Optional[float]
    audio_score: Optional[float]
    sync_score: Optional[float]
    temporal_mismatch_ms: Optional[str]
    suspicious_windows: List[AnalysisWindowResponse] = []
    evidence_frames: List[EvidenceFrameResponse] = []
    metadata: Dict[str, Any] = {}
    model: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True
