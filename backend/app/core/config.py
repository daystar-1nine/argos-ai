"""
ARGOS AI - Core Application Configuration
Defines environment variables, path resolutions, model settings, and security constants.
"""

import os
from pathlib import Path
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
APP_DIR = BACKEND_DIR / "app"
STORAGE_DIR = BACKEND_DIR / "storage"
MODELS_DIR = BACKEND_DIR / "models"


class Settings(BaseSettings):
    PROJECT_NAME: str = "ARGOS AI Forensic & Media Protection Engine"
    API_V1_STR: str = "/api/v1"
    API_STR: str = "/api"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")
    DEMO_MODE: bool = Field(default=True, env="DEMO_MODE")

    # Security & Authentication
    SECRET_KEY: str = Field(
        default="argos-sovereign-dev-secret-key-c2pa-2026-unbreak-crypto",
        env="SECRET_KEY"
    )
    JWT_SECRET: str = Field(
        default="argos-jwt-secret-token-sign-sovereign-matrix-2026",
        env="JWT_SECRET"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for development ease

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/argos_ai",
        env="DATABASE_URL"
    )
    SQLITE_FALLBACK_URL: str = f"sqlite:///{STORAGE_DIR / 'argos_dev.db'}"

    # Redis & Job Queues
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/0",
        env="CELERY_BROKER_URL"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/0",
        env="CELERY_RESULT_BACKEND"
    )

    # Storage Paths
    BASE_STORAGE_DIR: Path = STORAGE_DIR
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    EVIDENCE_DIR: Path = STORAGE_DIR / "evidence"
    REPORTS_DIR: Path = STORAGE_DIR / "reports"
    TEMP_DIR: Path = BACKEND_DIR / "temp"
    MODELS_DIR: Path = MODELS_DIR

    @field_validator("BASE_STORAGE_DIR", "UPLOAD_DIR", "EVIDENCE_DIR", "REPORTS_DIR", "TEMP_DIR", "MODELS_DIR", mode="before")
    @classmethod
    def resolve_path(cls, v: Union[str, Path]) -> Path:
        p = Path(v)
        if not p.is_absolute():
            return (BACKEND_DIR / p).resolve()
        return p.resolve()

    # Media Constraints
    MAX_UPLOAD_SIZE_BYTES: int = 100 * 1024 * 1024  # 100 MB
    ALLOWED_EXTENSIONS: List[str] = [".mp4", ".mov", ".avi", ".webm", ".mkv"]
    ALLOWED_MIME_TYPES: List[str] = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
        "video/x-matroska",
        "application/octet-stream",
    ]

    # ML & Forensic Parameters (Problem Statement 4)
    CUDA_ENABLED: bool = Field(default=True, env="CUDA_ENABLED")
    FFMPEG_PATH: str = Field(default="", env="FFMPEG_PATH")
    SAMPLE_FPS: float = 25.0
    AUDIO_SAMPLE_RATE: int = 16000
    LIP_CROP_SIZE: tuple = (96, 96)
    WINDOW_SIZE_SEC: float = 0.8  # 20 video frames
    WINDOW_STRIDE_SEC: float = 0.2  # 5 video frames
    WINDOW_FRAMES: int = 20
    WINDOW_STRIDE_FRAMES: int = 5
    SYNC_THRESHOLD: float = 0.55
    HIGH_RISK_SYNC_THRESHOLD: float = 0.38
    ANALYSIS_TIMEOUT_SEC: int = 600

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def ensure_directories(self):
        """Creates storage directories if they do not exist."""
        for path in [
            self.BASE_STORAGE_DIR,
            self.UPLOAD_DIR,
            self.EVIDENCE_DIR,
            self.REPORTS_DIR,
            self.TEMP_DIR,
            self.MODELS_DIR,
        ]:
            path.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()
