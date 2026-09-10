"""
ARGOS AI - Multimodal Deepfake PyTorch Dataset
Loads REAL and FAKE videos or pre-computed temporal feature tensors with leakage prevention.
"""

from typing import List, Tuple, Optional
from pathlib import Path
import numpy as np
import torch
from torch.utils.data import Dataset

from ml.config import CLASSIFIER_INPUT_DIM


class DeepfakeFeatureDataset(Dataset):
    """
    PyTorch Dataset loading extracted 24-dimensional multimodal feature vectors.
    Class 0 = REAL, Class 1 = FAKE.
    """

    def __init__(self, samples: List[Tuple[np.ndarray, int]]):
        self.samples = samples

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        features, label = self.samples[idx]
        return torch.from_numpy(features).float(), torch.tensor(label, dtype=torch.long)


def load_dataset_from_directory(split_dir: Path) -> DeepfakeFeatureDataset:
    """
    Scans split_dir/real and split_dir/fake for pre-computed .npy feature arrays or samples.
    """
    samples: List[Tuple[np.ndarray, int]] = []
    real_dir = split_dir / "real"
    fake_dir = split_dir / "fake"

    if real_dir.exists():
        for f in sorted(real_dir.glob("*.npy")):
            vec = np.load(f)
            if vec.shape[0] == CLASSIFIER_INPUT_DIM:
                samples.append((vec, 0))

    if fake_dir.exists():
        for f in sorted(fake_dir.glob("*.npy")):
            vec = np.load(f)
            if vec.shape[0] == CLASSIFIER_INPUT_DIM:
                samples.append((vec, 1))

    return DeepfakeFeatureDataset(samples)
