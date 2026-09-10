"""
ARGOS AI - CLI Video Inference Runner
Usage: python scripts/run_inference.py path/to/video.mp4
"""

import sys
import json
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from ml.pipeline import ArgosDeepfakePipeline


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/run_inference.py <path_to_video.mp4>")
        sys.exit(1)

    video_path = sys.argv[1]
    if not Path(video_path).exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)

    print("=" * 65)
    print("ARGOS AI — MULTIMODAL LIP-SYNC & DEEPFAKE INFERENCE")
    print("=" * 65)
    print(f"Input Video: {video_path}")

    pipeline = ArgosDeepfakePipeline()

    def on_progress(stage_num: int, stage_desc: str):
        print(f"[{stage_num:02d}/11] {stage_desc}")

    try:
        result = pipeline.analyze_video(video_path, progress_callback=on_progress)
        print("\n" + "=" * 65)
        print("FORENSIC VERDICT SUMMARY")
        print("=" * 65)
        print(f"Verdict:              {result['verdict']}")
        print(f"Confidence:           {result['confidence_pct']}%")
        print(f"Real Probability:     {result['real_probability'] * 100:.1f}%")
        print(f"Fake Probability:     {result['fake_probability'] * 100:.1f}%")
        print(f"Sync Score:           {result['sync_score']}%")
        print(f"Audio Score:          {result['audio_score']}%")
        print(f"Visual Score:         {result['visual_score']}%")
        print(f"Temporal Mismatch:    {result['temporal_mismatch_ms']}")
        print(f"Suspicious Windows:   {len(result['suspicious_windows'])}")
        print(f"Evidence Keyframes:   {len(result['evidence_frames'])}")
        print(f"Execution Time:       {result['analysis']['execution_time_sec']}s")
        print("=" * 65)
    except Exception as e:
        print(f"\n[ERROR] Analysis failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
