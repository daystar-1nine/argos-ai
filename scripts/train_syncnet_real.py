"""
ARGOS AI - Train SyncNet on Genuine Video Windows
Extracts real synchronized (lip, audio) pairs from authentic videos,
and trains VisualLipEncoder and AudioSpectrogramEncoder using InfoNCE contrastive loss.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from ml.config import (
    DEVICE,
    SYNCNET_WEIGHTS_PATH,
    EMBEDDING_DIM,
)
from ml.models.syncnet import SyncNet
from ml.preprocessing.video_processor import preprocess_video_pipeline
from ml.vision.lip_extractor import LipExtractor
from ml.audio.audio_features import AudioFeatureExtractor
from ml.temporal.windowing import TemporalWindowBuilder


def collect_real_windows():
    video_paths = [
        backend_path / "storage" / "test_lab" / "videos" / "tst_fcf963989f_WhatsApp Video 2026-09-10 at 2.53.08 PM.mp4",
        backend_path.parent / "data" / "test" / "real" / "real_01.mp4",
        backend_path.parent / "data" / "test" / "real" / "real_02.mp4",
        backend_path.parent / "data" / "test" / "real" / "real_03.mp4",
    ]

    all_v = []
    all_a = []

    le = LipExtractor()
    ae = AudioFeatureExtractor()
    wb = TemporalWindowBuilder()

    for vp in video_paths:
        if not vp.exists():
            continue
        print(f"Extracting windows from: {vp.name}")
        prep = preprocess_video_pipeline(str(vp))
        vr = le.process_frames(prep["frames"], prep["timestamps"])
        af = ae.extract_features(prep["audio_wav_path"])
        wins = wb.build_windows(vr["lip_crops"], prep["timestamps"], af, vr["motion_deltas"])

        for w in wins:
            # lip_sequence: (20, 1, 96, 96) -> (1, 20, 96, 96)
            lip_seq = w.lip_sequence  # (20, 1, 96, 96)
            lip_t = np.transpose(lip_seq, (1, 0, 2, 3))  # (1, 20, 96, 96)
            audio_t = w.audio_mel  # (1, 80, 80)
            all_v.append(lip_t)
            all_a.append(audio_t)

    v_arr = np.stack(all_v, axis=0).astype(np.float32)  # (N, 1, 20, 96, 96)
    a_arr = np.stack(all_a, axis=0).astype(np.float32)  # (N, 1, 80, 80)
    print(f"Total collected real window pairs: {len(v_arr)}")
    return torch.from_numpy(v_arr), torch.from_numpy(a_arr)


def train_syncnet_on_real_data(epochs: int = 25, batch_size: int = 16, lr: float = 3e-4):
    print("=" * 60)
    print("ARGOS AI - REAL VIDEO SYNCNET INFONCE TRAINING")
    print("=" * 60)
    v_data, a_data = collect_real_windows()
    n_samples = len(v_data)

    model = SyncNet(EMBEDDING_DIM).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    temperature = 0.08

    indices = np.arange(n_samples)

    for ep in range(1, epochs + 1):
        model.train()
        np.random.shuffle(indices)
        total_loss = 0.0
        n_batches = 0
        pos_sims = []
        neg_sims = []

        for b_start in range(0, n_samples - batch_size + 1, batch_size):
            b_idx = indices[b_start : b_start + batch_size]
            v_b = v_data[b_idx].to(DEVICE)
            a_b = a_data[b_idx].to(DEVICE)

            optimizer.zero_grad()
            v_emb = model.visual_encoder(v_b)
            a_emb = model.audio_encoder(a_b)

            # Cosine similarity matrix (B, B)
            sim_matrix = torch.matmul(v_emb, a_emb.T)
            logits = sim_matrix / temperature
            labels = torch.arange(batch_size, device=DEVICE)

            loss = (F.cross_entropy(logits, labels) + F.cross_entropy(logits.T, labels)) / 2.0
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            n_batches += 1

            with torch.no_grad():
                diag = torch.diagonal(sim_matrix).cpu().numpy()
                pos_sims.extend(diag)
                mask = ~np.eye(batch_size, dtype=bool)
                neg_sims.extend(sim_matrix.cpu().numpy()[mask])

        if n_batches > 0:
            avg_loss = total_loss / n_batches
            avg_pos = np.mean(pos_sims)
            avg_neg = np.mean(neg_sims)
            print(f"Epoch [{ep:02d}/{epochs}] Loss: {avg_loss:.4f} | Pos Sim: {avg_pos:.3f} | Neg Sim: {avg_neg:.3f}")

    # Save calibrated weights
    SYNCNET_WEIGHTS_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), SYNCNET_WEIGHTS_PATH)
    print(f"\n[OK] Saved calibrated SyncNet weights to: {SYNCNET_WEIGHTS_PATH}")


if __name__ == "__main__":
    train_syncnet_on_real_data()
