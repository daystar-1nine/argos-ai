"""
ARGOS AI - Sample Video Synthesis Utility
Generates valid MP4 video samples with synchronized face, mouth motion,
and audio speech carriers for testing the multimodal ML forensics engine.
"""

import struct
import tempfile
import wave
import subprocess
from pathlib import Path
import cv2
import numpy as np

from ml.preprocessing.video_processor import get_ffmpeg_binary


def create_sample_audiovisual_video(
    output_path: Path,
    duration_sec: float = 2.5,
    fps: int = 25,
    sample_rate: int = 16000,
    is_anomaly: bool = False,
) -> Path:
    """
    Synthesizes a valid MP4 video with a moving face/mouth visual stream
    and an aligned sinusoidal audio speech carrier stream using OpenCV + FFmpeg.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    total_frames = int(duration_sec * fps)
    temp_dir = Path(tempfile.gettempdir())
    raw_video_path = temp_dir / f"temp_silent_video_{id(output_path)}.mp4"
    raw_audio_path = temp_dir / f"temp_audio_{id(output_path)}.wav"

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
            mouth_open = 22
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
