"""
ARGOS AI - Structured ML Pipeline Exceptions
Defines fine-grained, stage-specific exception classes for all 11 stages of the forensic engine.
Never converts exceptions into fake predictions or hidden failures.
"""

from typing import Dict, Any, Optional


class PipelineStageError(Exception):
    """
    Structured base exception for all ML pipeline stage failures.
    Provides standardized JSON serializable diagnostics for client telemetry.
    """

    def __init__(
        self,
        stage: str,
        error_code: str,
        message: str,
        details: str = "",
        status_code: int = 400,
    ):
        super().__init__(f"[{stage}] {error_code}: {message}")
        self.stage = stage
        self.error_code = error_code
        self.message = message
        self.details = details
        self.status_code = status_code

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stage": self.stage,
            "status": "failed",
            "error_code": self.error_code,
            "message": self.message,
            "details": self.details,
        }


class VideoDecodingError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="video_decoding",
            error_code="VIDEO_DECODING_FAILED",
            message=message,
            details=details,
            status_code=400,
        )


class AudioExtractionError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="audio_extraction",
            error_code="AUDIO_EXTRACTION_FAILED",
            message=message,
            details=details,
            status_code=400,
        )


class MissingAudioStreamError(PipelineStageError):
    def __init__(self, message: str = "Input video contains no audible audio track.", details: str = ""):
        super().__init__(
            stage="audio_extraction",
            error_code="MISSING_AUDIO_STREAM",
            message=message,
            details=details,
            status_code=422,
        )


class FaceDetectionError(PipelineStageError):
    def __init__(self, message: str = "No human face detected in video frames.", details: str = ""):
        super().__init__(
            stage="face_detection",
            error_code="FACE_NOT_DETECTED",
            message=message,
            details=details,
            status_code=422,
        )


class FaceTrackingError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="face_tracking",
            error_code="FACE_TRACKING_FAILED",
            message=message,
            details=details,
            status_code=422,
        )


class LandmarkExtractionError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="landmark_extraction",
            error_code="LANDMARK_EXTRACTION_FAILED",
            message=message,
            details=details,
            status_code=422,
        )


class FeatureExtractionError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="feature_extraction",
            error_code="FEATURE_EXTRACTION_FAILED",
            message=message,
            details=details,
            status_code=500,
        )


class TemporalSegmentationError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="temporal_segmentation",
            error_code="TEMPORAL_WINDOWING_FAILED",
            message=message,
            details=details,
            status_code=422,
        )


class ModelUnavailableError(PipelineStageError):
    def __init__(self, message: str = "Neural model weights are missing or not loaded.", details: str = ""):
        super().__init__(
            stage="model_loading",
            error_code="MODEL_UNAVAILABLE",
            message=message,
            details=details,
            status_code=503,
        )


class InferenceError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="inference",
            error_code="INFERENCE_FAILED",
            message=message,
            details=details,
            status_code=500,
        )


class PostProcessingError(PipelineStageError):
    def __init__(self, message: str, details: str = ""):
        super().__init__(
            stage="post_processing",
            error_code="POST_PROCESSING_FAILED",
            message=message,
            details=details,
            status_code=500,
        )
