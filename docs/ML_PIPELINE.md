# ARGOS AI — Audio-Visual Temporal Lip-Sync & Deepfake Detection Engine
## Technical Specification & Architecture (Problem Statement 4)

---

### Executive Overview

ARGOS AI incorporates a genuine, zero-mock multimodal deepfake detection engine specifically engineered to solve **Problem Statement 4: "Audio-Visual Temporal Lip-Sync & Deepfake Detection"**.

Unlike superficial classifiers that evaluate isolated frames or single audio spectrograms, the ARGOS AI forensic engine evaluates **cross-modal temporal synchronization** between speech kinematics (lip/mouth movements) and acoustic phonemes (vocal tract frequency modulations) across synchronized sliding temporal windows.

---

### End-to-End Multimodal Pipeline Architecture

The detection engine executes an **11-stage pipeline** orchestrated by `ArgosDeepfakePipeline` (`backend/ml/pipeline.py`):

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             INPUT VIDEO STREAM                             │
│                  (MP4 / MOV / AVI / WEBM with Video + Audio)               │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
                   ┌──────────────────────────────────────┐
                   │ Stage 1: Video Ingest & Validation   │
                   └──────────────────┬───────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
  ┌─────────────────────────────┐           ┌─────────────────────────────┐
  │ Stage 2: Audio Extraction   │           │ Stage 3: Frame Sampling     │
  │ 16,000 Hz, 16-bit Mono WAV  │           │ Exactly 25.0 FPS RGB Frames │
  └──────────────┬──────────────┘           └──────────────┬──────────────┘
                 │                                         │
                 ▼                                         ▼
  ┌─────────────────────────────┐           ┌─────────────────────────────┐
  │ Stage 5: Acoustic Features  │           │ Stage 4: Lip ROI Extraction │
  │ 80-Band Mel Spectrogram     │           │ OpenCV YuNet/Haar Face Det. │
  │ Hop=160 (100 Hz Mel Rate)   │           │ 96x96 Grayscale Lip Crop    │
  │ 13-dim MFCCs + Energy RMS   │           │ Temporal Motion Smoothing   │
  └──────────────┬──────────────┘           └──────────────┬──────────────┘
                 │                                         │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Stage 6: Synchronized Window Slicing    │
                 │ Window: 20 visual frames = 0.8 seconds  │
                 │ Audio: 80 mel frames = 0.8 seconds      │
                 │ Stride: 5 frames = 0.2 seconds          │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Stage 7: Dual-Stream SyncNet Encoders   │
                 │ Visual: 3D ConvNet [B, 1, 20, 96, 96]   │
                 │ Audio:  2D ConvNet [B, 1, 80, 80]       │
                 │ Output: 256-dim L2-normalized vectors   │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Stage 8: Cross-Modal Cosine Alignment  │
                 │ S(t) = 0.5 * (cos(v_t, a_t) + 1.0)      │
                 │ Continuous Synchronization Trajectory   │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Stage 9: Multimodal Classifier          │
                 │ 24-dim Temporal Feature Vector          │
                 │ MLP Classifier (BatchNorm + Dropout)    │
                 │ Verdict: REAL vs POTENTIALLY_MANIPULATED│
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Stage 10: Evidence Keyframe Extraction  │
                 │ Localize Anomaly Peaks (< 0.55 sync)    │
                 │ Extract Annotated Bounding Box JPEGs    │
                 └────────────────────┬────────────────────┘
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │ Stage 11: Cryptographic Report Signing  │
                 │ Signed Forensic JSON Manifest           │
                 └─────────────────────────────────────────┘
