"""
ARGOS AI - Single Video Forensic Inference & Testing CLI
Usage:
    python scripts/test_video.py --video path/to/video.mp4 [--debug] [--output-dir results/]
"""

import sys
import argparse
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from ml.evaluation.evaluator import VideoEvaluator


def parse_args():
    parser = argparse.ArgumentParser(
        description="ARGOS AI - Real Video Multimodal Lip-Sync & Deepfake Forensic CLI"
    )
    parser.add_argument(
        "--video",
        type=str,
        required=True,
        help="Path to input video file (.mp4, .mov, .avi, .webm, .mkv)",
    )
    parser.add_argument(
        "--ground-truth",
        type=str,
        default=None,
        choices=["real", "fake"],
        help="Optional ground truth label for benchmark scoring",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Generate visual debug plots, lip crops, face bounding boxes, and spectrograms",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="results",
        help="Directory to store evaluation JSON, evidence frames, and debug plots",
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress intermediate stage logs",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    video_path = Path(args.video).resolve()

    if not video_path.exists():
        print(f"\n[ERROR] Video file not found: {args.video}")
        sys.exit(1)

    output_dir = Path(args.output_dir).resolve()
    evaluator = VideoEvaluator()

    if not args.quiet:
        print("\n" + "-" * 60)
        print("ARGOS AI FORENSIC TEST - MULTIMODAL DETECTION ENGINE")
        print("-" * 60)
        print(f"Target Video: {video_path.name}")
        print(f"Path:         {video_path}")
        if args.debug:
            print("[DEBUG MODE ACTIVE] Spectrograms and sync plots will be generated.")
        print("-" * 60)

    def on_progress(stage_num: int, stage_desc: str):
        if not args.quiet:
            print(f"  [{stage_num:02d}/11] {stage_desc}")

    # Run genuine ML inference
    result = evaluator.evaluate(
        video_path=str(video_path),
        ground_truth=args.ground_truth,
        debug=args.debug,
        output_dir=output_dir,
        progress_callback=on_progress,
    )

    status = result.get("status")

    # Handle Edge Cases & Failures cleanly
    if status == "unavailable":
        err_type = result.get("error_type")
        if err_type == "MISSING_AUDIO":
            print("\n" + "-" * 60)
            print("AV SYNC ANALYSIS UNAVAILABLE")
            print("-" * 60)
            print("Reason:")
            print("No audio stream detected.")
            print(f"\nFile: {video_path.name}")
            if "metadata" in result:
                meta = result["metadata"]
                print(f"Duration:   {meta.get('duration_sec', 0):.1f} sec")
                print(f"Resolution: {meta.get('resolution')}")
            print("-" * 60)
            return

        elif err_type == "FACE_NOT_DETECTED":
            print("\n" + "-" * 60)
            print("FACE NOT DETECTED")
            print("-" * 60)
            print("Reason:")
            print("No human face identified in video frames.")
            print(f"File: {video_path.name}")
            return

        elif err_type == "MODEL_UNAVAILABLE":
            print("\n" + "-" * 60)
            print("MODEL UNAVAILABLE")
            print("-" * 60)
            print("Reason:")
            print(result.get("message", "Model weights missing."))
            print("-" * 60)
            return

    if status in ["invalid", "error", "failed"]:
        print("\n" + "-" * 60)
        print(result.get("error_type", "ANALYSIS FAILED"))
        print("-" * 60)
        print(result.get("message", "Video could not be processed."))
        print("-" * 60)
        return

    # Print Formatted Results
    meta = result["metadata"]
    model = result["model"]
    proc = result["processing"]
    timings = proc.get("timings", {})

    print("\n" + "-" * 60)
    print("ARGOS AI FORENSIC TEST")
    print("-" * 60)
    print("\nVIDEO")
    print(result["video"])
    print(f"\nDuration:   {meta['duration_sec']:.1f} sec")
    print(f"FPS:        {meta['fps']}")
    print(f"Resolution: {meta['resolution']}")
    print(f"\nAudio:      {meta['audio']}")
    print(f"Face:       {meta['face']}")

    print("\nMODEL")
    print(f"Device:     {model['device']}")
    print(f"Model:      {model['model_name']} (v{model['model_version']})")
    print(f"Weights:    {model['weights_version']}")
    print(f"Pipeline:   v{model['pipeline_version']}")

    print("\nRESULT")
    print("-" * 60)
    print(f"Prediction:        {result['verdict']}")
    print(f"Confidence:        {result['confidence_pct']}%")
    print(f"Real Probability:  {result['real_probability'] * 100:.1f}%")
    print(f"Fake Probability:  {result['fake_probability'] * 100:.1f}%")
    print(f"AV Sync Score:     {result['sync_score']:.2f}")
    print(f"Visual Score:      {result['visual_score']}%")
    print(f"Audio Score:       {result['audio_score']}%")
    print(f"Temporal Mismatch: {result['temporal_mismatch_ms']}")

    # Suspicious Windows
    suspicious = result.get("suspicious_windows", [])
    print("\nSuspicious Windows:")
    if suspicious:
        for win in suspicious:
            print(f"  {win['start_timecode']} -> {win['end_timecode']}  (Sync: {win['sync_score']:.2f}, Severity: {win['severity']})")
    else:
        print("  None detected (continuous temporal synchronization verified)")

    # Evidence Frames
    evidence = result.get("evidence_frames", [])
    print("\nEvidence Frames:")
    if evidence:
        for ev in evidence:
            print(f"  Frame {ev['frame_number']:04d} @ {ev['timestamp']} (Sync: {ev['sync_score']:.2f}, {ev['severity']}) → {ev['file_path']}")
    else:
        print("  No anomaly exhibits generated")

    # Timings
    print("\nPERFORMANCE BREAKDOWN")
    print(f"  Preprocessing: {timings.get('preprocessing', 0.0):.2f}s")
    print(f"  Vision:        {timings.get('vision', 0.0):.2f}s")
    print(f"  Audio:         {timings.get('audio', 0.0):.2f}s")
    print(f"  AV Sync:       {timings.get('av_sync', 0.0):.2f}s")
    print(f"  Classifier:    {timings.get('classifier', 0.0):.2f}s")
    print(f"  Evidence:      {timings.get('evidence', 0.0):.2f}s")
    print(f"  Total:         {proc.get('duration_seconds', 0.0):.2f}s")

    # Saved artifacts
    print("\nOUTPUT ARTIFACTS")
    print(f"  Results JSON:  {result.get('result_json_path')}")
    print(f"  Timeline CSV:  {result.get('timeline_csv')}")
    if args.debug and result.get("debug"):
        dbg = result["debug"]
        print(f"  Sync Plot:     {dbg.get('sync_plot')}")
        print(f"  Mel Plot:      {dbg.get('mel_plot')}")
    print("-" * 60 + "\n")


if __name__ == "__main__":
    main()
