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
        pred = 1 if pred_verdict in ["fake", "potentially manipulated", "potentially_manipulated"] else 0

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

    # Identify false positives, false negatives, and error cases
    false_positives = []
    false_negatives = []
    error_cases = []

    y_true = []
    y_scores = []

    for r in records:
        if r["status"] != "completed":
            error_cases.append(r)
            continue

        gt = 1 if r["ground_truth"].lower() == "fake" else 0
        pred_verdict = r["prediction"].lower()
        pred = 1 if pred_verdict in ["fake", "potentially manipulated", "potentially_manipulated"] else 0

        y_true.append(gt)
        y_scores.append(float(r.get("fake_probability", 0.5)))

        if gt == 0 and pred == 1:
            false_positives.append(r)
        elif gt == 1 and pred == 0:
            false_negatives.append(r)

    # Save reports to reports/ directory as required by Section 17
    reports_dir = Path(__file__).resolve().parent.parent / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    detailed_report = {
        "metrics": metrics,
        "confusion_matrix": {
            "true_negatives": int(cm[0, 0]),
            "false_positives": int(cm[0, 1]),
            "false_negatives": int(cm[1, 0]),
            "true_positives": int(cm[1, 1]),
        },
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "error_cases": error_cases,
        "per_video_predictions": records,
    }

    # 1. Save reports/ml_evaluation.json
    ml_eval_json_path = reports_dir / "ml_evaluation.json"
    with open(ml_eval_json_path, "w", encoding="utf-8") as f:
        json.dump(detailed_report, f, indent=2)

    # Also save to output_dir
    with open(output_dir / "evaluation_metrics.json", "w", encoding="utf-8") as f:
        json.dump(detailed_report, f, indent=2)

    # 2. Generate and Save Confusion Matrix Plot
    cm_img_path = reports_dir / "confusion_matrix.png"
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, ax = plt.subplots(figsize=(6, 5))
        cax = ax.matshow(cm, cmap="Blues", alpha=0.8)
        fig.colorbar(cax)

        for i in range(2):
            for j in range(2):
                ax.text(j, i, str(cm[i, j]), ha="center", va="center", color="black", fontsize=16, fontweight="bold")

        ax.set_xticks([0, 1])
        ax.set_yticks([0, 1])
        ax.set_xticklabels(["Real", "Fake"], fontsize=12)
        ax.set_yticklabels(["Real", "Fake"], fontsize=12)
        ax.set_xlabel("Predicted Label", fontsize=12, fontweight="bold")
        ax.set_ylabel("Ground Truth Label", fontsize=12, fontweight="bold")
        ax.set_title(f"ARGOS AI Confusion Matrix (Accuracy: {metrics['accuracy']*100:.1f}%)", pad=15, fontsize=13, fontweight="bold")
        plt.tight_layout()
        plt.savefig(cm_img_path, dpi=200)
        plt.close()
    except Exception as e:
        print(f"[WARN] Could not generate confusion matrix plot: {e}")

    # 3. Generate and Save ROC Curve Plot
    roc_img_path = reports_dir / "roc_curve.png"
    try:
        from sklearn.metrics import roc_curve, auc
        if len(set(y_true)) > 1:
            fpr, tpr, _ = roc_curve(y_true, y_scores)
            roc_auc_val = auc(fpr, tpr)
        else:
            fpr = [0.0, 0.0, 1.0]
            tpr = [0.0, 1.0, 1.0]
            roc_auc_val = 1.0

        fig, ax = plt.subplots(figsize=(6, 5))
        ax.plot(fpr, tpr, color="#2563EB", lw=2.5, label=f"ROC Curve (AUC = {roc_auc_val:.3f})")
        ax.plot([0, 1], [0, 1], color="#9CA3AF", lw=1.5, linestyle="--", label="Random Chance")
        ax.set_xlim([0.0, 1.0])
        ax.set_ylim([0.0, 1.05])
        ax.set_xlabel("False Positive Rate (FPR)", fontsize=11, fontweight="bold")
        ax.set_ylabel("True Positive Rate (TPR / Recall)", fontsize=11, fontweight="bold")
        ax.set_title("Receiver Operating Characteristic (ROC)", fontsize=13, fontweight="bold")
        ax.legend(loc="lower right", fontsize=11)
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(roc_img_path, dpi=200)
        plt.close()
    except Exception as e:
        print(f"[WARN] Could not generate ROC plot: {e}")

    # 4. Generate and Save Precision-Recall Curve Plot
    pr_img_path = reports_dir / "pr_curve.png"
    try:
        from sklearn.metrics import precision_recall_curve, average_precision_score
        if len(set(y_true)) > 1:
            prec_vals, rec_vals, _ = precision_recall_curve(y_true, y_scores)
            avg_prec = average_precision_score(y_true, y_scores)
        else:
            prec_vals = [1.0, 1.0]
            rec_vals = [0.0, 1.0]
            avg_prec = 1.0

        fig, ax = plt.subplots(figsize=(6, 5))
        ax.plot(rec_vals, prec_vals, color="#10B981", lw=2.5, label=f"PR Curve (AP = {avg_prec:.3f})")
        ax.set_xlim([0.0, 1.0])
        ax.set_ylim([0.0, 1.05])
        ax.set_xlabel("Recall", fontsize=11, fontweight="bold")
        ax.set_ylabel("Precision", fontsize=11, fontweight="bold")
        ax.set_title("Precision-Recall (PR) Curve", fontsize=13, fontweight="bold")
        ax.legend(loc="lower left", fontsize=11)
        ax.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(pr_img_path, dpi=200)
        plt.close()
    except Exception as e:
        print(f"[WARN] Could not generate PR plot: {e}")

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

    print(f"\nDiagnostic Case Breakdown:")
    print(f"  False Positives: {len(false_positives)}")
    for fp_item in false_positives:
        print(f"    - {fp_item['video']} (Fake Prob: {fp_item['fake_probability']*100:.1f}%)")
    print(f"  False Negatives: {len(false_negatives)}")
    for fn_item in false_negatives:
        print(f"    - {fn_item['video']} (Real Prob: {fn_item['real_probability']*100:.1f}%)")
    print(f"  Error Cases:     {len(error_cases)}")

    print("\nArtifacts Saved:")
    print(f"  Summary CSV:       {csv_path}")
    print(f"  Evaluation JSON:   {ml_eval_json_path}")
    print(f"  Confusion Matrix:  {cm_img_path}")
    print(f"  ROC Curve Plot:    {roc_img_path}")
    print(f"  PR Curve Plot:     {pr_img_path}")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    main()
