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
        Computes calibrated cross-modal audio-visual synchronization score.
        Combines deep neural embeddings with temporal viseme-phoneme energy alignment.
        """
        v_emb, a_emb = self.forward(lip_seq, audio_mel)
        cos_sim = torch.sum(v_emb * a_emb, dim=-1)
        base_score = torch.clamp((cos_sim + 1.0) / 2.0, 0.0, 1.0)

        # Temporal viseme-phoneme alignment
        try:
            # audio_mel: (B, 1, 80, 80) -> temporal energy (B, 80) -> pooled to (B, 20)
            a_energy = audio_mel.squeeze(1).mean(dim=1)  # (B, 80)
            if a_energy.size(-1) >= 20:
                a_energy_down = F.adaptive_avg_pool1d(a_energy.unsqueeze(1), 20).squeeze(1)  # (B, 20)
            else:
                a_energy_down = a_energy

            # lip_seq: (B, 1, 20, 96, 96) or (B, 20, 1, 96, 96)
            # Ensure shape is (B, 20, 96, 96)
            if lip_seq.dim() == 5:
                if lip_seq.size(1) == 20:
                    lip_20 = lip_seq.squeeze(2)  # (B, 20, 96, 96)
                elif lip_seq.size(2) == 20:
                    lip_20 = lip_seq.squeeze(1)  # (B, 20, 96, 96)
                else:
                    lip_20 = lip_seq.view(lip_seq.size(0), 20, 96, 96)
            else:
                lip_20 = lip_seq

            # Mouth opening cavity is darker than skin, so invert to represent opening extent
            v_motion = -lip_20.mean(dim=(-1, -2))  # (B, 20)

            v_std = torch.std(v_motion, dim=-1, keepdim=True) + 1e-5
            a_std = torch.std(a_energy_down, dim=-1, keepdim=True) + 1e-5
            v_norm = (v_motion - torch.mean(v_motion, dim=-1, keepdim=True)) / v_std
            a_norm = (a_energy_down - torch.mean(a_energy_down, dim=-1, keepdim=True)) / a_std

            # Pearson temporal correlation in [-1.0, 1.0]
            temporal_corr = torch.mean(v_norm * a_norm, dim=-1)
            temporal_score = torch.clamp((temporal_corr + 1.0) / 2.0, 0.0, 1.0)

            # Fused score
            score = 0.35 * base_score + 0.65 * temporal_score
        except Exception:
            score = base_score

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
