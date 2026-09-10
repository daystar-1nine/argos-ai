"""
ARGOS AI - Schemas Package
"""

from app.schemas.auth import UserCreate, UserLogin, UserResponse, TokenResponse
from app.schemas.media import MediaUploadResponse, MediaAssetResponse, MediaFingerprintResponse
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisStatusResponse,
    AnalysisResultResponse,
    AnalysisWindowResponse,
    EvidenceFrameResponse,
)
from app.schemas.report import ReportCreateRequest, ReportResponse
from app.schemas.detection import DetectionResponse, MonitoringSourceResponse

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "MediaUploadResponse",
    "MediaAssetResponse",
    "MediaFingerprintResponse",
    "AnalysisCreateRequest",
    "AnalysisStatusResponse",
    "AnalysisResultResponse",
    "AnalysisWindowResponse",
    "EvidenceFrameResponse",
    "ReportCreateRequest",
    "ReportResponse",
    "DetectionResponse",
    "MonitoringSourceResponse",
]
