"""
ARGOS AI - Complete Media Protection & Deepfake Forensics Lifecycle Engine
Main FastAPI Application Entrypoint
"""

from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import (
    ArgosException,
    argos_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.db.session import init_db
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: verifies directories and initializes DB schema."""
    logger.info("[STARTUP] Initializing ARGOS AI Forensics Core...")
    settings.ensure_directories()
    try:
        init_db()
    except Exception as e:
        logger.warning(f"[STARTUP] Database auto-init note: {e}")
    yield
    logger.info("[SHUTDOWN] Terminating ARGOS AI services cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "ARGOS AI: Complete Media Protection & Deepfake Forensics Lifecycle Engine. "
        "Audio-Visual Temporal Lip-Sync & Deepfake Detection (Problem Statement 4). "
        "PROTECT → PROVE → MONITOR → DETECT → EXPLAIN → ALERT → RESPOND → VERIFY."
    ),
    version="3.4.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Exception Handlers
app.add_exception_handler(ArgosException, argos_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# CORS Middleware for Next.js and external client access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers under /api and /api/v1
app.include_router(api_router, prefix=settings.API_STR)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Static & Evidence Directories
settings.ensure_directories()
app.mount("/storage", StaticFiles(directory=str(settings.BASE_STORAGE_DIR)), name="storage")

legacy_static_dir = Path(__file__).resolve().parent.parent / "static"
legacy_static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(legacy_static_dir)), name="static")


@app.get("/")
def root():
    return {
        "brand": "ARGOS AI",
        "tagline": "Protect. Detect. Verify. Respond.",
        "status": "online",
        "service": "Forensics & Provenance Engine",
        "docs": "/docs",
        "api": settings.API_STR,
        "api_v1": settings.API_V1_STR,
    }
