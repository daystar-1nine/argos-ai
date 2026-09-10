"""
ARGOS AI - PyTorch Training Loop for Multimodal Deepfake Classifier
"""

from typing import Dict, Any, Optional
from pathlib import Path
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from ml.config import (
    DEVICE,
    CLASSIFIER_INPUT_DIM,
    CLASSIFIER_WEIGHTS_PATH,
)
from ml.models.classifier import MultimodalDeepfakeClassifier
from ml.training.dataset import DeepfakeFeatureDataset
from ml.training.evaluate import evaluate_model
from ml.training.config import (
    BATCH_SIZE,
    LEARNING_RATE,
    WEIGHT_DECAY,
    EPOCHS,
)


def train_classifier(
    train_dataset: DeepfakeFeatureDataset,
    val_dataset: DeepfakeFeatureDataset,
    output_checkpoint_path: Path = CLASSIFIER_WEIGHTS_PATH,
    epochs: int = EPOCHS,
    lr: float = LEARNING_RATE,
    batch_size: int = BATCH_SIZE,
    device: torch.device = DEVICE,
) -> Dict[str, Any]:
    """
    Trains the Multimodal Deepfake Classifier with validation checkpointing.
    """
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    model = MultimodalDeepfakeClassifier(CLASSIFIER_INPUT_DIM).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=WEIGHT_DECAY)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_f1 = -1.0
    best_metrics = {}
    history = []

    for epoch in range(1, epochs + 1):
        model.train()
        epoch_loss = 0.0
        n_batches = 0

        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            logits = model(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            n_batches += 1

        scheduler.step()
        avg_loss = epoch_loss / max(1, n_batches)

        # Validation
        val_metrics = evaluate_model(model, val_loader, device)
        f1 = val_metrics.get("f1_score", 0.0)

        history.append({
            "epoch": epoch,
            "train_loss": round(avg_loss, 4),
            "val_f1": f1,
            "val_accuracy": val_metrics.get("accuracy", 0.0),
        })

        if f1 > best_val_f1:
            best_val_f1 = f1
            best_metrics = val_metrics
            # Save checkpoint
            output_checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_f1": f1,
                "input_dim": CLASSIFIER_INPUT_DIM,
            }, output_checkpoint_path)

    # Save training report
    report_path = output_checkpoint_path.parent / "training_metrics.json"
    with open(report_path, "w") as f:
        json.dump({
            "best_val_metrics": best_metrics,
            "history": history,
            "epochs": epochs,
            "samples_trained": len(train_dataset),
        }, f, indent=2)

    return {
        "status": "success",
        "best_f1": best_val_f1,
        "checkpoint": str(output_checkpoint_path),
        "best_metrics": best_metrics,
        "history": history,
    }
