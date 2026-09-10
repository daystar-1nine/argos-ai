"""
ARGOS AI Multimodal Deepfake & Temporal Lip-Sync Detection Engine
"""

from .config import (
    VIDEO_SAMPLE_FPS,
    LIP_CROP_SIZE,
    AUDIO_SAMPLE_RATE,
    WINDOW_FRAMES,
    WINDOW_STRIDE_FRAMES,
    DEVICE,
    DEVICE_NAME,
)

__all__ = [
    "VIDEO_SAMPLE_FPS",
    "LIP_CROP_SIZE",
    "AUDIO_SAMPLE_RATE",
    "WINDOW_FRAMES",
    "WINDOW_STRIDE_FRAMES",
    "DEVICE",
    "DEVICE_NAME",
]
