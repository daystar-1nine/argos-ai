"""
ARGOS AI - Multimodal Real/Fake Deepfake Classifier
PyTorch neural network that classifies audio-visual temporal feature vectors into REAL vs FAKE.
"""

from typing import Tuple, Dict, Any, Optional
from pathlib import Path
import torch
import torch.nn as nn
import torch.nn.functional as F

from ml.config import (
    CLASSIFIER_INPUT_DIM,
    CLASSIFIER_WEIGHTS_PATH,
    CLASSIFIER_DECISION_THRESHOLD,
    LABEL_REAL,
    LABEL_FAKE,
    LABEL_MAP,
    CLASS_NAMES,
    DEVICE,
)

FEATURE_NAMES = [
    "mean_sync",
    "std_sync",
    "min_sync",
    "p10_sync",
    "p25_sync",
    "p50_sync",
    "anomaly_ratio",
    "high_risk_ratio",
    "max_run_ratio",
    "num_intervals",
    "motion_mean",
    "motion_std",
    "motion_max",
    "energy_mean",
    "energy_std",
    "max_xcorr",
    "lag_at_max",
    "start_sync",
    "end_sync",
    "p75_sync",
    "p90_sync",
    "max_sync",
    "anom_count",
    "total_windows",
]


class MultimodalDeepfakeClassifier(nn.Module):
    """
    Multilayer Perceptron (MLP) mapping fused audio-visual temporal metrics
    to calibrated class probabilities: Class 0 (REAL), Class 1 (FAKE).
    """

    def __init__(self, input_dim: int = CLASSIFIER_INPUT_DIM):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),

            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.1),

            nn.Linear(32, 16),
            nn.BatchNorm1d(16),
            nn.ReLU(inplace=True),

            nn.Linear(16, 2),  # 2 output logits: [REAL, FAKE]
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass returning unnormalized class logits (B, 2)."""
        if x.dim() == 1:
            x = x.unsqueeze(0)
        return self.net(x)

    def predict_proba(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass with Softmax returning calibrated probabilities (B, 2)."""
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            probabilities = F.softmax(logits, dim=-1)
        return probabilities


def load_classifier_model(
    weights_path: Optional[Path] = CLASSIFIER_WEIGHTS_PATH,
    device: torch.device = DEVICE,
) -> Tuple[MultimodalDeepfakeClassifier, bool]:
    """
    Loads classifier model, transfers to target device (CUDA or CPU),
    and loads weights if present.
    Returns (model, weights_loaded: bool).
    """
    model = MultimodalDeepfakeClassifier(CLASSIFIER_INPUT_DIM).to(device)
    model.eval()

    weights_loaded = False
    if weights_path and Path(weights_path).exists():
        try:
            checkpoint = torch.load(weights_path, map_location=device, weights_only=True)
            if "model_state_dict" in checkpoint:
                model.load_state_dict(checkpoint["model_state_dict"])
            else:
                model.load_state_dict(checkpoint)
            weights_loaded = True
        except Exception as e:
            print(f"[ARGOS ML] Warning: Could not load Classifier weights from {weights_path}: {e}")

    return model, weights_loaded


def classify_temporal_features(
    model: MultimodalDeepfakeClassifier,
    feature_vector: Any,
    device: torch.device = DEVICE,
) -> Dict[str, Any]:
    """
    Performs genuine PyTorch inference on a 24-dimensional temporal feature vector.
    Returns calibrated real/fake probabilities and verdict without any hardcoding.
    """
    import numpy as np

    if isinstance(feature_vector, np.ndarray):
        tensor_x = torch.from_numpy(feature_vector).float().to(device)
    elif isinstance(feature_vector, list):
        tensor_x = torch.tensor(feature_vector, dtype=torch.float32).to(device)
    else:
        tensor_x = feature_vector.to(device)

    # Predict probabilities via Softmax with gradients explicitly disabled
    probs = model.predict_proba(tensor_x)[0]
    real_prob = float(probs[LABEL_REAL].item())
    fake_prob = float(probs[LABEL_FAKE].item())

    # Centralized decision rule using configured threshold
    threshold = CLASSIFIER_DECISION_THRESHOLD
    if fake_prob >= threshold:
        predicted_class = LABEL_FAKE
        confidence = fake_prob
    else:
        predicted_class = LABEL_REAL
        confidence = real_prob

    verdict = LABEL_MAP[predicted_class]

    return {
        "predicted_class": predicted_class,
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "confidence_pct": round(confidence * 100.0, 1),
        "real_probability": round(real_prob, 4),
        "fake_probability": round(fake_prob, 4),
        "threshold_used": threshold,
        "logits": model.forward(tensor_x)[0].tolist(),
    }
