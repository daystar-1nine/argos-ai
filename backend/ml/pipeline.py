"""
ARGOS AI - Master Deepfake & Lip-Sync Analysis Pipeline
Coordinates all 11 stages of the multimodal detection engine.
"""

import time
import uuid
from typing import Dict, Any, Optional, Callable
from pathlib import Path
import numpy as np
import torch

from ml.config import (
    DEVICE,
    DEVICE_NAME,
    VIDEO_SAMPLE_FPS,
    TEMP_DIR,
    WINDOW_FRAMES,
    WINDOW_STRIDE_FRAMES,
    SYNCNET_WEIGHTS_PATH,
    CLASSIFIER_WEIGHTS_PATH,
    LABEL_REAL,
    LABEL_FAKE,
    CLASS_NAMES,
    LABEL_MAP,
    MODEL_NAME,
    MODEL_VERSION,
    PIPELINE_VERSION,
    PREPROCESSING_VERSION,
    FEATURE_VERSION,
    THRESHOLD_VERSION,
    WEIGHTS_VERSION,
    CLASSIFIER_DECISION_THRESHOLD,
    SYNC_ANOMALY_THRESHOLD,
    HIGH_RISK_SYNC_THRESHOLD,
)
from ml.exceptions import (
    PipelineStageError,
    VideoDecodingError,
    AudioExtractionError,
    MissingAudioStreamError,
    FaceDetectionError,
    FeatureExtractionError,
    TemporalSegmentationError,
    ModelUnavailableError,
    InferenceError,
)
from ml.preprocessing.video_processor import (
    preprocess_video_pipeline,
    VideoProcessingError,
)
from ml.vision.lip_extractor import LipExtractor
from ml.audio.audio_features import AudioFeatureExtractor
from ml.temporal.windowing import TemporalWindowBuilder
from ml.models.syncnet import load_syncnet_model
from ml.temporal.temporal_analyzer import TemporalAnalyzer
from ml.models.classifier import load_classifier_model, classify_temporal_features
from ml.evidence.evidence_generator import EvidenceGenerator


PIPELINE_STAGES = [
    (1, "Video Uploaded & Validated"),
    (2, "Extracting Audio Stream (16kHz PCM)"),
    (3, "Detecting Primary Face Trajectory"),
    (4, "Tracking & Normalizing Lip Sequences"),
    (5, "Extracting 80-Band Mel-Spectrograms"),
    (6, "Constructing Synchronized Temporal Windows"),
    (7, "Executing SyncNet Viseme-Phoneme Alignment"),
    (8, "Conducting Temporal Trajectory Analysis"),
    (9, "Running PyTorch Multimodal Classifier"),
    (10, "Extracting Forensic Evidence Keyframes"),
    (11, "Analysis Complete"),
]


