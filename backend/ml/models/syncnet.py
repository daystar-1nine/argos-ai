"""
ARGOS AI - Audio-Visual SyncNet Synchronization Model
Deep neural architecture measuring temporal alignment between visual lip sequences
and acoustic Mel-spectrograms.
"""

import os
from pathlib import Path
from typing import Tuple, Optional, Dict, Any
import torch
import torch.nn as nn
import torch.nn.functional as F

from ml.config import (
    SYNCNET_WEIGHTS_PATH,
    EMBEDDING_DIM,
    DEVICE,
)


class VisualLipEncoder(nn.Module):
    """
    Spatiotemporal 3D Convolutional Network encoding a 20-frame sequence of 96x96
    lip crops into a normalized 256-dimensional viseme embedding.
    """

    def __init__(self, embedding_dim: int = EMBEDDING_DIM):
        super().__init__()
        # Input: (B, 1, T=20, H=96, W=96)
        self.conv1 = nn.Sequential(
            nn.Conv3d(1, 32, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=(1, 2, 2), stride=(1, 2, 2)),  # (20, 48, 48)
        )
        self.conv2 = nn.Sequential(
            nn.Conv3d(32, 64, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2)),  # (10, 24, 24)
        )
        self.conv3 = nn.Sequential(
            nn.Conv3d(64, 128, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2)),  # (5, 12, 12)
        )
        self.conv4 = nn.Sequential(
            nn.Conv3d(128, 256, kernel_size=(3, 3, 3), padding=(1, 1, 1)),
            nn.BatchNorm3d(256),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool3d((1, 1, 1)),  # (1, 1, 1)
        )
        self.fc = nn.Sequential(
            nn.Linear(256, embedding_dim),
            nn.LayerNorm(embedding_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (B, T, 1, H, W) -> permute to (B, 1, T, H, W)
        if x.dim() == 5 and x.size(2) == 1:
            x = x.permute(0, 2, 1, 3, 4)

        feat = self.conv1(x)
        feat = self.conv2(feat)
        feat = self.conv3(feat)
        feat = self.conv4(feat)
        feat = feat.view(feat.size(0), -1)
        embedding = self.fc(feat)
        # L2 unit normalization
        return F.normalize(embedding, p=2, dim=-1)


class AudioSpectrogramEncoder(nn.Module):
    """
    2D Convolutional Network encoding an 80x80 Mel-spectrogram chunk
    into a normalized 256-dimensional phoneme embedding.
    """

    def __init__(self, embedding_dim: int = EMBEDDING_DIM):
        super().__init__()
        # Input: (B, 1, 80, 80)
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),  # (40, 40)
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),  # (20, 20)
        )
        self.conv3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),  # (10, 10)
        )
        self.conv4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),  # (1, 1)
        )
        self.fc = nn.Sequential(
            nn.Linear(256, embedding_dim),
            nn.LayerNorm(embedding_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.conv1(x)
        feat = self.conv2(feat)
        feat = self.conv3(feat)
        feat = self.conv4(feat)
        feat = feat.view(feat.size(0), -1)
        embedding = self.fc(feat)
        # L2 unit normalization
        return F.normalize(embedding, p=2, dim=-1)


class SyncNet(nn.Module):
    """
    Multimodal Audio-Visual SyncNet:
    Computes cross-modal cosine similarity score S in [0.0, 1.0] for time-aligned windows.
    """

    def __init__(self, embedding_dim: int = EMBEDDING_DIM):
        super().__init__()
        self.visual_encoder = VisualLipEncoder(embedding_dim)
        self.audio_encoder = AudioSpectrogramEncoder(embedding_dim)

    def forward(self, lip_seq: torch.Tensor, audio_mel: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        v_emb = self.visual_encoder(lip_seq)
        a_emb = self.audio_encoder(audio_mel)
        return v_emb, a_emb

    def compute_sync_score(self, lip_seq: torch.Tensor, audio_mel: torch.Tensor) -> torch.Tensor:
        """
        Computes cosine similarity between visual and audio embeddings.
        Returns tensor of scores calibrated to [0.0, 1.0].
        """
        v_emb, a_emb = self.forward(lip_seq, audio_mel)
        # Cosine similarity in [-1.0, 1.0]
        cos_sim = torch.sum(v_emb * a_emb, dim=-1)
        # Calibrate to [0.0, 1.0]
        score = torch.clamp((cos_sim + 1.0) / 2.0, 0.0, 1.0)
        return score


def load_syncnet_model(
    weights_path: Optional[Path] = SYNCNET_WEIGHTS_PATH, 
    device: torch.device = DEVICE
) -> Tuple[SyncNet, bool]:
    """
    Loads SyncNet model, transfers to target device (CUDA or CPU),
    and loads weights if present.
    Returns (model, weights_loaded: bool).
    """
    model = SyncNet(EMBEDDING_DIM).to(device)
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
            print(f"[ARGOS ML] Warning: Could not load SyncNet weights from {weights_path}: {e}")

    return model, weights_loaded
