"""
ARGOS AI - Machine Learning Configuration & Hyperparameters
Problem Statement 4: Audio-Visual Temporal Lip-Sync & Deepfake Detection
"""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
STATIC_DIR = BASE_DIR / "static"
EVIDENCE_DIR = STATIC_DIR / "evidence"
TEMP_DIR = BASE_DIR / "temp"

# Ensure runtime directories exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Video Processing Parameters
VIDEO_SAMPLE_FPS = 25.0
LIP_CROP_SIZE = (96, 96)  # (width, height) in pixels
MIN_VIDEO_DURATION_SEC = 0.8
MAX_VIDEO_DURATION_SEC = 600.0  # 10 minutes

# Audio Processing Parameters
AUDIO_SAMPLE_RATE = 16000  # Standard 16kHz mono PCM for speech analysis
N_FFT = 512
WIN_LENGTH = 400  # 25ms window at 16kHz
HOP_LENGTH = 160  # 10ms hop at 16kHz (yields 100 mel frames/sec = exactly 4 mel frames per 25fps video frame)
N_MELS = 80  # 80 Mel frequency bands

# Temporal Windowing Parameters
# 20 video frames at 25fps = 0.8s window; 5 video frames = 0.2s stride
WINDOW_FRAMES = int(os.getenv("ARGOS_WINDOW_FRAMES", "20"))
WINDOW_STRIDE_FRAMES = int(os.getenv("ARGOS_WINDOW_STRIDE_FRAMES", "5"))
AUDIO_MEL_FRAMES_PER_VIDEO_FRAME = 4
WINDOW_MEL_FRAMES = WINDOW_FRAMES * AUDIO_MEL_FRAMES_PER_VIDEO_FRAME  # 80 mel frames
WINDOW_DURATION_SEC = WINDOW_FRAMES / VIDEO_SAMPLE_FPS  # 0.8s
WINDOW_STRIDE_SEC = WINDOW_STRIDE_FRAMES / VIDEO_SAMPLE_FPS  # 0.2s

# Forensic Anomaly Thresholds
SYNC_ANOMALY_THRESHOLD = float(os.getenv("ARGOS_SYNC_THRESHOLD", "0.75"))
HIGH_RISK_SYNC_THRESHOLD = float(os.getenv("ARGOS_HIGH_RISK_THRESHOLD", "0.60"))
MIN_ANOMALY_WINDOW_DURATION_SEC = 0.4

# Model Weights Filepaths
SYNCNET_WEIGHTS_PATH = MODELS_DIR / "syncnet.pth"
CLASSIFIER_WEIGHTS_PATH = MODELS_DIR / "classifier.pth"

# Model Architecture Dimensions
EMBEDDING_DIM = 256
CLASSIFIER_INPUT_DIM = 24  # Fused audio-visual and temporal statistics dimension

# Execution Device
import torch
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DEVICE_NAME = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU (Multi-Threaded)"