```

---

### Temporal Synchronization Mathematics

A fundamental challenge in multi-modal video forensics is guaranteeing mathematical alignment between visual frames and acoustic representations. ARGOS AI solves this with exact temporal coupling:

1. **Visual Sampling Rate**: \(FPS = 25.0\) frames per second (\(40.0\,\text{ms}\) per video frame).
2. **Audio Sampling Rate**: \(f_s = 16,000\,\text{Hz}\).
3. **Mel Spectrogram Hop Length**: \(hop = 160\) samples.
4. **Mel Frame Duration**:
   \[
   \Delta t_{\text{mel}} = \frac{160}{16000} = 0.010\,\text{s} = 10.0\,\text{ms}
   \]
5. **Exact Alignment Ratio**:
   \[
   \text{Ratio} = \frac{\Delta t_{\text{video}}}{\Delta t_{\text{mel}}} = \frac{40\,\text{ms}}{10\,\text{ms}} = 4.0
   \]
   **Exactly 4 Mel-spectrogram frames correspond to 1 video frame.**

6. **Sliding Window Specification**:
   - Window size: \(W = 20\,\text{frames} = 0.80\,\text{seconds}\).
   - Audio slice: \(20 \times 4 = 80\,\text{Mel frames} = 0.80\,\text{seconds}\).
   - Window stride: \(S = 5\,\text{frames} = 0.20\,\text{seconds}\).
   - Overlap: \(75\%\).

---

### Neural Network Architectures

#### 1. Visual Lip Encoder (`VisualLipEncoder`)
- **Input**: `[Batch, 1, 20, 96, 96]` (Batch, Channel, Depth/Time, Height, Width).
- **Architecture**:
  - 3D Convolution (`kernel=(3, 5, 5)`, `stride=(1, 2, 2)`) + BatchNorm3d + ReLU + MaxPool3d.
  - 3D Convolution (`kernel=(3, 3, 3)`, `stride=(1, 1, 1)`) + BatchNorm3d + ReLU + MaxPool3d.
  - 3D Convolution (`kernel=(3, 3, 3)`, `stride=(1, 1, 1)`) + BatchNorm3d + ReLU.
  - 3D Convolution (`kernel=(3, 3, 3)`, `stride=(1, 1, 1)`) + BatchNorm3d + ReLU.
  - AdaptiveAvgPool3d to `[Batch, 256, 1, 1, 1]`.
  - Linear projection to 256 dimensions.
  - \(L_2\) normalization: \(\|\mathbf{v}\|_2 = 1.0\).

#### 2. Audio Spectrogram Encoder (`AudioSpectrogramEncoder`)
- **Input**: `[Batch, 1, 80, 80]` (Batch, Channel, Mel Bands, Time Steps).
- **Architecture**:
  - 2D Convolution (`kernel=(3, 3)`, `stride=2`, `padding=1`) + BatchNorm2d + ReLU.
  - 2D Convolution (`kernel=(3, 3)`, `stride=2`, `padding=1`) + BatchNorm2d + ReLU.
  - 2D Convolution (`kernel=(3, 3)`, `stride=2`, `padding=1`) + BatchNorm2d + ReLU.
  - 2D Convolution (`kernel=(3, 3)`, `stride=2`, `padding=1`) + BatchNorm2d + ReLU.
  - AdaptiveAvgPool2d to `[Batch, 256, 1, 1]`.
  - Linear projection to 256 dimensions.
  - \(L_2\) normalization: \(\|\mathbf{a}\|_2 = 1.0\).

#### 3. Cross-Modal Alignment Metric
Given visual embedding \(\mathbf{v}_i\) and audio embedding \(\mathbf{a}_i\):
\[
S_i = \frac{1}{2} \left( \frac{\mathbf{v}_i \cdot \mathbf{a}_i}{\|\mathbf{v}_i\|_2 \|\mathbf{a}_i\|_2} + 1.0 \right) \in [0.0, 1.0]
\]
- \(S_i \ge 0.55\): Synchronized audio-visual speech.
- \(S_i < 0.55\): Anomalous temporal desynchronization / synthetic manipulation.

#### 4. Multimodal Deepfake Classifier (`MultimodalDeepfakeClassifier`)
- **Input**: 24-dimensional fused temporal feature vector:
  - Trajectory Statistics (8): Mean, std, min, max, 10th percentile, 25th percentile, median, 75th percentile of \(S(t)\).
  - Anomaly Properties (4): Ratio of windows \(< 0.55\), ratio \(< 0.40\), maximum contiguous anomaly run, total anomaly count.
  - Acoustic Consistency (4): Mean audio energy, audio variance, mean spectral flux, acoustic dynamic range.
  - Visual Kinematics (4): Mean lip motion delta, motion variance, temporal acceleration, face stability ratio.
  - Cross-Modal Lag (4): Negative lag correlation, positive lag correlation, lag peak frame offset, correlation sharpness.
- **Layers**:
  - `Linear(24, 64)` + `BatchNorm1d` + `ReLU` + `Dropout(0.3)`
  - `Linear(64, 32)` + `BatchNorm1d` + `ReLU` + `Dropout(0.2)`
  - `Linear(32, 2)` + `Softmax`
- **Output**:
  - `verdict`: `"REAL"` or `"POTENTIALLY_MANIPULATED"`
  - `confidence`: Calibrated probability \([0.0, 1.0]\)
  - `real_probability` & `fake_probability`

---

### Model Weights & Training Pipeline

Pretrained model weights are stored in `backend/models/`:
- `backend/models/syncnet.pth` (~6.6 MB)
- `backend/models/classifier.pth` (~26 KB)

To retrain or fine-tune models from scratch:
```bash
python scripts/train_baseline.py
```
This executes:
1. Synthetic audio-visual dataset generation with realistic phoneme-viseme couplings and synthetic temporal lag / visual artifacts.
2. SyncNet contrastive loss optimization with AdamW and CosineAnnealingLR.
3. Multimodal deepfake classifier cross-entropy training with validation evaluation.

---

### REST API Reference

#### 1. `POST /api/v1/analyze`
Accepts video file upload and initiates asynchronous 11-stage analysis.
- **Request**: `multipart/form-data` with `file: UploadFile` (.mp4, .mov, .avi, .webm)
- **Response**:
  ```json
  {
    "analysis_id": "argos_f28a9b10c4",
    "status": "processing",
    "stage": 1,
    "stage_name": "Video Uploaded & Validated",
    "progress_pct": 5,
    "message": "Video successfully ingested. Multimodal neural analysis pipeline initiated."
  }
  ```

#### 2. `POST /api/v1/analyze/sample`
Executes real 11-stage analysis on a pre-synthesized benchmark video stream.
- **Request**: `POST /api/v1/analyze/sample?sample_type=authentic` or `sample_type=manipulated`
- **Response**: Returns job tracking object.

#### 3. `GET /api/v1/analyze/{analysis_id}`
Returns real-time progress during processing, or full forensic report upon completion:
```json
{
  "analysis_id": "argos_f28a9b10c4",
  "status": "completed",
  "verdict": "POTENTIALLY_MANIPULATED",
  "confidence": 0.984,
  "confidence_pct": 98.4,
  "real_probability": 0.016,
  "fake_probability": 0.984,
  "visual_score": 85.2,
  "audio_score": 78.4,
  "sync_score": 41.2,
  "temporal_mismatch_ms": "+120ms",
  "suspicious_windows": [
    {
      "start_sec": 1.2,
      "end_sec": 2.4,
      "start_frame": 30,
      "end_frame": 60,
      "min_sync": 0.38,
      "mean_sync": 0.44,
      "risk_level": "HIGH",
      "reason": "Lip-sync anomaly: audio-visual correlation dropped to 38.0% with estimated +120ms lag."
    }
  ],
  "evidence_frames": [
    {
      "frame_idx": 45,
      "timestamp_sec": 1.8,
      "timestamp_formatted": "00:01.80",
      "risk_pct": 92.5,
      "reason": "Viseme mismatch: vocal formant peak without corresponding lip opening.",
      "image_url": "/api/v1/analyze/argos_f28a9b10c4/frames/evidence_frame_045.jpg",
      "filename": "evidence_frame_045.jpg"
    }
  ],
  "analysis": {
    "face_detected": true,
    "audio_detected": true,
    "temporal_analysis_completed": true,
    "total_windows": 18,
    "duration_sec": 4.2,
    "fps": 25.0,
    "device": "CPU (Multi-Threaded)",
    "execution_time_sec": 1.48
  }
}
```

#### 4. `GET /api/v1/analyze/{analysis_id}/frames/{frame_filename}`
Serves actual extracted exhibit keyframe JPEGs.

#### 5. `GET /api/v1/analyze/system/device`
Returns hardware acceleration telemetry (CPU vs CUDA, PyTorch version, codecs).

---

### Command Line Inference

Analyze any video directly from terminal:
```bash
python scripts/run_inference.py --video path/to/target.mp4 --device cpu
```

Run automated end-to-end verification tests:
```bash
python backend/tests/test_ml_pipeline.py
```
