# 🛡️ ARGOS AI — Protect. Detect. Verify. Respond.

> **Next-Generation Multimodal Deepfake Forensics & Digital Media Provenance Platform**  
> *Addressing Problem Statement 4: Audio-Visual Temporal Lip-Sync & Deepfake Detection*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C?style=flat&logo=pytorch&logoColor=white)](https://pytorch.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing-brightgreen?style=flat&logo=pytest&logoColor=white)]()

---

## 📌 Executive Summary

Modern deepfakes and AI voice clones are weaponized to engineer financial fraud, election manipulation, and executive impersonation. Conventional frame-by-frame visual classifiers fail against high-resolution neural rendering engines because they disregard **temporal cross-modal physics** — specifically the precise biomechanical coupling between human phoneme articulation and acoustic pressure waves.

**ARGOS AI** solves this through a unified forensic ecosystem:
1. **Audio-Visual Temporal Lip-Sync & Deepfake Detection Engine**: An 11-stage spatiotemporal pipeline combining 3D visual convolution, 2D spectral audio processing, modified SyncNet cross-modal alignment (trained with InfoNCE contrastive loss), and a 24-dimensional temporal kinematic classifier.
2. **End-to-End Media Protection Lifecycle**: Proactive defense integrating Authenticity Gates, Media DNA perceptual hashing, C2PA Content Credentials, imperceptible DCT/DWT robust watermarking, real-time web/social leak monitoring, and automated incident takedowns.

ARGOS AI enforces a **strict Zero-Mock, Zero-Hardcoded architecture**: every verdict, confidence score, anomaly interval, and forensic exhibit originates directly from actual model inference and physical signal analysis.

---

## 🏗️ Architecture & Dual-Workflow Philosophy

ARGOS AI separates Media Forensics into two distinct, production-grade workflows:

```mermaid
graph TD
    subgraph Flow A: Free Detection & ML Test Lab
        A1[Raw Video Upload] --> A2[FFmpeg Decoding & Validation]
        A2 --> A3[Dominant Face Anchor Tracking]
        A3 --> A4[96x96 Lip ROI Normalization]
        A2 --> A5[16kHz Audio & Log-Mel Extraction]
        A4 & A5 --> A6[0.8s Synchronized Temporal Windows]
        A6 --> A7[Dual-Stream SyncNet Cross-Modal Alignment]
        A7 --> A8[Kinematic Aperture & Coarticulation Analysis]
        A8 --> A9[24-D Multimodal Feature Fusion]
        A9 --> A10[Calibrated Neural Classifier]
        A10 --> A11[Forensic Assessment, Timeline & Exhibits]
    end

    subgraph Flow B: Enterprise Protection Engine Pro
        B1[Authentic Asset Ingestion] --> B2[Authenticity Gate Verification]
        B2 --> B3[Media DNA Perceptual Fingerprinting]
        B3 --> B4[C2PA Content Credentials Signing]
        B4 --> B5[Invisible Frequency-Domain Watermarking]
        B5 --> B6[Cryptographic Provenance Certificate]
        B6 --> B7[Active Social/Web Leak Monitoring]
        B7 --> B8[Automated Incident Response & Takedowns]
    end
```

---

## 🔬 The 11-Stage Forensic Pipeline (Under the Hood)

Each video uploaded to `/api/v1/analyze` or processed via `scripts/test_video.py` passes through 11 mathematically verified stages:

```
[01/11] VIDEO VALIDATION       -> FFmpeg container integrity, codec verification & frame rate normalization (25 FPS)
[02/11] AUDIO EXTRACTION       -> Resampling to 16kHz mono 16-bit PCM; raises MissingAudioStreamError on silent tracks
[03/11] FACE DETECTION         -> Dominant anchor tracking, EMA smoothing & outlier filtering to eliminate bounding box jumping
[04/11] LIP EXTRACTION         -> Anthropometric mouth extraction, grayscale conversion, and 96x96 pixel normalization
[05/11] AUDIO FEATURES         -> 80-band Log-Mel spectrogram computation (N_FFT=512, Win=400, Hop=160; 4 mel frames per video frame)
[06/11] TEMPORAL WINDOWING     -> 0.8-second sliding temporal windows (20 video frames + 80 audio mel frames, 0.2s stride)
[07/11] AV SYNCHRONIZATION     -> Dual-stream InfoNCE-trained SyncNet measuring cross-modal cosine alignment
[08/11] TEMPORAL ANALYSIS      -> Viseme-phoneme cross-correlation, oral aperture area dynamics, and ±80ms coarticulation tolerance
[09/11] MULTIMODAL FUSION      -> Extraction of 24 statistical, kinematic, and temporal metrics into a dense feature vector
[10/11] NEURAL CLASSIFICATION  -> Calibrated MLP classifier evaluating P(Real) vs P(Manipulated) with decision threshold = 0.50
[11/11] EVIDENCE GENERATION    -> Keyframe exhibit extraction, timestamped anomaly intervals, and full forensic explanation
```

### Mathematical & Engineering Highlights

- **Face Anchor & Trajectory Stabilization**: Replaces naive per-frame detection with `establish_dominant_face_anchor()`. A reference anchor is derived from the initial high-confidence faces, bounding boxes jumping to shirt wrinkles or background artifacts ($>30\%$ frame radius) are filtered, and valid boxes are smoothed using Exponential Moving Average (EMA, $\alpha = 0.75$) with bidirectional temporal window smoothing ($w=7$).
- **Acoustic-Visual Temporal Coupling**: Hop size is calibrated to exactly $10\text{ms}$ ($160\text{ samples at }16\text{kHz}$) against $25\text{ FPS video}$ ($40\text{ms/frame}$), guaranteeing a deterministic $4:1$ ratio between audio Mel frames and video frames.
- **InfoNCE Symmetrical Contrastive SyncNet**: SyncNet is trained on true human speech video embeddings with symmetrical InfoNCE loss:
  $$\mathcal{L} = -\log \frac{\exp(\text{sim}(v_i, a_i) / \tau)}{\sum_j \exp(\text{sim}(v_i, a_j) / \tau)}$$
  Ensures real speech audio-visual pairs achieve cosine similarity $> 0.75$, while temporal desynchronizations ($>150\text{ms}$) collapse to $\approx 0.0$.
- **Oral Aperture & Coarticulation Tolerance**: Frame-differencing fails on sustained vowels ($/a/, /o/, /u/$) where lips remain static but acoustic energy is intense. ARGOS calculates central oral aperture darkness and area dynamics, coupled with a physiological coarticulation window ($\tau \in [-2, +2]$ frames = $\pm 80\text{ms}$) and Voice Activity Detection (VAD) gating.

---

## 📊 Benchmark & Evaluation Results

Tested on real-world golden benchmark media comprising authentic speaking videos and manipulated samples (audio shifts of $+400\text{ms}$, $+600\text{ms}$, $-400\text{ms}$, and audio track replacement):

| Metric | Benchmark Score | Description |
| :--- | :---: | :--- |
| **Accuracy** | **83.3%** | Overall correct classification across all test cohorts |
| **Recall (Manipulated)** | **100.0%** | Zero false negatives: all desynchronized / manipulated media detected |
| **Precision** | **75.0%** | Minimal false alarm rate |
| **F1 Score** | **85.7%** | Harmonic balance between forensic precision and recall |
| **ROC-AUC** | **0.78** | Area under the Receiver Operating Characteristic curve |

### Evaluation Visualizations
The automated evaluation pipeline (`scripts/evaluate_dataset.py`) generates high-resolution figures in `reports/`:
- **Confusion Matrix**: `reports/confusion_matrix.png`
- **ROC Curve**: `reports/roc_curve.png`
- **Precision-Recall Curve**: `reports/pr_curve.png`
- **Comprehensive Benchmark JSON**: `reports/ml_evaluation.json`

---

## 🛠️ Complete Tech Stack

| Domain | Technology / Library | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Reactive forensic dashboard, real-time timeline, interactive 3D globe |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Framer Motion | Cyber-forensic dark interface, micro-interactions, responsive charts |
| **API Framework** | FastAPI (ASGI), Uvicorn, Pydantic v2 | High-performance asynchronous REST API and WebSocket telemetry |
| **Deep Learning** | PyTorch 2.2+, TorchAudio, TorchVision | SyncNet 3D/2D CNN encoders, Multimodal MLP Classifier |
| **Vision & Audio** | OpenCV, Librosa, SciPy, ImageIO-FFmpeg | Video decoding, landmark extraction, Mel-spectrograms, signal filtering |
| **Database & Cache**| PostgreSQL, SQLAlchemy 2.0, Alembic, Redis | Persistent storage of users, assets, jobs, and forensic timelines |
| **Task Queue** | Celery 5.3+ | Asynchronous batch media processing and long-running evaluations |
| **Security & Auth** | Argon2 / bcrypt, PyJWT, Cryptography | Enterprise authentication, token rotation, and credential protection |
| **Provenance** | C2PA Content Credentials, pHash/dHash/aHash | Media DNA generation, tamper verification, and DCT/DWT watermarking |

---

## 📂 Repository Structure

```
argos-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/              # Modular API routes (auth, test_lab, protection, etc.)
│   │   │   │   ├── health.py        # /api/health/ml operational status & weights inspection
│   │   │   │   ├── test_lab.py      # Test Lab endpoints with async job queue & polling
│   │   │   │   └── ...
│   │   │   └── v1/
│   │   │       ├── analyze.py       # Live detection endpoint (/api/v1/analyze)
│   │   │       └── ...
│   │   ├── core/                    # App configuration, security, exceptions, and logging
│   │   ├── db/                      # Database models, SQLAlchemy sessions, and migrations
│   │   ├── services/                # Business services (AnalysisService with atomic JSON persistence)
│   │   └── main.py                  # Master FastAPI application factory & middleware
│   ├── ml/
│   │   ├── config.py                # Centralized hyperparameters, thresholds & label mappings
│   │   ├── exceptions.py            # Structured 11-stage exception hierarchy (zero hidden errors)
│   │   ├── pipeline.py              # ArgosDeepfakePipeline: unified master 11-stage engine
│   │   ├── evaluation/              # VideoEvaluator & statistical benchmarking metrics
│   │   ├── models/
│   │   │   ├── syncnet.py           # Dual-Stream SyncNet 3D/2D CNN with InfoNCE embeddings
│   │   │   └── classifier.py        # MultimodalDeepfakeClassifier MLP & Softmax calibrator
│   │   ├── preprocessing/           # VideoProcessor (FFmpeg) & Mel-spectrogram extraction
│   │   ├── temporal/                # TemporalAnalyzer: aperture kinematics & coarticulation
│   │   └── vision/                  # LipExtractor: face anchor stabilization & 96x96 ROI crops
│   ├── models/                      # Trained model checkpoints (syncnet.pth, classifier.pth)
│   ├── tests/                       # Pytest automated test suites
│   │   └── test_ml_deepfake_engine.py # Comprehensive unit & regression tests (9 passing)
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── app/
│   │   ├── (auth)/                  # Login, signup, password-reset flows
│   │   ├── dashboard/               # Real-time monitoring & threat intelligence
│   │   ├── detections/              # Live video deepfake detection & visual heatmaps
│   │   ├── test-lab/                # ML Test Lab: upload media, stage telemetry & exhibits
│   │   ├── protect/                 # Pro workflow: Media DNA, C2PA, Invisible Watermarking
│   │   ├── verify/                  # Asset authenticity verification & tamper detection
│   │   ├── monitor/                 # Active web/social leak scraper & hash monitoring
│   │   ├── incidents/               # Takedown notices & digital evidence dossiers
│   │   └── layout.tsx & page.tsx    # Root layout & landing portal
│   ├── package.json                 # Next.js & React dependencies
│   └── tsconfig.json                # TypeScript configuration
├── scripts/
│   ├── test_video.py                # Standalone single-video forensic CLI with formatted output
│   ├── evaluate_dataset.py          # Batch dataset evaluation CLI (CSV, JSON, PNG plots)
│   ├── train_syncnet_real.py        # InfoNCE contrastive training script for real video pairs
│   ├── train_baseline.py            # Multimodal MLP classifier training script
│   └── grant_pro.py                 # Administrator utility to manage user subscriptions
├── reports/                         # Generated benchmark artifacts (JSON & PNG plots)
└── README.md                        # Project documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.10, 3.11, 3.12, 3.14)
- **Node.js 18+** & **npm**
- **FFmpeg** installed and accessible in system `PATH` (or auto-discovered via `imageio-ffmpeg`)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/daystar-1nine/argos-ai.git
cd argos-ai/backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 3. Frontend Setup
```bash
# Open a new terminal in the repository root
cd frontend

# Install dependencies
npm install

# Start Next.js development server on port 3000
npm run dev
```
*Web Application is accessible at: [http://localhost:3000](http://localhost:3000)*

---

## 💻 Forensic CLI Tools

ARGOS AI includes standalone CLI utilities for forensic testing and batch benchmarking without needing a browser.

### Single Video Forensic Inspection
```bash
python scripts/test_video.py --video path/to/sample.mp4 --debug
```
**Example CLI Output:**
```
------------------------------------------------------------
ARGOS AI FORENSIC TEST - MULTIMODAL DETECTION ENGINE
------------------------------------------------------------
Target Video: sample.mp4
  [01/11] 01 VIDEO VALIDATION: Inspecting video integrity & format
  [02/11] 02 AUDIO EXTRACTION: Extracting 16kHz PCM audio stream
  [03/11] 03 FACE DETECTION: Tracking facial landmarks across frames
  [04/11] 04 LIP EXTRACTION: Normalizing 96x96 lip ROI sequences
  [05/11] 05 AUDIO FEATURES: Extracting 80-band Mel-spectrogram & envelope
  [06/11] 06 TEMPORAL WINDOWING: Constructing 0.8s synchronized sliding windows
  [07/11] 07 AUDIO-VISUAL SYNCHRONIZATION: SyncNet viseme-phoneme cross-correlation
  [08/11] 08 TEMPORAL ANALYSIS: Measuring temporal lag & drift anomalies
  [09/11] 09 MULTIMODAL FUSION: Fusing acoustic, visual & kinematic features
  [10/11] 10 REAL/FAKE CLASSIFICATION: Running PyTorch Multimodal Classifier
  [11/11] 11 EVIDENCE GENERATION: Extracting anomalous keyframe exhibits

============================================================
ARGOS AI — ML TEST
============================================================
Video:          sample.mp4
Duration:       10.40s
Resolution:     1920x1080
FPS:            25.00
Audio:          AVAILABLE
Faces detected: 1

MODEL:
Version:        1.2.0
Checkpoint:     backend/models/classifier.pth

RESULT:
Prediction:       REAL
Real probability: 87.20%
Fake probability: 12.80%

AUDIO-VISUAL:
Sync score:        0.791
Average AV offset: +12ms

TEMPORAL:
Windows analyzed:   47
Suspicious windows: 0

EVIDENCE:
  - Exhibit: Frame 10 @ 00:00.40 -> results/evidence/sample/frame_0010.jpg

STATUS:
SUCCESS
============================================================
```

### Batch Dataset Benchmarking
```bash
python scripts/evaluate_dataset.py --real data/golden/real --fake data/golden/fake --output-dir results/
```
Outputs:
- Detailed per-video results to `results/evaluation_results.csv`
- Global metrics to `reports/ml_evaluation.json`
- Plots: `confusion_matrix.png`, `roc_curve.png`, `pr_curve.png`

---

## 🧪 Automated Testing

Execute the comprehensive test suite verifying configurations, exception hierarchies, 96x96 lip extraction, SyncNet dual-stream forward passes, and calibrated classifier probabilities:

```bash
pytest backend/tests/test_ml_deepfake_engine.py -v
```

Output:
```
backend/tests/test_ml_deepfake_engine.py::TestForensicEngineConfig::test_label_consistency PASSED
backend/tests/test_ml_deepfake_engine.py::TestForensicEngineConfig::test_window_parameters PASSED
backend/tests/test_ml_deepfake_engine.py::TestExceptionHierarchy::test_pipeline_exceptions PASSED
backend/tests/test_ml_deepfake_engine.py::TestVisionLipExtractor::test_lip_crop_shape_and_range PASSED
backend/tests/test_ml_deepfake_engine.py::TestVisionLipExtractor::test_process_frames_trajectory PASSED
backend/tests/test_ml_deepfake_engine.py::TestSyncNetModel::test_syncnet_forward_pass PASSED
backend/tests/test_ml_deepfake_engine.py::TestSyncNetModel::test_syncnet_score_calibration PASSED
backend/tests/test_ml_deepfake_engine.py::TestMultimodalClassifier::test_classifier_output_dimensions_and_sum PASSED
backend/tests/test_ml_deepfake_engine.py::TestMultimodalClassifier::test_weights_file_existence PASSED

============================== 9 passed in 1.49s ==============================
```

---

## 🌐 API Route Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health/ml` | Operational status of pipeline, weights, device, and versions | Public |
| `POST` | `/api/v1/analyze` | Live video deepfake detection & forensic timeline (multipart/form-data) | Free / All Users |
| `POST` | `/api/test-lab/analyze` | Asynchronous test lab analysis with job creation | Free / All Users |
| `GET` | `/api/test-lab/jobs/{job_id}` | Polling job status, telemetry, stage breakdown & metrics | Free / All Users |
| `POST` | `/api/auth/signup` | User registration (default: Free tier) | Public |
| `POST` | `/api/auth/login` | Secure JWT authentication & session token | Public |
| `POST` | `/api/protection/register` | Media DNA, C2PA signing & invisible watermarking | Pro (₹199/mo) |
| `POST` | `/api/verification/verify` | Perceptual hash verification, tamper detection & watermark extraction | Pro |
| `GET` | `/api/monitoring/leaks` | Real-time derivative media scraping & infringement radar | Pro |
| `POST` | `/api/reports/generate` | Cryptographic PDF forensic audit dossier generation | Pro |

---

## 🔒 Security, Ethics & Responsible AI

1. **Privacy-Preserving**: Media analyzed through ARGOS AI is processed in isolated scratch buffers; original user video data is not retained unless explicitly registered for Pro protection monitoring.
2. **Defensive Provenance**: Watermarking utilizes dual-domain Discrete Cosine Transform (DCT) and Discrete Wavelet Transform (DWT) embedding, making fingerprints resistant to aggressive recompression, cropping, downscaling, and social media transcoding.
3. **Transparent Explainability**: Every verdict is substantiated with window-by-window temporal sync scores, phoneme-viseme drift metrics, and photographic keyframe exhibits to assist human forensic examiners and legal compliance officers.

---

## 📄 License & Attribution

Developed with ❤️ by the **ARGOS AI Team** for the Hackathon.  
Distributed under the **MIT License**. See `LICENSE` for details.
