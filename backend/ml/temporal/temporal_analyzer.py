"""
ARGOS AI - Temporal Trajectory Analysis Module
Evaluates continuous audio-visual synchronization scores over time,
identifies suspicious anomaly clusters, and extracts statistical temporal vectors.
"""

from typing import List, Dict, Any, Tuple
import numpy as np

from ml.config import (
    SYNC_ANOMALY_THRESHOLD,
    HIGH_RISK_SYNC_THRESHOLD,
    MIN_ANOMALY_WINDOW_DURATION_SEC,
)


class SuspiciousInterval:
    """Represents a continuous temporal anomaly segment."""

    def __init__(
        self,
        start_time: float,
        end_time: float,
        avg_sync_score: float,
        min_sync_score: float,
        severity: str,
        window_indices: List[int],
        peak_anomaly_frame: int,
    ):
        self.start_time = round(start_time, 2)
        self.end_time = round(end_time, 2)
        self.duration_sec = round(self.end_time - self.start_time, 2)
        self.avg_sync_score = round(avg_sync_score, 4)
        self.min_sync_score = round(min_sync_score, 4)
        self.severity = severity
        self.window_indices = window_indices
        self.peak_anomaly_frame = peak_anomaly_frame

    def to_dict(self) -> Dict[str, Any]:
        return {
            "start": self.start_time,
            "end": self.end_time,
            "duration": self.duration_sec,
            "sync_score": self.avg_sync_score,
            "min_sync_score": self.min_sync_score,
            "severity": self.severity,
            "peak_frame": self.peak_anomaly_frame,
            "label": f"Temporal Lip-Sync Anomaly ({self.severity} RISK, Sync={self.avg_sync_score * 100:.1f}%)",
        }


