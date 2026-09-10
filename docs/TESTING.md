# ARGOS AI — Real Video Testing & Model Evaluation Guide

This guide provides reproducible instructions for testing real video files through the ARGOS AI Multimodal Audio-Visual Lip-Sync & Deepfake Detection Engine (**Problem Statement 4**).

---

## 1. Directory Structure

Place test videos in the `data/test/` directory categorized by ground truth:

```
data/
└── test/
    ├── real/
    │   ├── real_01.mp4
    │   ├── real_02.mp4
    │   └── real_03.mp4
    │
    ├── fake/
    │   ├── fake_01.mp4
    │   ├── fake_02.mp4
    │   └── fake_03.mp4
    │
    └── edge_cases/
        ├── no_audio.mp4       (Silent video stream)
        └── no_face.mp4        (Video without human face)
```

### Supported Media Formats
The system accepts:
- `.mp4`
- `.mov`
- `.avi`
- `.webm`
- `.mkv`

---

## 2. Ground-Truth Labeling Guidelines

Never assume a video is authentic or manipulated without verified metadata:

### Determining `REAL` Ground Truth:
1. **Camera Provenance**: Captured directly from optical sensor without post-capture neural speech synthesis or video generation models.
2. **Audio-Visual Temporal Coherence**: Acoustic phonemes (formants, syllable bursts) correlate temporally with physical jaw, lip, and viseme articulations.
3. **Continuous Motion Trajectory**: No temporal jitter, visual warping boundaries, or frozen facial frames during ongoing vocal audio.

### Determining `FAKE` Ground Truth:
1. **Lip-Sync Manipulation (Wav2Lip, LipGAN, SadTalker, etc.)**: Target facial lips morphed to match an arbitrary speech recording.
2. **Face-Swap (DeepFaceLab, SimSwap, RoOP)**: Identity facial replacement where mouth opening kinematics do not correlate with speech acoustics.
3. **Audio Replacement / Voice Cloning**: Authentic video with cloned synthetic audio substituted, resulting in temporal phase delay and phoneme desynchronization.
4. **Frozen Visemes**: Speech audio active while mouth remains stationary or frozen.

---

## 3. Single Video Inference CLI

Run single video forensic inference using `scripts/test_video.py`:

```powershell
python scripts/test_video.py --video data/test/real/real_01.mp4
```

### With Visual Debug Artifacts:
```powershell
python scripts/test_video.py --video data/test/fake/fake_01.mp4 --debug
```

### Command Arguments:
- `--video <path>`: Required path to video file.
- `--debug`: Generates Log Mel-spectrogram plot, temporal sync curve, face bounding boxes, and normalized lip crops.
- `--output-dir <path>`: Custom output folder (defaults to `results/`).
- `--ground-truth real|fake`: Optional ground truth for scoring.

### Output Generated:
1. **Terminal Report**: Complete forensic breakdown with confidence, probabilities, AV sync score, suspicious window timecodes, evidence frame paths, and sub-stage timings.
2. **Per-Video Result JSON**: `results/<video_id>.json`
3. **Timeline CSV**: `results/<video_id>_timeline.csv`
4. **Keyframe Exhibits**: `results/evidence/<video_id>/frame_XXXX.jpg`
5. **Debug Artifacts** (if `--debug`):
   - `results/debug/<video_id>/temporal_sync_plot.png`
   - `results/debug/<video_id>/mel_spectrogram.png`
   - `results/debug/<video_id>/faces/`
   - `results/debug/<video_id>/lips/`
   - `results/debug/<video_id>/analysis_debug.json`

---

## 4. Batch Dataset Evaluation & Metrics CLI

Evaluate an entire dataset of real and fake videos to compute statistical metrics:

```powershell
python scripts/evaluate_dataset.py --real data/test/real --fake data/test/fake
```

### Calculated Evaluation Metrics:
- **Accuracy**: $\frac{\text{TP} + \text{TN}}{\text{Total}}$
- **Precision**: $\frac{\text{TP}}{\text{TP} + \text{FP}}$
- **Recall**: $\frac{\text{TP}}{\text{TP} + \text{FN}}$
- **F1 Score**: $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$
- **ROC-AUC**: Area under the Receiver Operating Characteristic curve based on calibrated fake probabilities.
- **Confusion Matrix**:
  ```
                   Predicted
                   Real   Fake
  Actual Real       TN     FP
  Actual Fake       FN     TP
  ```

### Artifacts Exported:
- `results/evaluation_results.csv`: Row-by-row table containing `video, ground_truth, prediction, confidence, real_probability, fake_probability, sync_score, processing_time`.
- `results/evaluation_metrics.json`: Full statistical metrics report.

---

## 5. Edge Cases & Failure Mode Handling

ARGOS AI implements strict failure mode reporting without generating fabricated results:

| Condition | Result Status | Terminal / API Output |
| :--- | :--- | :--- |
| **Silent Video (No Audio Track)** | `unavailable` | `AV SYNC ANALYSIS UNAVAILABLE: No audio stream detected.` |
| **No Human Face Detected** | `unavailable` | `FACE NOT DETECTED: No human face identified in video frames.` |
| **Corrupted Media Stream** | `invalid` | `INVALID MEDIA: Unable to decode video stream.` |
| **Audio Track Extraction Failure** | `failed` | `AUDIO EXTRACTION FAILED` |
| **Missing Model Weights** | `unavailable` | `MODEL UNAVAILABLE: Required weights missing` |

---

## 6. Frontend Test Lab Interface

Access the interactive Test Lab at:
```
http://localhost:3000/test-lab
```

### Capabilities:
1. **Single Video Evaluation**: Upload any video or select from the pre-seeded benchmark library. Watch the live 11-stage checklist execute with animated stage progress, view the native video preview, and inspect the real extracted evidence keyframe exhibits.
2. **Compare Real vs Fake**: Select authentic media and manipulated media side-by-side to inspect comparative metrics and visual temporal continuity bars.
3. **Batch Benchmark Summary**: View the confusion matrix and download `evaluation_results.csv`.

---

## 7. Test Lab REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/test-lab/samples` | `GET` | Returns available benchmark video files. |
| `/api/test-lab/analyze` | `POST` | Uploads multipart video payload and starts background analysis. |
| `/api/test-lab/analyze-sample` | `POST` | Dispatches analysis on pre-seeded sample. |
| `/api/test-lab/{test_id}` | `GET` | Returns real-time status and stage progress percentage. |
| `/api/test-lab/{test_id}/result` | `GET` | Returns full inference report, timeline, and model versioning. |
| `/api/test-lab/{test_id}/evidence/{filename}` | `GET` | Serves extracted keyframe JPEG exhibit. |
| `/api/test-lab/{test_id}/debug/{filename}` | `GET` | Serves debug spectrogram or sync curve PNG. |
| `/api/test-lab/compare` | `POST` | Returns comparative differential matrix for two test IDs. |

---

## 8. Reproducibility & Environment Parameters

To reproduce the exact evaluation results on another system:

- **Python Version**: Python 3.10+ (tested on Python 3.14 on Windows)
- **PyTorch**: 2.0+
- **OpenCV**: `opencv-python` 4.8+
- **FFmpeg**: `imageio-ffmpeg` (bundled binary)
- **Acoustic Processing**: `librosa` 0.10+, `soundfile`
- **Hardware**: CPU (multi-threaded) or NVIDIA GPU (CUDA)
- **Model Checkpoints**:
  - `backend/models/syncnet.pth` (6.6 MB)
  - `backend/models/classifier.pth` (25.9 KB)

To synthesize the standard test video suite:
```powershell
python scripts/create_test_dataset.py
```
