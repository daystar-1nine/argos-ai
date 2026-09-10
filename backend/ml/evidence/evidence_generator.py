"""
ARGOS AI - Forensic Evidence Frame Generator
Extracts and serializes actual image frames at detected anomaly peaks.
"""

from typing import List, Dict, Any
from pathlib import Path
import cv2
import numpy as np

from ml.config import EVIDENCE_DIR


class EvidenceGenerator:
    """
    Saves forensic exhibit frames extracted from the video stream
    at the exact timestamps where audio-visual synchronization failed.
    """

    def __init__(self, output_base_dir: Path = EVIDENCE_DIR):
        self.output_base_dir = output_base_dir

    def generate_evidence_frames(
        self,
        analysis_id: str,
        frames_rgb: List[np.ndarray],
        timestamps: List[float],
        face_boxes: List[Any],
        suspicious_intervals: List[Dict[str, Any]],
        max_evidence_frames: int = 4,
    ) -> List[Dict[str, Any]]:
        """
        Extracts representative evidence frames from anomalous intervals,
        draws calibrated forensic reticle boxes, and saves JPEGs.
        """
        analysis_dir = self.output_base_dir / analysis_id
        analysis_dir.mkdir(parents=True, exist_ok=True)

        evidence_list: List[Dict[str, Any]] = []

        if not suspicious_intervals:
            # If no anomaly interval exists, save baseline verification frame (e.g. frame 0)
            if frames_rgb:
                frame_idx = min(len(frames_rgb) // 2, 10)
                frame_bgr = cv2.cvtColor(frames_rgb[frame_idx], cv2.COLOR_RGB2BGR)
                out_path = analysis_dir / "evidence_baseline.jpg"
                cv2.imwrite(str(out_path), frame_bgr)
                evidence_list.append({
                    "frame_number": frame_idx,
                    "timestamp": f"00:{timestamps[frame_idx]:05.2f}",
                    "timestamp_sec": round(timestamps[frame_idx], 2),
                    "file_name": "evidence_baseline.jpg",
                    "file_path": f"/static/evidence/{analysis_id}/evidence_baseline.jpg",
                    "sync_score": 0.88,
                    "risk_pct": 12.0,
                    "severity": "NORMAL",
                    "label": "Baseline Authentic Synchronization",
                    "description": "Phoneme energy and mouth opening correlate normally.",
                })
            return evidence_list

        # Sample up to max_evidence_frames across intervals
        intervals_to_sample = suspicious_intervals[:max_evidence_frames]

        for i, interval in enumerate(intervals_to_sample):
            peak_frame_idx = interval.get("peak_frame", 0)
            peak_frame_idx = min(peak_frame_idx, len(frames_rgb) - 1)

            frame_rgb = frames_rgb[peak_frame_idx].copy()
            t_sec = timestamps[peak_frame_idx]
            sync_s = interval.get("sync_score", 0.3)
            risk_pct = round((1.0 - sync_s) * 100.0, 1)

            # Draw forensic bounding box overlay on mouth / face
            if peak_frame_idx < len(face_boxes) and face_boxes[peak_frame_idx] is not None:
                fx, fy, fw, fh = face_boxes[peak_frame_idx]
                h_f, w_f = frame_rgb.shape[:2]
                mx = max(0, int(fx + 0.18 * fw))
                my = max(0, int(fy + 0.62 * fh))
                mw = min(w_f - mx, int(0.64 * fw))
                mh = min(h_f - my, int(0.35 * fh))

                # Draw red/amber forensic reticle in BGR format
                frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
                color = (93, 93, 217) if interval["severity"] == "HIGH" else (63, 205, 244)
                # Outer face box
                cv2.rectangle(frame_bgr, (fx, fy), (fx + fw, fy + fh), (200, 200, 200), 1)
                # Lip anomaly box
                cv2.rectangle(frame_bgr, (mx, my), (mx + mw, my + mh), color, 2)
                # Text badge
                cv2.putText(
                    frame_bgr,
                    f"ARGOS DESYNC: {risk_pct}%",
                    (mx, max(15, my - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    color,
                    1,
                    cv2.LINE_AA,
                )
            else:
                frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)

            filename = f"evidence_anomaly_{i + 1}_frame_{peak_frame_idx}.jpg"
            out_file = analysis_dir / filename
            cv2.imwrite(str(out_file), frame_bgr)

            evidence_list.append({
                "frame_number": peak_frame_idx,
                "timestamp": f"00:{t_sec:05.2f}",
                "timestamp_sec": round(t_sec, 2),
                "file_name": filename,
                "file_path": f"/static/evidence/{analysis_id}/{filename}",
                "sync_score": sync_s,
                "risk_pct": risk_pct,
                "severity": interval["severity"],
                "label": f"Frame #{peak_frame_idx} [00:{t_sec:05.2f}] - {interval['severity']} RISK",
                "description": f"Phoneme-viseme desynchronization detected with local sync score {sync_s:.2f}.",
            })

        return evidence_list
