"""
ARGOS AI - Storage Abstraction Layer
Provides secure, isolated local storage with UUID directory hierarchies,
path traversal sanitization, and interface for future S3 integration.
"""

import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, BinaryIO
from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import ArgosException


class BaseStorageService(ABC):
    """Abstract interface for media, evidence, and report file storage."""

    @abstractmethod
    def save_upload(self, asset_id: str, file_obj: BinaryIO, filename: str) -> Path:
        pass

    @abstractmethod
    def save_evidence_frame(self, analysis_id: str, frame_bytes: bytes, filename: str) -> Path:
        pass

    @abstractmethod
    def save_report(self, analysis_id: str, report_bytes: bytes, filename: str) -> Path:
        pass

    @abstractmethod
    def get_file_path(self, relative_path: str) -> Optional[Path]:
        pass

    @abstractmethod
    def delete_asset_files(self, asset_id: str) -> bool:
        pass


class LocalStorageService(BaseStorageService):
    """Local disk storage implementation structuring files by entity UUIDs."""

    def __init__(self):
        self.upload_root = settings.UPLOAD_DIR
        self.evidence_root = settings.EVIDENCE_DIR
        self.reports_root = settings.REPORTS_DIR
        settings.ensure_directories()

    def _sanitize_filename(self, filename: str) -> str:
        """Removes dangerous path traversal tokens and special characters."""
        clean = Path(filename).name
        # Keep only alphanumeric, dot, underscore, dash
        return "".join(c for c in clean if c.isalnum() or c in "._-").strip() or "media_upload.mp4"

    def save_upload(self, asset_id: str, file_obj: BinaryIO, filename: str) -> Path:
        """Saves an uploaded asset under storage/uploads/<asset_id>/<safe_filename>."""
        safe_name = self._sanitize_filename(filename)
        asset_dir = self.upload_root / asset_id
        asset_dir.mkdir(parents=True, exist_ok=True)
        target_path = asset_dir / safe_name

        with open(target_path, "wb") as dest:
            shutil.copyfileobj(file_obj, dest)

        return target_path

    def save_evidence_frame(self, analysis_id: str, frame_bytes: bytes, filename: str) -> Path:
        """Saves a forensic evidence keyframe under storage/evidence/<analysis_id>/<filename>."""
        safe_name = self._sanitize_filename(filename)
        evidence_dir = self.evidence_root / analysis_id
        evidence_dir.mkdir(parents=True, exist_ok=True)
        target_path = evidence_dir / safe_name

        with open(target_path, "wb") as dest:
            dest.write(frame_bytes)

        return target_path

    def save_report(self, analysis_id: str, report_bytes: bytes, filename: str) -> Path:
        """Saves a generated PDF report under storage/reports/<analysis_id>/<filename>."""
        safe_name = self._sanitize_filename(filename)
        reports_dir = self.reports_root / analysis_id
        reports_dir.mkdir(parents=True, exist_ok=True)
        target_path = reports_dir / safe_name

        with open(target_path, "wb") as dest:
            dest.write(report_bytes)

        return target_path

    def get_file_path(self, relative_path: str) -> Optional[Path]:
        """Resolves and validates a relative path inside storage root."""
        full_path = (settings.BASE_STORAGE_DIR / relative_path).resolve()
        # Enforce boundary check to prevent path traversal
        try:
            full_path.relative_to(settings.BASE_STORAGE_DIR.resolve())
            if full_path.exists() and full_path.is_file():
                return full_path
        except ValueError:
            return None
        return None

    def delete_asset_files(self, asset_id: str) -> bool:
        """Removes the entire asset directory tree."""
        asset_dir = self.upload_root / asset_id
        if asset_dir.exists():
            shutil.rmtree(asset_dir, ignore_errors=True)
            return True
        return False


# Singleton storage instance
storage_service = LocalStorageService()
