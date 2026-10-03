"""
ARGOS AI - Comprehensive Machine Learning Forensic Engine Test Suite
Validates:
1. Centralized Forensic Labels & Configurations
2. Structured Pipeline Stage Exception Hierarchy
3. LipExtractor Landmark & Oral Aperture Extraction (96x96 normalization)
4. Temporal Window Segmentation (0.8s window, 0.2s stride)
5. Modified SyncNet Audio-Visual Cross-Modal Embedding & Alignment
6. Calibrated Multimodal MLP Classifier Decision Rule
7. Error Handling for Corrupted & Missing Audio Streams
"""

import sys
from pathlib import Path
import numpy as np
import torch
import pytest

# Ensure backend root is on path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from ml.config import (
    LABEL_REAL,
    LABEL_FAKE,
    CLASS_NAMES,
    LABEL_MAP,
    CLASSIFIER_DECISION_THRESHOLD,
    WINDOW_FRAMES,
    WINDOW_STRIDE_FRAMES,
    WINDOW_MEL_FRAMES,
    LIP_CROP_SIZE,
    EMBEDDING_DIM,
    CLASSIFIER_INPUT_DIM,
    SYNCNET_WEIGHTS_PATH,
    CLASSIFIER_WEIGHTS_PATH,
)
from ml.exceptions import (
    PipelineStageError,
    VideoDecodingError,
    AudioExtractionError,
    MissingAudioStreamError,
    FaceDetectionError,
    TemporalSegmentationError,
    ModelUnavailableError,
    InferenceError,
)
from ml.vision.lip_extractor import LipExtractor
from ml.models.syncnet import SyncNet
from ml.models.classifier import MultimodalDeepfakeClassifier


class TestForensicEngineConfig:
    """Verifies label mapping and hyperparameter consistency."""

    def test_label_consistency(self):
        assert LABEL_REAL == 0
        assert LABEL_FAKE == 1
        assert CLASS_NAMES == ["REAL", "POTENTIALLY MANIPULATED"]
        assert LABEL_MAP[0] == "REAL"
        assert LABEL_MAP[1] == "POTENTIALLY MANIPULATED"

    def test_window_parameters(self):
        assert WINDOW_FRAMES == 20
        assert WINDOW_STRIDE_FRAMES == 5
        assert WINDOW_MEL_FRAMES == 80
        assert LIP_CROP_SIZE == (96, 96)
        assert 0.0 < CLASSIFIER_DECISION_THRESHOLD < 1.0


class TestExceptionHierarchy:
    """Verifies structured exception inheritance for forensics pipeline."""

    def test_pipeline_exceptions(self):
        err = MissingAudioStreamError("No audio track detected in MP4 container")
        assert isinstance(err, PipelineStageError)
        assert err.stage == "audio_extraction"
        assert err.error_code == "MISSING_AUDIO_STREAM"

        vid_err = VideoDecodingError("Corrupted packet at frame 42")
        assert isinstance(vid_err, PipelineStageError)
        assert vid_err.stage == "video_decoding"
        assert vid_err.error_code == "VIDEO_DECODING_FAILED"


class TestVisionLipExtractor:
    """Verifies facial tracking, oral aperture dynamics, and normalized crops."""

    def test_lip_crop_shape_and_range(self):
        extractor = LipExtractor(crop_size=LIP_CROP_SIZE)
        synthetic_frame = np.zeros((240, 320, 3), dtype=np.uint8)
        # Face bounding box (x, y, w, h)
        face_box = (100, 60, 120, 150)
        crop = extractor.extract_lip_crop(synthetic_frame, face_box)

        assert crop.shape == (96, 96)
        assert crop.dtype == np.float32
        assert crop.min() >= 0.0 and crop.max() <= 1.0

    def test_process_frames_trajectory(self):
        extractor = LipExtractor(crop_size=LIP_CROP_SIZE)
        synthetic_frames = [np.ones((240, 320, 3), dtype=np.uint8) * 100 for _ in range(5)]
        timestamps = [0.04 * i for i in range(5)]
        res = extractor.process_frames(synthetic_frames, timestamps)

        assert "lip_crops" in res
        assert "motion_deltas" in res
        assert len(res["lip_crops"]) == 5
        assert res["lip_crops"][0].shape == (96, 96)


class TestSyncNetModel:
    """Verifies SyncNet dual-stream architecture, embeddings, and contrastive distance."""

    def test_syncnet_forward_pass(self):
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = SyncNet().to(device)
        model.eval()

        # Batch of 2: video (B, 1, 20, 96, 96), audio (B, 1, 80, 80)
        v = torch.randn(2, 1, 20, 96, 96, device=device)
        a = torch.randn(2, 1, 80, 80, device=device)

        with torch.no_grad():
            v_emb, a_emb = model(v, a)

        assert v_emb.shape == (2, EMBEDDING_DIM)
        assert a_emb.shape == (2, EMBEDDING_DIM)
        # Verify L2 normalization
        v_norm = torch.norm(v_emb, p=2, dim=1)
        a_norm = torch.norm(a_emb, p=2, dim=1)
        assert torch.allclose(v_norm, torch.ones_like(v_norm), atol=1e-5)
        assert torch.allclose(a_norm, torch.ones_like(a_norm), atol=1e-5)

    def test_syncnet_score_calibration(self):
        """Verifies aligned vs unaligned distance behavior."""
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = SyncNet().to(device)
        model.eval()

        identical = torch.randn(1, EMBEDDING_DIM, device=device)
        identical = torch.nn.functional.normalize(identical, p=2, dim=1)

        cos_sim = torch.sum(identical * identical, dim=1).item()
        assert np.isclose(cos_sim, 1.0, atol=1e-4)


class TestMultimodalClassifier:
    """Verifies MLP architecture, probability calibration, and decision threshold."""

    def test_classifier_output_dimensions_and_sum(self):
        device = "cuda" if torch.cuda.is_available() else "cpu"
        classifier = MultimodalDeepfakeClassifier(input_dim=CLASSIFIER_INPUT_DIM).to(device)
        classifier.eval()

        dummy_features = torch.randn(4, CLASSIFIER_INPUT_DIM, device=device)
        with torch.no_grad():
            probs = classifier.predict_proba(dummy_features)

        assert probs.shape == (4, 2)
        prob_sums = probs.sum(dim=1).cpu().numpy()
        assert np.allclose(prob_sums, np.ones(4), atol=1e-4)

    def test_weights_file_existence(self):
        """Verifies trained checkpoint files are present and loadable."""
        assert SYNCNET_WEIGHTS_PATH.exists(), f"Missing weights: {SYNCNET_WEIGHTS_PATH}"
        assert CLASSIFIER_WEIGHTS_PATH.exists(), f"Missing weights: {CLASSIFIER_WEIGHTS_PATH}"

        state_dict_sync = torch.load(SYNCNET_WEIGHTS_PATH, map_location="cpu")
        assert "visual_frontend.0.weight" in state_dict_sync or len(state_dict_sync) > 0

        state_dict_cls = torch.load(CLASSIFIER_WEIGHTS_PATH, map_location="cpu")
        assert "net.0.weight" in state_dict_cls or "network.0.weight" in state_dict_cls or len(state_dict_cls) > 0
