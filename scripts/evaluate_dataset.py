"""
ARGOS AI - Batch Dataset Evaluation & Metrics CLI
Usage:
    python scripts/evaluate_dataset.py --real data/test/real --fake data/test/fake [--output-dir results/]
"""

import os
import sys
import csv
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np

# Ensure backend in sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from ml.evaluation.evaluator import VideoEvaluator, SUPPORTED_VIDEO_EXTENSIONS


def parse_args():
    parser = argparse.ArgumentParser(
        description="ARGOS AI - Multimodal Deepfake Dataset Benchmark & Evaluation"
    )
    parser.add_argument(
        "--real",
        type=str,
        required=True,
        help="Directory containing authentic (real) ground-truth test videos",
    )
    parser.add_argument(
        "--fake",
        type=str,
        required=True,
        help="Directory containing manipulated (fake) ground-truth test videos",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="results",
        help="Directory to save evaluation_results.csv, metrics JSON, and per-video artifacts",
    )
    return parser.parse_args()


def discover_video_files(directory: Path) -> List[Path]:
    """Finds all supported media files in directory."""
    if not directory.exists():
        return []
    videos = []
    for f in sorted(directory.iterdir()):
        if f.is_file() and f.suffix.lower() in SUPPORTED_VIDEO_EXTENSIONS:
            videos.append(f)
    return videos


def compute_metrics(
    records: List[Dict[str, Any]]
) -> Tuple[Dict[str, Any], np.ndarray]:
    """
    Computes genuine evaluation metrics from inference records:
    Accuracy, Precision, Recall, F1 Score, ROC-AUC, and Confusion Matrix.
    Class 0 = Real (Negative), Class 1 = Fake (Positive)
    """
    y_true: List[int] = []
    y_pred: List[int] = []
    y_scores: List[float] = []

    for r in records:
        if r["status"] != "completed":
            continue

        gt = 1 if r["ground_truth"].lower() == "fake" else 0
        pred_verdict = r["prediction"].lower()
        pred = 1 if pred_verdict in ["fake", "potentially_manipulated"] else 0

        y_true.append(gt)
        y_pred.append(pred)
        # Use fake_probability as continuous score for ROC-AUC
        y_scores.append(float(r.get("fake_probability", 0.5)))

    total = len(y_true)
    if total == 0:
        return {
            "total_tested": 0,
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "roc_auc": 0.0,
        }, np.zeros((2, 2), dtype=int)

    # Confusion matrix:
    # rows: Actual [Real, Fake], cols: Predicted [Real, Fake]
    cm = np.zeros((2, 2), dtype=int)
    for t, p in zip(y_true, y_pred):
        cm[t, p] += 1

    tn, fp = cm[0, 0], cm[0, 1]
    fn, tp = cm[1, 0], cm[1, 1]

    accuracy = (tp + tn) / total if total > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else (1.0 if (fn == 0 and tp > 0) else 0.0)
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    # Calculate ROC-AUC if both classes exist
    roc_auc = 0.5
    try:
        from sklearn.metrics import roc_auc_score
        if len(set(y_true)) > 1:
            roc_auc = float(roc_auc_score(y_true, y_scores))
        else:
            roc_auc = 1.0 if accuracy == 1.0 else 0.5
    except Exception:
        roc_auc = 0.5

    metrics = {
        "total_tested": total,
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": cm.tolist(),
    }
    return metrics, cm


def main():
    args = parse_args()
    real_dir = Path(args.real).resolve()
    fake_dir = Path(args.fake).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    real_videos = discover_video_files(real_dir)
    fake_videos = discover_video_files(fake_dir)

    all_jobs: List[Tuple[Path, str]] = []
    for rv in real_videos:
        all_jobs.append((rv, "real"))
    for fv in fake_videos:
        all_jobs.append((fv, "fake"))

    if not all_jobs:
        print(f"[ERROR] No valid test videos found in {real_dir} or {fake_dir}")
        sys.exit(1)

    print("\n" + "=" * 65)
    print("ARGOS AI — BATCH DATASET EVALUATION & BENCHMARK")
    print("=" * 65)
    print(f"Real Videos: {len(real_videos)} from {real_dir}")
    print(f"Fake Videos: {len(fake_videos)} from {fake_dir}")
    print(f"Output Dir:  {output_dir}")
    print("=" * 65 + "\n")

    evaluator = VideoEvaluator()
    records: List[Dict[str, Any]] = []

    for idx, (vpath, ground_truth) in enumerate(all_jobs, 1):
        print(f"[{idx:02d}/{len(all_jobs):02d}] Evaluating {vpath.name} (Ground Truth: {ground_truth.upper()})...", end="", flush=True)

        res = evaluator.evaluate(
            video_path=str(vpath),
            ground_truth=ground_truth,
            output_dir=output_dir,
        )

        status = res.get("status", "unknown")
        if status == "completed":
            dur = res["processing"]["duration_seconds"]
            pred = res["verdict"]
            conf = res["confidence_pct"]
            print(f" -> {pred} ({conf}%, {dur:.2f}s)")
        else:
            err = res.get("error_type", "FAILED")
            print(f" -> [{err}] {res.get('message', '')}")

        records.append({
            "video": res.get("video", vpath.name),
            "ground_truth": ground_truth,
            "status": status,
            "prediction": res.get("verdict", res.get("error_type", "FAILED")),
            "confidence": res.get("confidence", 0.0),
            "real_probability": res.get("real_probability", 0.0),
            "fake_probability": res.get("fake_probability", 0.0),
            "sync_score": res.get("sync_score", 0.0),
            "processing_time": res.get("processing", {}).get("duration_seconds", 0.0),
            "suspicious_windows": len(res.get("suspicious_windows", [])),
        })

    # Save results/evaluation_results.csv
    csv_path = output_dir / "evaluation_results.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "video",
            "ground_truth",
            "prediction",
            "confidence",
            "real_probability",
            "fake_probability",
            "sync_score",
            "processing_time",
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)

    # Compute Statistical Evaluation Metrics
    metrics, cm = compute_metrics(records)

    # Save metrics JSON
    metrics_json_path = output_dir / "evaluation_metrics.json"
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    # Print Formatted Evaluation Report
    print("\n" + "=" * 65)
    print("ARGOS AI MODEL EVALUATION")
    print("=" * 65)
    print(f"Videos tested: {metrics['total_tested']}")
    print(f"\nAccuracy:   {metrics['accuracy'] * 100:.1f}%")
    print(f"Precision:  {metrics['precision'] * 100:.1f}%")
    print(f"Recall:     {metrics['recall'] * 100:.1f}%")
    print(f"F1:         {metrics['f1_score'] * 100:.1f}%")
    print(f"ROC-AUC:    {metrics['roc_auc']:.2f}")

    print("\nConfusion Matrix:")
    print("                 Predicted")
    print("                 Real   Fake")
    print(f"Actual Real       {cm[0, 0]:<6} {cm[0, 1]:<6}")
    print(f"Actual Fake       {cm[1, 0]:<6} {cm[1, 1]:<6}")
    print("\nArtifacts Saved:")
    print(f"  Summary CSV:  {csv_path}")
    print(f"  Metrics JSON: {metrics_json_path}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
