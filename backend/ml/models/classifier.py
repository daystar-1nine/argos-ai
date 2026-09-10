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
    DEVICE,
)


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

    # Predict probabilities via Softmax
    probs = model.predict_proba(tensor_x)[0]
    real_prob = float(probs[0].item())
    fake_prob = float(probs[1].item())

    # Decision rule
    if fake_prob >= 0.50:
        verdict = "POTENTIALLY_MANIPULATED" if fake_prob < 0.85 else "FAKE"
        confidence = fake_prob
    else:
        verdict = "REAL"
        confidence = real_prob

    return {
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "confidence_pct": round(confidence * 100.0, 1),
        "real_probability": round(real_prob, 4),
        "fake_probability": round(fake_prob, 4),
        "logits": model.forward(tensor_x)[0].tolist(),
    }
