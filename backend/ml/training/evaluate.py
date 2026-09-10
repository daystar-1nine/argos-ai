"""
ARGOS AI - Model Evaluation & Metrics Tracking
Computes accuracy, precision, recall, F1, ROC-AUC, and confusion matrix.
"""

from typing import Dict, Any, Tuple
import numpy as np
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

from ml.models.classifier import MultimodalDeepfakeClassifier


def evaluate_model(
    model: MultimodalDeepfakeClassifier,
    dataloader: DataLoader,
    device: torch.device,
) -> Dict[str, Any]:
    """
    Evaluates deepfake classifier on test/val set and computes full metrics suite.
    """
    model.eval()
    all_preds: list[int] = []
    all_targets: list[int] = []
    all_probs: list[float] = []

    with torch.no_grad():
        for batch_x, batch_y in dataloader:
            batch_x = batch_x.to(device)
            probs = model.predict_proba(batch_x)
            preds = torch.argmax(probs, dim=-1)

            all_preds.extend(preds.cpu().numpy().tolist())
            all_targets.extend(batch_y.numpy().tolist())
            all_probs.extend(probs[:, 1].cpu().numpy().tolist())

    if len(all_targets) == 0:
        return {"error": "Empty evaluation dataset."}

    y_true = np.array(all_targets)
    y_pred = np.array(all_preds)
    y_scores = np.array(all_probs)

    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))

    try:
        auc = float(roc_auc_score(y_true, y_scores))
    except ValueError:
        auc = 0.5  # Only 1 class present

    cm = confusion_matrix(y_true, y_pred).tolist()

    return {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": cm,
        "total_evaluated": len(y_true),
    }