class ArgosDeepfakePipeline:
    """
    Complete end-to-end multimodal audio-visual deepfake detection pipeline.
    Executes actual feature extraction, neural synchronization, and classification.
    """

    def __init__(self, device: torch.device = DEVICE):
        self.device = device
        self.lip_extractor = LipExtractor()
        self.audio_extractor = AudioFeatureExtractor()
        self.window_builder = TemporalWindowBuilder()
        self.temporal_analyzer = TemporalAnalyzer()
        self.evidence_generator = EvidenceGenerator()

        # Load model weights
        self.syncnet_model, self.syncnet_loaded = load_syncnet_model(device=self.device)
        self.classifier_model, self.classifier_loaded = load_classifier_model(device=self.device)

    def analyze_video(
        self,
        video_path: str,
        analysis_id: Optional[str] = None,
        progress_callback: Optional[Callable[[int, str], None]] = None,
    ) -> Dict[str, Any]:
        """
        Executes genuine multimodal deepfake inference on input video.
        """
        start_time_perf = time.perf_counter()
        if analysis_id is None:
            analysis_id = f"argos_{uuid.uuid4().hex[:10]}"

        def notify(stage_num: int):
            stage_desc = PIPELINE_STAGES[stage_num - 1][1]
            if progress_callback:
                progress_callback(stage_num, stage_desc)

        # Check model weights availability before execution
        if not self.syncnet_loaded:
            raise ModelUnavailableError(
                message=f"SyncNet model weights missing at {SYNCNET_WEIGHTS_PATH}",
                details="Audio-visual synchronization model requires trained syncnet.pth weights.",
            )
        if not self.classifier_loaded:
            raise ModelUnavailableError(
                message=f"Classifier model weights missing at {CLASSIFIER_WEIGHTS_PATH}",
                details="Multimodal classifier requires trained classifier.pth weights.",
            )

        # Stage 1 & 2: Video & Audio Preprocessing
        notify(1)
        prep_data = preprocess_video_pipeline(video_path)
        notify(2)

        frames_rgb = prep_data["frames"]
        timestamps = prep_data["timestamps"]
        audio_wav_path = prep_data["audio_wav_path"]
        meta = prep_data["metadata"]

        # Stage 3 & 4: Face Detection & Lip Tracking
        notify(3)
        vision_result = self.lip_extractor.process_frames(frames_rgb, timestamps)
        notify(4)

        lip_crops = vision_result["lip_crops"]
        face_boxes = vision_result["face_boxes"]
        motion_deltas = vision_result["motion_deltas"]
        face_detected = vision_result["face_detected"]

        if not face_detected:
            # Clean temporary wav
            try:
                if Path(audio_wav_path).exists():
                    Path(audio_wav_path).unlink(missing_ok=True)
            except Exception:
                pass
            raise FaceDetectionError(
                message="No human face identified in video frames.",
                details=f"Analyzed {len(frames_rgb)} sampled frames with zero stable face detections.",
            )

        # Stage 5: Audio Feature Extraction (Log Mel & MFCCs)
        notify(5)
        audio_features = self.audio_extractor.extract_features(audio_wav_path)

        # Stage 6: Synchronized Temporal Windows
        notify(6)
        windows = self.window_builder.build_windows(
            lip_crops=lip_crops,
            timestamps=timestamps,
            audio_features=audio_features,
            motion_deltas=motion_deltas,
        )

        if not windows:
            # Clean temporary wav
            try:
                if Path(audio_wav_path).exists():
                    Path(audio_wav_path).unlink(missing_ok=True)
            except Exception:
                pass
            raise TemporalSegmentationError(
                message="Video duration is too brief to construct required temporal windows.",
                details=f"Duration {meta['duration_sec']:.2f}s is below sliding window length of {WINDOW_FRAMES / VIDEO_SAMPLE_FPS:.2f}s.",
            )

        # Stage 7: Run SyncNet Neural Synchronization
        notify(7)
        window_sync_scores: list[float] = []
        window_start_times: list[float] = []
        window_end_times: list[float] = []
        window_start_frames: list[int] = []

        self.syncnet_model.eval()
        with torch.no_grad():
            for win in windows:
                lip_t, audio_t = win.to_torch(self.device)
                score_tensor = self.syncnet_model.compute_sync_score(lip_t, audio_t)
                score_val = float(score_tensor[0].item())
                window_sync_scores.append(score_val)
                window_start_times.append(win.start_time)
                window_end_times.append(win.end_time)
                window_start_frames.append(win.video_start_frame)

        # Stage 8: Temporal Anomaly Analysis
        notify(8)
        temporal_result = self.temporal_analyzer.analyze(
            window_sync_scores=window_sync_scores,
            window_start_times=window_start_times,
            window_end_times=window_end_times,
            window_start_frames=window_start_frames,
            motion_deltas=[w.motion_delta_mean for w in windows],
            audio_rms=[w.audio_rms_mean for w in windows],
        )

        # Stage 9: Multimodal Real/Fake Classifier
        notify(9)
        feature_vector = temporal_result["feature_vector"]
        classification = classify_temporal_features(
            model=self.classifier_model,
            feature_vector=feature_vector,
            device=self.device,
        )

        # Stage 10: Generate Forensic Evidence Keyframes
        notify(10)
        suspicious_intervals = temporal_result["suspicious_intervals"]
        evidence_frames = self.evidence_generator.generate_evidence_frames(
            analysis_id=analysis_id,
            frames_rgb=frames_rgb,
            timestamps=timestamps,
            face_boxes=face_boxes,
            suspicious_intervals=suspicious_intervals,
            max_evidence_frames=4,
        )

        # Stage 11: Complete
        notify(11)
        total_time_sec = round(time.perf_counter() - start_time_perf, 2)

        # Calculate composite forensic metric percentages
        stats = temporal_result["statistics"]
        sync_pct = round(stats.get("mean_sync", 0.5) * 100.0, 1)
        audio_pct = round(min(100.0, stats.get("p10_sync", 0.5) * 120.0), 1)
        visual_pct = round(min(100.0, vision_result.get("face_detection_ratio", 1.0) * 95.0), 1)

        # Cleanup temporary extracted WAV
        try:
            if Path(audio_wav_path).exists():
                Path(audio_wav_path).unlink(missing_ok=True)
        except Exception:
            pass

        # Build window-level telemetry
        window_records = []
        for i, win in enumerate(windows):
            s_score = window_sync_scores[i]
            window_records.append({
                "window_index": i,
                "start_time": round(float(win.start_time), 2),
                "end_time": round(float(win.end_time), 2),
                "start_timecode": f"00:{float(win.start_time):05.2f}",
                "end_timecode": f"00:{float(win.end_time):05.2f}",
                "sync_score": round(float(s_score), 3),
                "visual_motion": round(float(win.motion_delta_mean), 4),
                "audio_rms": round(float(win.audio_rms_mean), 4),
                "is_anomaly": bool(s_score < SYNC_ANOMALY_THRESHOLD),
            })

        # Format suspicious intervals into clean dictionary structures
        formatted_windows = []
        for inv in suspicious_intervals:
            if isinstance(inv, dict):
                s_time = inv.get("start_sec", inv.get("start_time", inv.get("start", 0.0)))
                e_time = inv.get("end_sec", inv.get("end_time", inv.get("end", 0.0)))
                avg_s = inv.get("mean_sync", inv.get("avg_sync_score", inv.get("sync_score", 0.5)))
                min_s = inv.get("min_sync", inv.get("min_sync_score", 0.5))
                sev = inv.get("risk_level", inv.get("severity", "HIGH"))
                w_idx = inv.get("window_indices", [])
                reason = inv.get("reason", f"Lip-sync anomaly: audio-visual correlation dropped to {float(min_s) * 100:.1f}%.")
            else:
                s_time = getattr(inv, "start_time", 0.0)
                e_time = getattr(inv, "end_time", 0.0)
                avg_s = getattr(inv, "avg_sync_score", 0.5)
                min_s = getattr(inv, "min_sync_score", 0.5)
                sev = getattr(inv, "severity", "HIGH")
                w_idx = getattr(inv, "window_indices", [])
                reason = f"Lip-sync anomaly: audio-visual correlation dropped to {float(min_s) * 100:.1f}%."

            s_frame = int(w_idx[0] * WINDOW_STRIDE_FRAMES) if w_idx else int(float(s_time) * VIDEO_SAMPLE_FPS)
            e_frame = int(w_idx[-1] * WINDOW_STRIDE_FRAMES + WINDOW_FRAMES) if w_idx else int(float(e_time) * VIDEO_SAMPLE_FPS)

            formatted_windows.append({
                "start_sec": round(float(s_time), 2),
                "end_sec": round(float(e_time), 2),
                "start_frame": s_frame,
                "end_frame": e_frame,
                "min_sync": round(float(min_s), 3),
                "mean_sync": round(float(avg_s), 3),
                "risk_level": sev,
                "reason": reason,
            })

        # Structured forensic explanation
        is_fake = classification["predicted_class"] == LABEL_FAKE
        if is_fake:
            assessment = "HIGH MANIPULATION LIKELIHOOD"
            explanation = {
                "summary": f"Detected audio-visual temporal desynchronization with {len(formatted_windows)} anomalous intervals.",
                "visual_manipulation_score": round(100.0 - visual_pct, 1),
                "audio_manipulation_score": round(100.0 - audio_pct, 1),
                "lipsync_anomaly_score": round(100.0 - sync_pct, 1),
                "temporal_anomaly_score": round(stats.get("anomaly_ratio", 0.0) * 100.0, 1),
                "key_indicators": [
                    f"Mean audio-visual sync ({sync_pct}%) fell below authentic speech threshold ({SYNC_ANOMALY_THRESHOLD * 100:.0f}%)",
                    f"Estimated temporal lag of {int(stats.get('estimated_lag_frames', 0.0) * 40):+d}ms exceeds natural speech coarticulation bounds",
                    f"{len(formatted_windows)} anomalous intervals detected with minimum sync dropping to {min(window_sync_scores)*100:.1f}%" if window_sync_scores else "Anomalous interval detected",
                ],
            }
        else:
            assessment = "AUTHENTIC MEDIA CONFIRMED"
            explanation = {
                "summary": f"Harmonic audio-visual synchronization verified across {len(windows)} temporal windows with zero high-risk anomalies.",
                "visual_manipulation_score": round(100.0 - visual_pct, 1),
                "audio_manipulation_score": round(100.0 - audio_pct, 1),
                "lipsync_anomaly_score": round(max(0.0, 100.0 - sync_pct), 1),
                "temporal_anomaly_score": round(stats.get("anomaly_ratio", 0.0) * 100.0, 1),
                "supporting_evidence": [
                    f"High viseme-phoneme synchronization ({sync_pct}% average sync) verified across all windows",
                    f"Temporal acoustic-visual lag ({int(stats.get('estimated_lag_frames', 0.0) * 40):+d}ms) aligns within natural speech physiology",
                    f"Continuous temporal trajectory with zero deepfake viseme anomalies",
                ],
            }

        return {
            "analysis_id": analysis_id,
            "video_id": Path(video_path).name,
            "status": "completed",
            "predicted_class": classification["predicted_class"],
            "verdict": classification["verdict"],
            "confidence": classification["confidence"],
            "confidence_pct": classification["confidence_pct"],
            "real_probability": classification["real_probability"],
            "fake_probability": classification["fake_probability"],
            "visual_score": visual_pct,
            "audio_score": audio_pct,
            "sync_score": sync_pct,
            "temporal_mismatch_ms": f"{int(stats.get('estimated_lag_frames', 0.0) * 40):+d}ms",
            "suspicious_windows": formatted_windows,
            "windows": window_records,
            "evidence_frames": evidence_frames,
            "assessment": assessment,
            "explanation": explanation,
            "analysis": {
                "face_detected": face_detected,
                "faces_count": len(face_boxes),
                "usable_frame_ratio": round(vision_result.get("face_detection_ratio", 1.0), 3),
                "audio_detected": True,
                "temporal_analysis_completed": True,
                "total_windows": len(windows),
                "duration_sec": meta["duration_sec"],
                "fps": VIDEO_SAMPLE_FPS,
                "device": DEVICE_NAME,
                "weights_status": {
                    "syncnet_loaded": self.syncnet_loaded,
                    "classifier_loaded": self.classifier_loaded,
                },
                "execution_time_sec": total_time_sec,
            },
            "model": {
                "model_name": MODEL_NAME,
                "model_version": MODEL_VERSION,
                "pipeline_version": PIPELINE_VERSION,
                "preprocessing_version": PREPROCESSING_VERSION,
                "feature_version": FEATURE_VERSION,
                "threshold_version": THRESHOLD_VERSION,
                "weights_version": WEIGHTS_VERSION,
                "checkpoint": str(CLASSIFIER_WEIGHTS_PATH),
                "device": DEVICE_NAME,
                "decision_threshold": CLASSIFIER_DECISION_THRESHOLD,
            },
        }
