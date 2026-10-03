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

    if status in ["invalid", "error", "failed", "unavailable"]:
        print("\n" + "=" * 60)
        print("ARGOS AI — ML TEST")
        print("=" * 60)
        print(f"\nVideo:          {video_path.name}")
        print(f"Path:           {video_path}")
        print("\nSTATUS:\nFAILED")
        print(f"Stage:          {result.get('stage', result.get('error_type', 'preprocessing'))}")
        print(f"Error:          {result.get('message', 'Video could not be processed.')}")
        if result.get("details"):
            print(f"Details:        {result.get('details')}")
        print("=" * 60 + "\n")
        return

    # Print Formatted Results matching Section 16
    meta = result["metadata"]
    model = result["model"]
    proc = result["processing"]
    timings = proc.get("timings", {})
    suspicious = result.get("suspicious_windows", [])
    evidence = result.get("evidence_frames", [])

    print("\n" + "=" * 60)
    print("ARGOS AI — ML TEST")
    print("=" * 60)

    print(f"\nVideo:          {result['video']}")
    print(f"Duration:       {meta['duration_sec']:.2f}s")
    print(f"Resolution:     {meta['resolution']}")
    print(f"FPS:            {meta['fps']:.2f}")
    print(f"Audio:          {meta['audio']}")
    print(f"Faces detected: {result.get('analysis', {}).get('faces_count', 1)}")

    print("\nMODEL:")
    print(f"Version:        {model.get('model_version', '1.2.0')}")
    print(f"Checkpoint:     {model.get('checkpoint', 'backend/models/classifier.pth')}")

    print("\nRESULT:")
    print(f"Prediction:       {result['verdict']}")
    print(f"Real probability: {result['real_probability'] * 100:.2f}%")
    print(f"Fake probability: {result['fake_probability'] * 100:.2f}%")

    print("\nAUDIO-VISUAL:")
    print(f"Sync score:        {result['sync_score']:.3f}")
    print(f"Average AV offset: {result['temporal_mismatch_ms']}")

    print("\nTEMPORAL:")
    print(f"Windows analyzed:   {result.get('analysis', {}).get('total_windows', len(result.get('windows', [])))}")
    print(f"Suspicious windows: {len(suspicious)}")
    if suspicious:
        for win in suspicious:
            print(f"  - {win.get('start_timecode', '')} -> {win.get('end_timecode', '')} (Sync: {win.get('sync_score', 0):.2f}, Severity: {win.get('severity', 'HIGH')})")

    print("\nEVIDENCE:")
    if evidence:
        for ev in evidence:
            print(f"  - Exhibit: Frame {ev.get('frame_number', 0)} @ {ev.get('timestamp', '')} -> {ev.get('file_path', '')}")
    else:
        print("  None (Continuous authentic synchronization verified)")

    print("\nSTATUS:\nSUCCESS")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
