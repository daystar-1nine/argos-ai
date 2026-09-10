"""
ARGOS AI - Video & Audio Preprocessing Module
Extracts normalized video frames and 16kHz mono audio using FFmpeg & OpenCV.
"""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import cv2
import numpy as np
import imageio_ffmpeg

from ml.config import (
    VIDEO_SAMPLE_FPS,
    AUDIO_SAMPLE_RATE,
    MIN_VIDEO_DURATION_SEC,
    MAX_VIDEO_DURATION_SEC,
    TEMP_DIR,
)


class VideoProcessingError(Exception):
    """Base exception for video processing failures."""
    pass


class MissingAudioError(VideoProcessingError):
    """Raised when the uploaded video does not contain an audio track."""
    pass


class CorruptedVideoError(VideoProcessingError):
    """Raised when the uploaded video stream is unreadable or corrupted."""
    pass


class VideoDurationError(VideoProcessingError):
    """Raised when video duration is outside allowable bounds."""
    pass


def get_ffmpeg_binary() -> str:
    """Returns absolute path to the local imageio-ffmpeg executable."""
    return imageio_ffmpeg.get_ffmpeg_exe()


import wave
import struct

def generate_silent_wav(output_wav_path: str, duration_sec: float, sample_rate: int = AUDIO_SAMPLE_RATE):
    """Generates a mono 16-bit PCM silent/ambient WAV file matching specified duration."""
    num_samples = max(int(duration_sec * sample_rate), int(MIN_VIDEO_DURATION_SEC * sample_rate))
    with wave.open(output_wav_path, "w") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        zero_samples = struct.pack(f"<{num_samples}h", *([0] * num_samples))
        wav_file.writeframes(zero_samples)


def extract_audio_track(video_path: str, output_wav_path: Optional[str] = None) -> str:
    """
    Extracts audio track from video file and converts to 16kHz mono PCM 16-bit WAV.
    Falls back to generating silent ambient audio if input clip lacks audio stream.
    """
    video_path_obj = Path(video_path)
    if not video_path_obj.exists():
        raise VideoProcessingError(f"Video file not found: {video_path}")

    if output_wav_path is None:
        output_wav_path = str(TEMP_DIR / f"{video_path_obj.stem}_extracted_16k.wav")

    ffmpeg_exe = get_ffmpeg_binary()

    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", str(video_path),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", str(AUDIO_SAMPLE_RATE),
        "-ac", "1",
        output_wav_path
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    # Check if audio was present or extracted properly
    if not Path(output_wav_path).exists() or os.path.getsize(output_wav_path) < 100:
        # Fallback: synthesize silent WAV matching video duration
        try:
            meta = get_video_metadata(video_path)
            duration_sec = meta.get("duration_sec", 2.5)
        except Exception:
            duration_sec = 2.5
        generate_silent_wav(output_wav_path, duration_sec, AUDIO_SAMPLE_RATE)

    return output_wav_path


def get_video_metadata(video_path: str) -> Dict[str, Any]:
    """
    Inspects video stream with OpenCV VideoCapture and validates integrity.
    Includes manual frame count fallback for browser MediaRecorder WebM streams.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise CorruptedVideoError(f"Unable to open video stream: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or np.isnan(fps):
        fps = VIDEO_SAMPLE_FPS

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Manual frame count fallback for browser MediaRecorder WebM streams
    if total_frames <= 0:
        count = 0
        while True:
            ret, _ = cap.read()
            if not ret:
                break
            count += 1
        total_frames = count
        cap.release()
        cap = cv2.VideoCapture(video_path)
        if width <= 0 or height <= 0:
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    duration_sec = total_frames / fps if fps > 0 else 0.0

    cap.release()

    if total_frames <= 0 or width <= 0 or height <= 0:
        raise CorruptedVideoError(f"Video contains invalid frame dimensions or zero frames ({width}x{height}, {total_frames} frames)")

    if duration_sec < MIN_VIDEO_DURATION_SEC:
        raise VideoDurationError(f"Video is too short ({duration_sec:.2f}s). Minimum required duration is {MIN_VIDEO_DURATION_SEC}s.")

    if duration_sec > MAX_VIDEO_DURATION_SEC:
        raise VideoDurationError(f"Video exceeds maximum permitted duration of {MAX_VIDEO_DURATION_SEC}s ({duration_sec:.1f}s).")

    if duration_sec > MAX_VIDEO_DURATION_SEC:
        raise VideoDurationError(f"Video exceeds maximum permitted duration of {MAX_VIDEO_DURATION_SEC}s ({duration_sec:.1f}s).")

    return {
        "fps": fps,
        "total_frames": total_frames,
        "width": width,
        "height": height,
        "duration_sec": duration_sec,
        "resolution": f"{width}x{height}",
    }


def extract_sampled_frames(video_path: str, target_fps: float = VIDEO_SAMPLE_FPS) -> Tuple[List[np.ndarray], List[float]]:
    """
    Reads video frames and resamples them uniformly to target_fps (25.0 FPS).
    Returns (frames_list_rgb, timestamps_seconds_list).
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise CorruptedVideoError(f"Unable to open video stream: {video_path}")

    source_fps = cap.get(cv2.CAP_PROP_FPS)
    if source_fps <= 0 or np.isnan(source_fps):
        source_fps = target_fps

    frames: List[np.ndarray] = []
    timestamps: List[float] = []

    frame_interval = source_fps / target_fps
    current_target_frame = 0.0
    current_source_idx = 0

    while True:
        ret, frame_bgr = cap.read()
        if not ret:
            break

        if current_source_idx >= int(round(current_target_frame)):
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            timestamp_sec = current_source_idx / source_fps
            frames.append(frame_rgb)
            timestamps.append(timestamp_sec)
            current_target_frame += frame_interval

        current_source_idx += 1

    cap.release()

    if len(frames) == 0:
        raise CorruptedVideoError("No valid video frames could be decoded from video file.")

    return frames, timestamps


def preprocess_video_pipeline(video_path: str) -> Dict[str, Any]:
    """
    Complete Phase 1 Video Preprocessing Pipeline:
    1. Validates video & extracts metadata
    2. Extracts 16kHz mono audio track
    3. Samples 25 FPS RGB video frames with exact timestamps
    """
    meta = get_video_metadata(video_path)
    audio_wav_path = extract_audio_track(video_path)
    frames, timestamps = extract_sampled_frames(video_path, target_fps=VIDEO_SAMPLE_FPS)

    return {
        "metadata": meta,
        "audio_wav_path": audio_wav_path,
        "frames": frames,
        "timestamps": timestamps,
        "fps": VIDEO_SAMPLE_FPS,
        "total_sampled_frames": len(frames),
    }
