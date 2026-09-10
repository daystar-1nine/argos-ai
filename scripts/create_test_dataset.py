"""
ARGOS AI - Test Dataset Generator Script
Synthesizes valid benchmark test media:
- data/test/real/ (real_01.mp4, real_02.mp4): Synchronized visemes & speech carriers
- data/test/fake/ (fake_01.mp4, fake_02.mp4): Desynchronized & anomalous lip motion
- data/test/edge_cases/no_audio.mp4: Silent video stream
- data/test/edge_cases/no_face.mp4: Audio without human face
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

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from ml.preprocessing.video_processor import get_ffmpeg_binary


def synthesize_sample(
    output_path: Path,
    duration_sec: float = 2.4,
    fps: int = 25,
    sample_rate: int = 16000,
    anomaly_type: str = "none",  # 'none', 'desync', 'lip_stuck', 'no_audio', 'no_face'
) -> Path:
    """
    Creates a real MP4 video container with OpenCV video stream and PCM/AAC audio.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(tempfile.gettempdir())
    raw_video = temp_dir / f"raw_{output_path.stem}.mp4"
    raw_audio = temp_dir / f"raw_{output_path.stem}.wav"

    total_frames = int(duration_sec * fps)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(str(raw_video), fourcc, fps, (320, 240))

    has_face = (anomaly_type != "no_face")

    for frame_i in range(total_frames):
        frame = np.ones((240, 320, 3), dtype=np.uint8) * 35

        if has_face:
            # Draw realistic face oval
            cv2.ellipse(frame, (160, 110), (55, 75), 0, 0, 360, (215, 195, 185), -1)
            # Eyes
            cv2.circle(frame, (140, 95), 5, (40, 30, 20), -1)
            cv2.circle(frame, (180, 95), 5, (40, 30, 20), -1)
            # Eyebrows
            cv2.line(frame, (132, 85), (148, 85), (30, 20, 15), 2)
            cv2.line(frame, (172, 85), (188, 85), (30, 20, 15), 2)
            # Nose
            cv2.line(frame, (160, 100), (160, 120), (170, 150, 140), 2)

            # Mouth modulation
            if anomaly_type == "none":
                # Natural rhythmic open/close correlated with speech envelope
                mouth_open = int(7 + 6 * np.sin(frame_i * 0.6))
            elif anomaly_type == "desync":
                # Desynchronized: phase shifted mouth movement
                mouth_open = int(7 + 6 * np.sin((frame_i + 15) * 0.6))
            elif anomaly_type == "lip_stuck":
                # Static wide-open or completely frozen mouth in second half
                if frame_i > total_frames // 2:
                    mouth_open = 20
                else:
                    mouth_open = int(7 + 6 * np.sin(frame_i * 0.6))
            else:
                mouth_open = int(7 + 6 * np.sin(frame_i * 0.6))

            cv2.ellipse(frame, (160, 150), (18, max(2, mouth_open)), 0, 0, 360, (140, 50, 70), -1)
        else:
            # No face: random colored noise or geometric bars
            for b in range(5):
                cv2.rectangle(frame, (30 * b + 20, 40), (30 * b + 40, 200), (100, 150, 200), -1)

        out.write(frame)
    out.release()

    if anomaly_type == "no_audio":
        # Simply convert raw video to final mp4 without audio
        ffmpeg_exe = get_ffmpeg_binary()
        cmd = [
            ffmpeg_exe, "-y",
            "-i", str(raw_video),
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-an",
            str(output_path)
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        raw_video.unlink(missing_ok=True)
        return output_path

    # Generate Audio Track (16kHz PCM Speech Carrier)
    n_samples = int(duration_sec * sample_rate)
    with wave.open(str(raw_audio), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)

        samples = []
        for s in range(n_samples):
            t = s / sample_rate
            # 220Hz speech fundamental carrier
            carrier = np.sin(2 * np.pi * 220.0 * t)

            if anomaly_type == "none":
                # Modulator envelope in sync with mouth opening (~0.6 rad per frame at 25fps = 2.38Hz)
                mod = 0.5 * (1.0 + np.sin(2 * np.pi * 2.38 * t))
            elif anomaly_type == "desync":
                # Modulator out of phase or distinct frequency
                mod = 0.5 * (1.0 + np.sin(2 * np.pi * 0.8 * t))
            elif anomaly_type == "lip_stuck":
                # Audio continues speaking while mouth is frozen
                mod = 0.5 * (1.0 + np.sin(2 * np.pi * 3.0 * t))
            else:
                mod = 0.5 * (1.0 + np.sin(2 * np.pi * 2.38 * t))

            val = int(carrier * mod * 18000.0)
            samples.append(struct.pack("<h", max(-32767, min(32767, val))))

        wav.writeframes(b"".join(samples))

    # Mux using FFmpeg
    ffmpeg_exe = get_ffmpeg_binary()
    cmd = [
        ffmpeg_exe, "-y",
        "-i", str(raw_video),
        "-i", str(raw_audio),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "128k",
        str(output_path)
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    # Clean intermediate
    raw_video.unlink(missing_ok=True)
    raw_audio.unlink(missing_ok=True)
    return output_path


def main():
    root = Path(__file__).resolve().parent.parent
    data_dir = root / "data" / "test"
    real_dir = data_dir / "real"
    fake_dir = data_dir / "fake"
    edge_dir = data_dir / "edge_cases"

    print("=" * 65)
    print("ARGOS AI — SYNTHESIZING REAL & FAKE TEST VIDEO FIXTURES")
    print("=" * 65)

    # 1. Real videos
    print("[1/6] Synthesizing data/test/real/real_01.mp4...")
    synthesize_sample(real_dir / "real_01.mp4", duration_sec=2.2, anomaly_type="none")

    print("[2/8] Synthesizing data/test/real/real_02.mp4...")
    synthesize_sample(real_dir / "real_02.mp4", duration_sec=2.6, anomaly_type="none")

    print("[3/8] Synthesizing data/test/real/real_03.mp4...")
    synthesize_sample(real_dir / "real_03.mp4", duration_sec=3.0, anomaly_type="none")

    # 2. Fake videos
    print("[4/8] Synthesizing data/test/fake/fake_01.mp4 (desynchronized audio/video)...")
    synthesize_sample(fake_dir / "fake_01.mp4", duration_sec=2.2, anomaly_type="desync")

    print("[5/8] Synthesizing data/test/fake/fake_02.mp4 (lip movement freeze anomaly)...")
    synthesize_sample(fake_dir / "fake_02.mp4", duration_sec=2.6, anomaly_type="lip_stuck")

    print("[6/8] Synthesizing data/test/fake/fake_03.mp4 (inverted phase deep desync)...")
    synthesize_sample(fake_dir / "fake_03.mp4", duration_sec=3.0, anomaly_type="desync")

    # 3. Edge cases
    print("[7/8] Synthesizing data/test/edge_cases/no_audio.mp4 (silent stream)...")
    synthesize_sample(edge_dir / "no_audio.mp4", duration_sec=2.0, anomaly_type="no_audio")

    print("[8/8] Synthesizing data/test/edge_cases/no_face.mp4 (no face detected)...")
    synthesize_sample(edge_dir / "no_face.mp4", duration_sec=2.0, anomaly_type="no_face")

    print("\n[SUCCESS] Test dataset fixtures generated successfully in 'data/test/'!")


if __name__ == "__main__":
    main()
