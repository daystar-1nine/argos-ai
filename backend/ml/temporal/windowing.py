"""
ARGOS AI - Synchronized Temporal Windowing Module
Aligns video frames and audio Mel-spectrograms into synchronized sliding temporal windows.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import torch

from ml.config import (
    WINDOW_FRAMES,
    WINDOW_STRIDE_FRAMES,
    AUDIO_MEL_FRAMES_PER_VIDEO_FRAME,
    WINDOW_MEL_FRAMES,
    VIDEO_SAMPLE_FPS,
)


class SynchronizedWindow:
    """Represents a single time-aligned audio-visual temporal observation."""

    def __init__(
        self,
        window_idx: int,
        start_time: float,
        end_time: float,
        video_start_frame: int,
        video_end_frame: int,
        lip_sequence: np.ndarray,   # Shape: (WINDOW_FRAMES, 1, H, W)
        audio_mel: np.ndarray,      # Shape: (1, N_MELS, WINDOW_MEL_FRAMES)
        motion_delta_mean: float,
        audio_rms_mean: float,
    ):
        self.window_idx = window_idx
        self.start_time = start_time
        self.end_time = end_time
        self.video_start_frame = video_start_frame
        self.video_end_frame = video_end_frame
        self.lip_sequence = lip_sequence
        self.audio_mel = audio_mel
        self.motion_delta_mean = motion_delta_mean
        self.audio_rms_mean = audio_rms_mean

    def to_torch(self, device: torch.device) -> Tuple[torch.Tensor, torch.Tensor]:
        """Converts window numpy arrays to PyTorch tensors with batch dimension."""
        # lip_seq: (1, WINDOW_FRAMES, 1, H, W)
        lip_tensor = torch.from_numpy(self.lip_sequence).unsqueeze(0).to(device)
        # audio_mel: (1, 1, N_MELS, WINDOW_MEL_FRAMES)
        audio_tensor = torch.from_numpy(self.audio_mel).unsqueeze(0).to(device)
        return lip_tensor, audio_tensor


class TemporalWindowBuilder:
    """
    Constructs synchronized sliding temporal windows across visual lip crops
    and audio Mel-spectrogram matrices.
    """

    def __init__(
        self,
        window_frames: int = WINDOW_FRAMES,
        stride_frames: int = WINDOW_STRIDE_FRAMES,
        fps: float = VIDEO_SAMPLE_FPS,
        mel_per_frame: int = AUDIO_MEL_FRAMES_PER_VIDEO_FRAME,
    ):
        self.window_frames = window_frames
        self.stride_frames = stride_frames
        self.fps = fps
        self.mel_per_frame = mel_per_frame
        self.window_mel_frames = window_frames * mel_per_frame

    def build_windows(
        self,
        lip_crops: List[np.ndarray],
        timestamps: List[float],
        audio_features: Dict[str, Any],
        motion_deltas: List[float],
    ) -> List[SynchronizedWindow]:
        """
        Slides a temporal window across aligned visual and acoustic streams.
        Guarantees strict 1-to-1 temporal synchronization.
        """
        total_video_frames = len(lip_crops)
        log_mel = audio_features["log_mel"]  # Shape: (80, T_mel)
        rms = audio_features["rms"]          # Shape: (T_mel,)
        total_mel_frames = log_mel.shape[1]

        windows: List[SynchronizedWindow] = []
        window_idx = 0

        # Slide window across frames
        for start_frame in range(0, total_video_frames - self.window_frames + 1, self.stride_frames):
            end_frame = start_frame + self.window_frames

            # Calculate exact video timestamps
            start_time = timestamps[start_frame]
            end_time = timestamps[min(end_frame - 1, len(timestamps) - 1)] + (1.0 / self.fps)

            # Extract visual sequence: (window_frames, 1, H, W)
            window_crops = lip_crops[start_frame:end_frame]
            lip_sequence = np.stack(window_crops, axis=0)
            lip_sequence = np.expand_dims(lip_sequence, axis=1).astype(np.float32)

            # Extract corresponding acoustic spectrogram window: (1, 80, window_mel_frames)
            mel_start = start_frame * self.mel_per_frame
            mel_end = mel_start + self.window_mel_frames

            # Boundary handling for audio
            if mel_end <= total_mel_frames:
                audio_mel_slice = log_mel[:, mel_start:mel_end]
                rms_slice = rms[mel_start:mel_end]
            else:
                # Pad audio if video outlasts audio slightly
                pad_len = mel_end - total_mel_frames
                available = log_mel[:, mel_start:]
                audio_mel_slice = np.pad(available, ((0, 0), (0, pad_len)), mode="edge")
                rms_slice = np.pad(rms[mel_start:], (0, pad_len), mode="edge")

            audio_mel_slice = np.expand_dims(audio_mel_slice, axis=0).astype(np.float32)

            # Compute window motion delta mean
            window_motion = float(np.mean(motion_deltas[start_frame:end_frame]))
            window_rms = float(np.mean(rms_slice))

            window_obj = SynchronizedWindow(
                window_idx=window_idx,
                start_time=float(start_time),
                end_time=float(end_time),
                video_start_frame=start_frame,
                video_end_frame=end_frame,
                lip_sequence=lip_sequence,
                audio_mel=audio_mel_slice,
                motion_delta_mean=window_motion,
                audio_rms_mean=window_rms,
            )
            windows.append(window_obj)
            window_idx += 1

        return windows
