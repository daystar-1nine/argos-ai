"""
ARGOS AI - Health & System Status Endpoints
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
import torch

from app.core.config import settings
from app.db.session import get_db, ACTIVE_DB_URL
from ml.config import DEVICE, DEVICE_NAME
from ml.pipeline import PIPELINE_STAGES

router = APIRouter(prefix="/health", tags=["Health & Telemetry"])


@router.get("")
def get_system_health():
    """Returns basic system health and operational mode."""
    return {
        "status": "healthy",
        "service": "ARGOS AI Forensic Core",
        "version": "3.4.0",
        "environment": settings.ENVIRONMENT,
        "demo_mode": settings.DEMO_MODE,
        "device": str(DEVICE),
        "device_name": DEVICE_NAME,
    }


@router.get("/ready")
def get_readiness(db: Session = Depends(get_db)):
    """Verifies database connectivity and worker pipeline readiness."""
    db_ok = False
    try:
        db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ready" if db_ok else "degraded",
        "database": {
            "connected": db_ok,
            "dialect": "postgresql" if "postgres" in (ACTIVE_DB_URL or "") else "sqlite",
        },
        "ml_pipeline": {
            "stages_count": len(PIPELINE_STAGES),
            "device": str(DEVICE),
            "cuda_available": torch.cuda.is_available(),
        }
    }


@router.get("/models")
def get_models_status():
    """
    Returns exact neural model readiness for the multimodal pipeline.
    Never pretends inference is available if weights are missing.
    """
    syncnet_path = settings.MODELS_DIR / "syncnet.pth"
    classifier_path = settings.MODELS_DIR / "classifier.pth"

    return {
        "vision_encoder": "ready" if syncnet_path.exists() else "unavailable",
        "audio_encoder": "ready" if syncnet_path.exists() else "unavailable",
        "sync_model": "ready" if syncnet_path.exists() else "unavailable",
        "classifier": "ready" if classifier_path.exists() else "unavailable",
        "weights": {
            "syncnet_pth": syncnet_path.exists(),
            "classifier_pth": classifier_path.exists(),
        },
        "device": str(DEVICE),
        "torch_version": torch.__version__,
    }
