"""
ARGOS AI - End-to-End Automated Pipeline Test
Generates a real audiovisual MP4 test sample, executes the 11-stage ML pipeline,
and verifies model inference, probabilities, temporal windows, and evidence frames.
"""

import os
import sys
import wave
import struct
import tempfile
import subprocess
from pathlib import Path
import cv2
import numpy as np
import pytest

# Ensure backend in sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from ml.config import VIDEO_SAMPLE_FPS, AUDIO_SAMPLE_RATE
from ml.pipeline import ArgosDeepfakePipeline
from ml.preprocessing.video_processor import get_ffmpeg_binary


def create_sample_audiovisual_video(
    output_path: Path,
    duration_sec: float = 2.0,
    fps: int = 25,
    sample_rate: int = 16000,
    is_anomaly: bool = False,
) -> Path:
    """
    Synthesizes a valid MP4 video with a moving face/mouth visual stream
    and an aligned sinusoidal audio speech carrier stream using OpenCV + FFmpeg.
    """
    total_frames = int(duration_sec * fps)
    temp_dir = Path(tempfile.gettempdir())
    raw_video_path = temp_dir / "temp_silent_video.mp4"
    raw_audio_path = temp_dir / "temp_audio.wav"

    # 1. Generate Video Stream with Moving Face & Mouth
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(raw_video_path), fourcc, fps, (320, 240))

    for frame_i in range(total_frames):
        frame = np.ones((240, 320, 3), dtype=np.uint8) * 40  # Dark background

        # Draw Face Head (center: 160, 110)
        cv2.ellipse(frame, (160, 110), (55, 75), 0, 0, 360, (210, 190, 180), -1)
        # Eyes
        cv2.circle(frame, (140, 95), 5, (40, 30, 20), -1)
        cv2.circle(frame, (180, 95), 5, (40, 30, 20), -1)
        # Nose
        cv2.line(frame, (160, 100), (160, 120), (160, 140, 130), 2)

        # Mouth: opens and closes periodically (viseme modulation)
        mouth_open = int(8 + 6 * np.sin(frame_i * 0.5))
        if is_anomaly and frame_i > total_frames // 2:
            # Synthetic anomaly: mouth stays unnaturally wide open or shifted
            mouth_open = 20
        cv2.ellipse(frame, (160, 150), (18, max(2, mouth_open)), 0, 0, 360, (140, 50, 70), -1)

        out.write(frame)
    out.release()

    # 2. Generate Audio WAV (16kHz mono speech carrier modulation)
    n_samples = int(duration_sec * sample_rate)
    with wave.open(str(raw_audio_path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        audio_samples = []
        for s in range(n_samples):
            t = s / sample_rate
            # 220Hz carrier with 4Hz envelope matching mouth opening
            freq = 220.0
            carrier = np.sin(2 * np.pi * freq * t)
            modulator = 0.5 * (1.0 + np.sin(2 * np.pi * 4.0 * t))
            val = int(carrier * modulator * 18000.0)
            audio_samples.append(struct.pack("<h", max(-32767, min(32767, val))))

        wav_file.writeframes(b"".join(audio_samples))

    # 3. Mux Video + Audio using local FFmpeg
    ffmpeg_exe = get_ffmpeg_binary()
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", str(raw_video_path),
        "-i", str(raw_audio_path),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        str(output_path)
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    # Clean up intermediate files
    try:
        raw_video_path.unlink(missing_ok=True)
        raw_audio_path.unlink(missing_ok=True)
    except Exception:
        pass

    return output_path


def test_end_to_end_pipeline():
    """Verifies that ArgosDeepfakePipeline processes a real video with genuine ML scores."""
    temp_dir = Path(tempfile.gettempdir())
    test_video = temp_dir / "argos_test_sample.mp4"
    create_sample_audiovisual_video(test_video, duration_sec=1.6, fps=25)

    assert test_video.exists() and test_video.stat().st_size > 1000

    pipeline = ArgosDeepfakePipeline()
    stages_logged = []

    def progress(stage_num, stage_name):
        stages_logged.append((stage_num, stage_name))

    result = pipeline.analyze_video(str(test_video), progress_callback=progress)

    # Clean up test video
    test_video.unlink(missing_ok=True)

    # Assertions
    assert result["status"] == "completed"
    assert result["verdict"] in ["REAL", "FAKE", "POTENTIALLY_MANIPULATED"]
    assert 0.0 <= result["confidence"] <= 1.0
    assert 0.0 <= result["real_probability"] <= 1.0
    assert 0.0 <= result["fake_probability"] <= 1.0
    # Probabilities must sum to ~1.0
    assert abs((result["real_probability"] + result["fake_probability"]) - 1.0) < 1e-3

    # Assert feature scores exist
    assert 0.0 <= result["sync_score"] <= 100.0
    assert 0.0 <= result["audio_score"] <= 100.0
    assert 0.0 <= result["visual_score"] <= 100.0

    # Assert analysis metadata
    assert result["analysis"]["face_detected"] is True
    assert result["analysis"]["audio_detected"] is True
    assert result["analysis"]["temporal_analysis_completed"] is True
    assert result["analysis"]["total_windows"] > 0
    assert len(stages_logged) == 11
    assert len(result["evidence_frames"]) >= 1

    print("\n[TEST PASSED] End-to-end ML pipeline succeeded!")
    print(f"Verdict: {result['verdict']}, Confidence: {result['confidence_pct']}%, Windows: {result['analysis']['total_windows']}")


if __name__ == "__main__":
    test_end_to_end_pipeline()
