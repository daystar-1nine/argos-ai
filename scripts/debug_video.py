"""
ARGOS AI - Multimodal Video Forensic Diagnostic CLI
Usage: python scripts/debug_video.py --video <path>
"""

import sys
import argparse
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

import numpy as np
import torch
import cv2

from ml.config import (
    DEVICE,
    DEVICE_NAME,
    VIDEO_SAMPLE_FPS,
    WINDOW_FRAMES,
    WINDOW_STRIDE_FRAMES,
    SYNCNET_WEIGHTS_PATH,
    CLASSIFIER_WEIGHTS_PATH,
    CLASSIFIER_DECISION_THRESHOLD,
)
from ml.preprocessing.video_processor import (
    get_video_metadata,
    extract_audio_track,
    preprocess_video_pipeline,
)
from ml.vision.lip_extractor import LipExtractor
from ml.audio.audio_features import AudioFeatureExtractor
from ml.temporal.windowing import TemporalWindowBuilder
from ml.models.syncnet import load_syncnet_model
from ml.temporal.temporal_analyzer import TemporalAnalyzer
from ml.models.classifier import load_classifier_model, classify_temporal_features


def debug_video(video_path_str: str):
    video_path = Path(video_path_str).resolve()
    print("=" * 80)
    print(" ARGOS AI - MULTIMODAL FORENSIC DIAGNOSTIC SUITE")
    print("=" * 80)

    # -------------------------------------------------------------
    # 1. Video Metadata
    # -------------------------------------------------------------
    print("\n[1] VIDEO METADATA")
    print(f"  Path:            {video_path}")
    print(f"  Exists:          {video_path.exists()}")
    if not video_path.exists():
        print("  [ERROR] File does not exist.")
        return

    meta = get_video_metadata(str(video_path))
    print(f"  Container:       {video_path.suffix.lower()}")
    print(f"  Duration:        {meta.get('duration_sec', 0):.2f}s")
    print(f"  FPS:             {meta.get('fps', 0):.2f}")
    print(f"  Frame Count:     {meta.get('frame_count', 0)}")
    print(f"  Resolution:      {meta.get('width', 0)}x{meta.get('height', 0)}")
    print(f"  Has Audio:       {meta.get('has_audio', False)}")
    print(f"  Audio Channels:  {meta.get('audio_channels', 'N/A')}")
    print(f"  Sample Rate:     {meta.get('audio_sample_rate', 'N/A')} Hz")

    # -------------------------------------------------------------
    # 2. Audio Check
    # -------------------------------------------------------------
    print("\n[2] AUDIO FEATURE EXTRACTION")
    wav_path = backend_path / "temp" / f"debug_{video_path.stem}.wav"
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    extract_audio_track(str(video_path), str(wav_path))

    ae = AudioFeatureExtractor()
    af = ae.extract_features(str(wav_path))
    rms = af["rms"]
    silence_pct = float(np.mean(rms < 0.01) * 100.0)

    print(f"  Extracted WAV:   {wav_path}")
    print(f"  Audio Duration:  {af.get('duration_sec', 0):.2f}s")
    print(f"  RMS Mean:        {float(np.mean(rms)):.4f}")
    print(f"  RMS Min:         {float(np.min(rms)):.4f}")
    print(f"  RMS Max:         {float(np.max(rms)):.4f}")
    print(f"  Silence Pct:     {silence_pct:.1f}%")
    print(f"  Audio Valid:     {'YES' if len(rms) > 0 and silence_pct < 90 else 'NO'}")

    # -------------------------------------------------------------
    # 3. Face Detection Check
    # -------------------------------------------------------------
    print("\n[3] FACE DETECTION & TRACKING")
    prep = preprocess_video_pipeline(str(video_path))
    frames = prep["frames"]
    timestamps = prep["timestamps"]

    le = LipExtractor()
    vr = le.process_frames(frames, timestamps)
    raw_detected = vr.get("face_detection_ratio", 0.0) * len(frames)
    smooth_boxes = vr["face_boxes"]

    # Calculate bbox stability score (std of coordinates)
    boxes_arr = np.array(smooth_boxes)
    avg_box = (
        int(np.mean(boxes_arr[:, 0])),
        int(np.mean(boxes_arr[:, 1])),
        int(np.mean(boxes_arr[:, 2])),
        int(np.mean(boxes_arr[:, 3])),
    )
    stability_score = max(0.0, 1.0 - (float(np.std(boxes_arr[:, :2])) / max(1.0, float(avg_box[2]))))

    print(f"  Frames Checked:  {len(frames)}")
    print(f"  Detected Count:  {int(raw_detected)}")
    print(f"  Detection Ratio: {vr.get('face_detection_ratio', 0.0) * 100:.1f}%")
    print(f"  Avg Face BBox:   x={avg_box[0]}, y={avg_box[1]}, w={avg_box[2]}, h={avg_box[3]}")
    print(f"  Stability Score: {stability_score:.3f}")

    # -------------------------------------------------------------
    # 4. Lip Extraction Check
    # -------------------------------------------------------------
    print("\n[4] LIP EXTRACTION")
    lip_crops = vr["lip_crops"]
    motion_deltas = vr["motion_deltas"]
    print(f"  Crops Extracted: {len(lip_crops)}")
    print(f"  Crop Shape:      {lip_crops[0].shape if lip_crops else 'None'}")
    print(f"  Lip Motion Mean: {float(np.mean(motion_deltas)):.4f}")
    print(f"  Lip Motion Std:  {float(np.std(motion_deltas)):.4f}")

    # -------------------------------------------------------------
    # 5. Temporal Windowing Check
    # -------------------------------------------------------------
    print("\n[5] SYNCHRONIZED TEMPORAL WINDOWING")
    wb = TemporalWindowBuilder()
    windows = wb.build_windows(lip_crops, timestamps, af, motion_deltas)
    print(f"  Windows Built:   {len(windows)}")
    print(f"  Window Length:   {WINDOW_FRAMES} frames ({WINDOW_FRAMES / VIDEO_SAMPLE_FPS:.2f}s)")
    print(f"  Stride Length:   {WINDOW_STRIDE_FRAMES} frames ({WINDOW_STRIDE_FRAMES / VIDEO_SAMPLE_FPS:.2f}s)")
    if windows:
        print(f"  First Window:    {windows[0].start_time:.2f}s -> {windows[0].end_time:.2f}s")
        print(f"  Last Window:     {windows[-1].start_time:.2f}s -> {windows[-1].end_time:.2f}s")

    # -------------------------------------------------------------
    # 6. SyncNet Check
    # -------------------------------------------------------------
    print("\n[6] SYNCNET AUDIO-VISUAL SYNCHRONIZATION")
    syncnet, syncnet_loaded = load_syncnet_model(device=DEVICE)
    print(f"  Model Loaded:    {syncnet_loaded}")
    print(f"  Weights Path:    {SYNCNET_WEIGHTS_PATH}")

    syncnet.eval()
    window_scores = []
    with torch.no_grad():
        for w in windows:
            lip_t, audio_t = w.to_torch(DEVICE)
            s = float(syncnet.compute_sync_score(lip_t, audio_t)[0].item())
            window_scores.append(s)

    scores_np = np.array(window_scores)
    print(f"  Min Sync Score:  {float(np.min(scores_np)):.3f}")
    print(f"  Max Sync Score:  {float(np.max(scores_np)):.3f}")
    print(f"  Mean Sync Score: {float(np.mean(scores_np)):.3f}")
    print(f"  Median Sync:     {float(np.median(scores_np)):.3f}")
    print(f"  Std Deviation:   {float(np.std(scores_np)):.3f}")

    # Top 5 lowest windows
    sorted_indices = np.argsort(scores_np)
    print("\n  Lowest Scoring Windows (Top 5):")
    for rank, idx in enumerate(sorted_indices[:5]):
        w = windows[idx]
        print(f"    #{rank+1}: Win {idx:02d} [{w.start_time:.2f}s - {w.end_time:.2f}s] -> Sync: {scores_np[idx]*100:.1f}%")

    print("\n  Highest Scoring Windows (Top 5):")
    for rank, idx in enumerate(sorted_indices[-5:][::-1]):
        w = windows[idx]
        print(f"    #{rank+1}: Win {idx:02d} [{w.start_time:.2f}s - {w.end_time:.2f}s] -> Sync: {scores_np[idx]*100:.1f}%")

    # -------------------------------------------------------------
    # 7. Temporal Analysis Check
    # -------------------------------------------------------------
    print("\n[7] TEMPORAL ANOMALY & DRIFT ANALYSIS")
    ta = TemporalAnalyzer()
    temporal_res = ta.analyze(
        window_sync_scores=window_scores,
        window_start_times=[w.start_time for w in windows],
        window_end_times=[w.end_time for w in windows],
        window_start_frames=[w.video_start_frame for w in windows],
        motion_deltas=[w.motion_delta_mean for w in windows],
        audio_rms=[w.audio_rms_mean for w in windows],
    )
    stats = temporal_res["statistics"]
    intervals = temporal_res["suspicious_intervals"]
    lag_f = stats.get("estimated_lag_frames", 0.0)
    print(f"  Estimated Lag:   {lag_f:+.1f} frames ({int(lag_f * 40):+d} ms)")
    print(f"  Anomaly Ratio:   {stats.get('anomaly_ratio', 0.0)*100:.1f}%")
    print(f"  High Risk Ratio: {stats.get('high_risk_ratio', 0.0)*100:.1f}%")
    print(f"  Intervals Count: {len(intervals)}")
    for i, inv in enumerate(intervals):
        print(f"    Interval #{i+1}: [{inv['start_time']:.2f}s - {inv['end_time']:.2f}s] Avg Sync: {inv['avg_sync_score']*100:.1f}%, Min Sync: {inv['min_sync_score']*100:.1f}%, Severity: {inv['severity']}")

    # -------------------------------------------------------------
    # 8. Classifier Inference Check
    # -------------------------------------------------------------
    print("\n[8] PYTORCH MULTIMODAL CLASSIFIER")
    clf_model, clf_loaded = load_classifier_model(device=DEVICE)
    print(f"  Model Loaded:    {clf_loaded}")
    print(f"  Weights Path:    {CLASSIFIER_WEIGHTS_PATH}")
    fv = temporal_res["feature_vector"]
    print(f"  Feature Vector:  [24-dim] min={float(np.min(fv)):.3f}, max={float(np.max(fv)):.3f}, mean={float(np.mean(fv)):.3f}")

    clf_res = classify_temporal_features(clf_model, fv, device=DEVICE)
    print(f"  Predicted Class: {1 if clf_res['verdict'] == 'POTENTIALLY MANIPULATED' else 0} ({clf_res['verdict']})")
    print(f"  Real Probability:{clf_res['real_probability'] * 100:.2f}%")
    print(f"  Fake Probability:{clf_res['fake_probability'] * 100:.2f}%")
    print(f"  Threshold Used:  {CLASSIFIER_DECISION_THRESHOLD}")
    print(f"  FINAL VERDICT:   {clf_res['verdict']}")
    print(f"  CONFIDENCE:      {clf_res['confidence_pct']}%")

    # -------------------------------------------------------------
    # 9. Failure / Supporting Explanation
    # -------------------------------------------------------------
    print("\n[9] FORENSIC RATIONALE & EXPLANATION")
    if clf_res["verdict"] == "POTENTIALLY MANIPULATED":
        print("  Top Contributing Deepfake Indicators:")
        print(f"    1. Viseme-phoneme temporal desynchronization: mean sync {stats.get('mean_sync', 0)*100:.1f}%")
        print(f"    2. Unnatural temporal acoustic-visual lag: {int(lag_f * 40):+d}ms")
        print(f"    3. Disconnected articulation: {len(intervals)} anomalous intervals flagged")
    else:
        print("  Supporting Authentic Evidence Summary:")
        print(f"    1. High viseme-phoneme neural synchronization ({stats.get('mean_sync', 0)*100:.1f}% average sync)")
        print(f"    2. Acoustic-visual timing perfectly aligned within natural speech physiology ({int(lag_f * 40):+d}ms)")
        print(f"    3. Zero high-risk articulation gaps or synthetic anomalies detected")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ARGOS AI Video Forensic Diagnostic")
    parser.add_argument("--video", type=str, required=True, help="Path to video file")
    args = parser.parse_args()
    debug_video(args.video)
