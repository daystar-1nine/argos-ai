"""
ARGOS AI - Audio Feature Extraction Module
Extracts 80-band Log Mel-spectrograms and MFCCs aligned temporally with video frames.
"""

from typing import Dict, Any, Tuple
from pathlib import Path
import numpy as np
import soundfile as sf
import librosa

from ml.config import (
    AUDIO_SAMPLE_RATE,
    N_FFT,
    WIN_LENGTH,
    HOP_LENGTH,
    N_MELS,
)


class AudioFeatureExtractor:
    """
    Extracts time-aligned acoustic features (Log Mel-spectrograms, MFCCs, Spectral Centroid)
    from 16kHz mono WAV audio tracks.
    """

    def __init__(
        self,
        sample_rate: int = AUDIO_SAMPLE_RATE,
        n_mels: int = N_MELS,
        n_fft: int = N_FFT,
        win_length: int = WIN_LENGTH,
        hop_length: int = HOP_LENGTH,
    ):
        self.sample_rate = sample_rate
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.win_length = win_length
        self.hop_length = hop_length

    def load_audio(self, wav_path: str) -> np.ndarray:
        """
        Loads 16kHz audio using soundfile / librosa and ensures mono float32.
        """
        data, sr = sf.read(wav_path, dtype="float32")
        if data.ndim > 1:
            data = np.mean(data, axis=1)

        if sr != self.sample_rate:
            data = librosa.resample(data, orig_sr=sr, target_sr=self.sample_rate)

        # Normalize audio amplitude
        max_val = np.max(np.abs(data))
        if max_val > 1e-6:
            data = data / max_val

        return data

    def extract_features(self, wav_path: str) -> Dict[str, Any]:
        """
        Extracts temporal audio feature maps:
        - Log Mel-spectrogram (80 x T)
        - MFCCs (13 x T)
        - RMS Energy (1 x T)
        - Spectral Centroid (1 x T)
        - Exact temporal timestamps for every acoustic frame
        """
        audio = self.load_audio(wav_path)
        duration_sec = len(audio) / self.sample_rate

        # 1. Compute Mel-spectrogram (80 bands)
        mel_spec = librosa.feature.melspectrogram(
            y=audio,
            sr=self.sample_rate,
            n_fft=self.n_fft,
            win_length=self.win_length,
            hop_length=self.hop_length,
            n_mels=self.n_mels,
            fmin=50,
            fmax=8000,
        )

        # Convert power to dB (Log Mel)
        log_mel = librosa.power_to_db(mel_spec, ref=np.max)
        # Normalize to roughly [-1.0, 1.0] (speech dynamic range ~80dB)
        log_mel_norm = np.clip((log_mel + 40.0) / 40.0, -1.0, 1.0).astype(np.float32)

        # 2. Compute MFCCs (13 coefficients)
        mfccs = librosa.feature.mfcc(
            S=log_mel,
            n_mfcc=13,
        ).astype(np.float32)

        # 3. Compute RMS Energy
        rms = librosa.feature.rms(
            y=audio,
            frame_length=self.win_length,
            hop_length=self.hop_length,
        )[0].astype(np.float32)

        # 4. Compute Spectral Centroid
        centroid = librosa.feature.spectral_centroid(
            y=audio,
            sr=self.sample_rate,
            n_fft=self.n_fft,
            hop_length=self.hop_length,
        )[0].astype(np.float32)

        # Compute exact time per mel frame
        num_mel_frames = log_mel_norm.shape[1]
        timestamps = np.arange(num_mel_frames) * (self.hop_length / self.sample_rate)

        return {
            "log_mel": log_mel_norm,          # Shape: (80, T_mel)
            "mfcc": mfccs,                    # Shape: (13, T_mel)
            "rms": rms,                       # Shape: (T_mel,)
            "centroid": centroid,             # Shape: (T_mel,)
            "timestamps": timestamps,         # Shape: (T_mel,)
            "sample_rate": self.sample_rate,
            "duration": duration_sec,
            "total_mel_frames": num_mel_frames,
        }