class TemporalAnalyzer:
    """
    Analyzes synchronization dynamics across sliding temporal windows.
    Detects phoneme-viseme desynchronization clusters and produces fused temporal metrics.
    """

    def __init__(
        self,
        anomaly_threshold: float = SYNC_ANOMALY_THRESHOLD,
        high_risk_threshold: float = HIGH_RISK_SYNC_THRESHOLD,
    ):
        self.anomaly_threshold = anomaly_threshold
        self.high_risk_threshold = high_risk_threshold

    def analyze(
        self,
        window_sync_scores: List[float],
        window_start_times: List[float],
        window_end_times: List[float],
        window_start_frames: List[int],
        motion_deltas: List[float],
        audio_rms: List[float],
    ) -> Dict[str, Any]:
        """
        Processes window-level sync scores into forensic temporal timeline.
        """
        n_windows = len(window_sync_scores)
        if n_windows == 0:
            return {
                "sync_scores": [],
                "suspicious_intervals": [],
                "statistics": {},
                "temporal_feature_vector": np.zeros(24, dtype=np.float32),
            }

        scores = np.array(window_sync_scores, dtype=np.float32)
        motions = np.array(motion_deltas, dtype=np.float32) if motion_deltas else np.zeros(n_windows)
        energies = np.array(audio_rms, dtype=np.float32) if audio_rms else np.zeros(n_windows)

        # 1. Statistical Aggregations
        mean_sync = float(np.mean(scores))
        std_sync = float(np.std(scores))
        min_sync = float(np.min(scores))
        p10_sync = float(np.percentile(scores, 10))
        p25_sync = float(np.percentile(scores, 25))
        p50_sync = float(np.median(scores))

        # Count anomalous windows
        anomalous_mask = scores < self.anomaly_threshold
        high_risk_mask = scores < self.high_risk_threshold
        anomaly_ratio = float(np.mean(anomalous_mask))
        high_risk_ratio = float(np.mean(high_risk_mask))

        # Calculate longest continuous run of desynchronized windows
        max_run = 0
        current_run = 0
        for is_anom in anomalous_mask:
            if is_anom:
                current_run += 1
                if current_run > max_run:
                    max_run = current_run
            else:
                current_run = 0

        # 2. Cluster Contiguous Anomaly Windows into Intervals
        suspicious_intervals: List[SuspiciousInterval] = []
        in_interval = False
        interval_start_w = 0

        for w_idx in range(n_windows):
            if anomalous_mask[w_idx] and not in_interval:
                in_interval = True
                interval_start_w = w_idx
            elif not anomalous_mask[w_idx] and in_interval:
                in_interval = False
                w_indices = list(range(interval_start_w, w_idx))
                interval_scores = scores[w_indices]
                start_t = window_start_times[interval_start_w]
                end_t = window_end_times[w_idx - 1]

                if (end_t - start_t) >= MIN_ANOMALY_WINDOW_DURATION_SEC:
                    avg_s = float(np.mean(interval_scores))
                    min_s = float(np.min(interval_scores))
                    severity = "HIGH" if min_s < self.high_risk_threshold else "MEDIUM"
                    min_w_idx = interval_start_w + int(np.argmin(interval_scores))
                    peak_frame = window_start_frames[min_w_idx]

                    suspicious_intervals.append(
                        SuspiciousInterval(
                            start_time=start_t,
                            end_time=end_t,
                            avg_sync_score=avg_s,
                            min_sync_score=min_s,
                            severity=severity,
                            window_indices=w_indices,
                            peak_anomaly_frame=peak_frame,
                        )
                    )

        # Handle interval that spans until the end
        if in_interval:
            w_indices = list(range(interval_start_w, n_windows))
            interval_scores = scores[w_indices]
            start_t = window_start_times[interval_start_w]
            end_t = window_end_times[-1]
            if (end_t - start_t) >= MIN_ANOMALY_WINDOW_DURATION_SEC:
                avg_s = float(np.mean(interval_scores))
                min_s = float(np.min(interval_scores))
                severity = "HIGH" if min_s < self.high_risk_threshold else "MEDIUM"
                min_w_idx = interval_start_w + int(np.argmin(interval_scores))
                peak_frame = window_start_frames[min_w_idx]

                suspicious_intervals.append(
                    SuspiciousInterval(
                        start_time=start_t,
                        end_time=end_t,
                        avg_sync_score=avg_s,
                        min_sync_score=min_s,
                        severity=severity,
                        window_indices=w_indices,
                        peak_anomaly_frame=peak_frame,
                    )
                )

        # 3. Construct 24-dimensional fused temporal feature vector for Classifier
        # Cross-correlation between lip motion velocity and audio RMS energy
        if len(motions) > 1 and len(energies) > 1 and np.std(motions) > 1e-6 and np.std(energies) > 1e-6:
            norm_m = (motions - np.mean(motions)) / (np.std(motions) + 1e-6)
            norm_e = (energies - np.mean(energies)) / (np.std(energies) + 1e-6)
            xcorr = np.correlate(norm_m, norm_e, mode="full") / len(motions)
            max_xcorr = float(np.max(xcorr))
            lag_at_max = float(np.argmax(xcorr) - len(motions) + 1)
        else:
            max_xcorr = 0.5
            lag_at_max = 0.0

        temporal_feature_vector = np.array([
            mean_sync,              # 0
            std_sync,               # 1
            min_sync,               # 2
            p10_sync,               # 3
            p25_sync,               # 4
            p50_sync,               # 5
            anomaly_ratio,          # 6
            high_risk_ratio,        # 7
            float(max_run) / max(1.0, float(n_windows)),  # 8
            float(len(suspicious_intervals)),             # 9
            float(np.mean(motions)),                      # 10
            float(np.std(motions)),                       # 11
            float(np.max(motions)),                       # 12
            float(np.mean(energies)),                     # 13
            float(np.std(energies)),                      # 14
            max_xcorr,                                    # 15
            lag_at_max,                                   # 16
            float(scores[0]) if n_windows > 0 else 0.5,   # 17
            float(scores[-1]) if n_windows > 0 else 0.5,  # 18
            float(np.percentile(scores, 75)),             # 19
            float(np.percentile(scores, 90)),             # 20
            float(np.max(scores)),                        # 21
            float(np.sum(anomalous_mask)),                # 22
            float(n_windows),                             # 23
        ], dtype=np.float32)

        return {
            "window_sync_scores": scores.tolist(),
            "suspicious_intervals": [i.to_dict() for i in suspicious_intervals],
            "statistics": {
                "mean_sync": mean_sync,
                "std_sync": std_sync,
                "min_sync": min_sync,
                "p10_sync": p10_sync,
                "anomaly_ratio": anomaly_ratio,
                "high_risk_ratio": high_risk_ratio,
                "max_consecutive_desync": max_run,
                "intervals_count": len(suspicious_intervals),
                "av_xcorr_peak": max_xcorr,
                "estimated_lag_frames": lag_at_max,
            },
            "feature_vector": temporal_feature_vector,
        }
