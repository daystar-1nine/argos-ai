# ARGOS AI — Production Backend Engine
### *Protect. Detect. Verify. Respond.*

Enterprise-grade REST API, PostgreSQL database, Celery background worker system, and genuine multimodal deepfake forensics pipeline implementing **Problem Statement 4: "Audio-Visual Temporal Lip-Sync & Deepfake Detection"**.

---

## Architecture Overview

```
                      ARGOS FRONTEND (Next.js 16)
                                   │
                                   ▼
                        FastAPI Web Server (:8000)
                                   │
                 ┌─────────────────┼─────────────────┐
                 ▼                 ▼                 ▼
          PostgreSQL 16         Redis 7       Storage Abstraction
     (SQLAlchemy 2 + Alembic)  (Job Broker)   (Uploads, Evidence, Reports)
                 │                 │
                 │                 ▼
                 │        Celery ML Worker Pool
                 │                 │
                 │                 ▼
                 │     Multimodal PyTorch Pipeline
                 │     ├── 25 FPS Video Preprocessing
                 │     ├── 96x96 Normalized Lip ROIs
                 │     ├── 80-Band Mel-Spectrograms
                 │     ├── 0.8s Synchronized Windows
                 │     ├── SyncNet 3D-CNN Embeddings
                 │     ├── Cross-Modal Cosine Alignment
                 │     └── Multimodal Temporal Classifier
                 │                 │
                 └────────► Forensic Result ◄────────┘
```

---

## Quickstart (Local Development)

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate environment
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install all production dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

### 3. Database Migrations

```bash
# Apply migrations to head
alembic upgrade head
```
*(Note: If PostgreSQL is not yet running locally, ARGOS AI automatically initializes a local development SQLite database so you can test immediately with zero friction).*

### 4. Start the Services

#### Option A: FastAPI Application Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc Documentation: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

#### Option B: Celery Worker (Requires Redis)
```bash
celery -A app.workers.celery_app worker --loglevel=info --concurrency=2
```
*(Note: When Redis is offline, the API dispatcher automatically executes analysis tasks in isolated background worker threads).*

---

## Docker Deployment

Run the complete multi-service stack (FastAPI + Celery + PostgreSQL 16 + Redis 7):

```bash
# Build and run all services
docker compose up --build -d

# View real-time logs
docker compose logs -f

# Shut down
docker compose down
```

---

## REST API Reference

| Method | Path | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health and mode | Public |
| `GET` | `/api/health/ready` | DB and ML worker readiness check | Public |
| `GET` | `/api/health/models` | PyTorch model weights and hardware status | Public |
| `POST` | `/api/auth/register` | Register operator account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Authenticated operator profile | Bearer JWT |
| `POST` | `/api/media/upload` | Upload video with FFprobe inspection | Bearer JWT |
| `GET` | `/api/media/{asset_id}` | Retrieve asset metadata & Media DNA | Bearer JWT |
| `GET` | `/api/media/{asset_id}/file` | Stream verified video safely | Bearer JWT |
| `DELETE` | `/api/media/{asset_id}` | Purge media asset and disk files | Bearer JWT |
| `POST` | `/api/analyses` | Queue asynchronous deepfake analysis | Bearer JWT |
| `GET` | `/api/analyses/{id}` | Live stage progress & status | Public |
| `GET` | `/api/analyses/{id}/result` | Comprehensive forensic findings | Public |
| `GET` | `/api/analyses/{id}/windows` | Evaluated temporal anomaly windows | Public |
| `GET` | `/api/analyses/{id}/evidence`| Forensic keyframe metadata | Public |
| `GET` | `/api/analyses/{id}/evidence/{fn}` | Serve forensic keyframe JPEG | Public |
| `WS` | `/api/analyses/ws/{id}` | WebSocket live progress streaming | Public |
| `POST` | `/api/reports/{analysis_id}` | Generate sealed PDF forensic report | Bearer JWT |
| `GET` | `/api/reports/{id}` | Retrieve report metadata & SHA-256 seal | Public |
| `GET` | `/api/reports/{id}/download` | Download binary PDF forensic dossier | Public |
| `GET` | `/api/detections` | Filterable detected derivatives feed | Public |
| `POST` | `/api/verify` | Public zero-login provenance lookup | Public |
| `GET` | `/api/monitoring/regions` | Regional telemetry sensor hubs | Public |
| `GET` | `/api/monitoring/events` | Stream of discovered derivative events | Public |

---

## Running Automated Tests

```bash
# Run API endpoint tests
python backend/tests/test_api_endpoints.py

# Run complete End-to-End Forensic Lifecycle test
python backend/tests/test_e2e_forensic_lifecycle.py

# Run ML multimodal pipeline unit test
python backend/tests/test_ml_pipeline.py
```
