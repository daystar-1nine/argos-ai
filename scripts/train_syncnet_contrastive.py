"""
ARGOS AI - Vectorized Contrastive SyncNet Training Script
Quickly calibrates VisualLipEncoder and AudioSpectrogramEncoder using contrastive cosine loss.
"""

import sys
from pathlib import Path
import torch
import torch.nn as nn
import numpy as np

# Ensure backend in sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from ml.config import (
    DEVICE,
    SYNCNET_WEIGHTS_PATH,
    EMBEDDING_DIM,
    WINDOW_FRAMES,
    LIP_CROP_SIZE,
    N_MELS,
    WINDOW_MEL_FRAMES,
)
from ml.models.syncnet import SyncNet

# Precompute spatial coordinate grid once (96x96)
_Y, _X = np.ogrid[:96, :96]
_DIST_SQ = ((_Y - 48) ** 2) / 144.0 + ((_X - 48) ** 2) / 400.0
_LIP_MASK = (_DIST_SQ <= 1.0).astype(np.float32)


def generate_contrastive_batch(batch_size: int = 16):
    """Vectorized contrastive batch generator."""
    half = batch_size // 2

    v_batch = np.zeros((batch_size, 1, WINDOW_FRAMES, 96, 96), dtype=np.float32)
    a_batch = np.zeros((batch_size, 1, N_MELS, WINDOW_MEL_FRAMES), dtype=np.float32)
    labels = np.ones(batch_size, dtype=np.float32)

    t_v = np.linspace(0, 0.8, WINDOW_FRAMES)  # 20 frames = 0.8s
    t_a = np.linspace(0, 0.8, WINDOW_MEL_FRAMES)  # 80 mel frames = 0.8s

    for i in range(half):
        freq = np.random.uniform(1.8, 3.0)
        phase = np.random.uniform(0, np.pi)

        # In-phase visual modulation
        mod_v = 0.5 * (1.0 + np.sin(2 * np.pi * freq * t_v + phase))  # (20,)
        for t in range(WINDOW_FRAMES):
            v_batch[i, 0, t] = _LIP_MASK * mod_v[t]

        # In-phase audio modulation (bands 10..50)
        mod_a = 0.5 * (1.0 + np.sin(2 * np.pi * freq * t_a + phase))  # (80,)
        a_batch[i, 0, 10:50, :] = mod_a[None, :] * np.random.uniform(0.8, 1.2)
        labels[i] = 1.0

    for i in range(half, batch_size):
        freq = np.random.uniform(1.8, 3.0)
        phase = np.random.uniform(0, np.pi)
        phase_shifted = phase + np.random.uniform(1.6, 3.14)

        mod_v = 0.5 * (1.0 + np.sin(2 * np.pi * freq * t_v + phase))
        for t in range(WINDOW_FRAMES):
            v_batch[i, 0, t] = _LIP_MASK * mod_v[t]

        mod_a = 0.5 * (1.0 + np.sin(2 * np.pi * freq * t_a + phase_shifted))
        a_batch[i, 0, 10:50, :] = mod_a[None, :] * np.random.uniform(0.8, 1.2)
        labels[i] = -1.0

    return (
        torch.from_numpy(v_batch),
        torch.from_numpy(a_batch),
        torch.from_numpy(labels),
    )


def train_syncnet(epochs: int = 15, batches_per_epoch: int = 6, batch_size: int = 16):
    import torch.nn.functional as F
    print("=" * 60)
    print("ARGOS AI - CONTRASTIVE SYNCNET INFONCE CALIBRATION")
    print("=" * 60)
    print(f"Device: {DEVICE}")

    model = SyncNet(EMBEDDING_DIM).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    temperature = 0.07

    for ep in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        pos_sims = []
        neg_sims = []

        for _ in range(batches_per_epoch):
            # Generate batch of positive pairs
            v, a = generate_contrastive_batch(batch_size=batch_size * 2)[:2]
            v = v[:batch_size].to(DEVICE)
            a = a[:batch_size].to(DEVICE)

            optimizer.zero_grad()
            v_emb = model.visual_encoder(v)
            a_emb = model.audio_encoder(a)

            # Symmetrical InfoNCE loss across batch
            logits = torch.matmul(v_emb, a_emb.T) / temperature
            labels = torch.arange(batch_size, device=DEVICE)
            loss = (F.cross_entropy(logits, labels) + F.cross_entropy(logits.T, labels)) / 2.0
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            with torch.no_grad():
                sim_matrix = torch.matmul(v_emb, a_emb.T).cpu().numpy()
                pos_sims.extend(sim_matrix.diagonal())
                mask = ~np.eye(batch_size, dtype=bool)
                neg_sims.extend(sim_matrix[mask])

        pos_score = float(np.mean(pos_sims))
        neg_score = float(np.mean(neg_sims))
        print(f"Epoch [{ep:02d}/{epochs}] Loss: {total_loss/batches_per_epoch:.4f} | Pos Sim: {pos_score:.3f} | Neg Sim: {neg_score:.3f}")

    SYNCNET_WEIGHTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), SYNCNET_WEIGHTS_PATH)
    print(f"\n[OK] Saved calibrated SyncNet weights to: {SYNCNET_WEIGHTS_PATH}")


if __name__ == "__main__":
    train_syncnet()
