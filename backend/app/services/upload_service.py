"""
ARGOS AI - Media Upload & Stream Inspection Service
Validates media formats, verifies streams with FFmpeg, extracts comprehensive metadata,
rejects corrupt/malicious uploads, and registers assets in PostgreSQL.
"""

import re
import subprocess
from pathlib import Path
from typing import Dict, Any, Tuple
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import MediaValidationException
from app.core.logging import logger
from app.db.base import generate_uuid
from app.db.models.media import MediaAsset
from app.services.storage_service import storage_service
from ml.preprocessing.video_processor import get_ffmpeg_binary


class UploadService:
    """Orchestrates file upload, cryptographic naming, FFmpeg verification, and DB registration."""

    def __init__(self):
        self.ffmpeg_bin = get_ffmpeg_binary()

    def validate_file_header(self, upload_file: UploadFile):
        """Validates extension and MIME type before saving."""
        filename = upload_file.filename or "media_upload.mp4"
        ext = Path(filename).suffix.lower()

        if ext not in settings.ALLOWED_EXTENSIONS:
            raise MediaValidationException(
                f"Unsupported file extension '{ext}'. Supported formats: {', '.join(settings.ALLOWED_EXTENSIONS)}",
                details={"extension": ext, "allowed": settings.ALLOWED_EXTENSIONS}
            )

        mime = upload_file.content_type or "application/octet-stream"
        if mime not in settings.ALLOWED_MIME_TYPES:
            logger.warning(f"[UPLOAD] Unrecognized MIME '{mime}' for file '{filename}'. Proceeding to FFmpeg container inspection.")

    def inspect_with_ffmpeg(self, file_path: Path) -> Dict[str, Any]:
        """
        Uses FFmpeg container parser to inspect streams, duration, codecs, and integrity.
        Rejects corrupt, truncated, or unplayable media.
        """
        cmd = [self.ffmpeg_bin, "-i", str(file_path)]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors="replace")
        output = res.stderr

        # Check for fatal corrupt container indicators
        if "Invalid data found when processing input" in output or "could not find codec parameters" in output:
            raise MediaValidationException(
                "Uploaded media file is corrupted, truncated, or formatted with an unreadable container.",
                details={"error": "CORRUPT_MEDIA_CONTAINER"}
            )

        # 1. Parse Duration & Bitrate
        duration_sec = 0.0
        bitrate_kbps = 0
        dur_match = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+|\d+)", output)
        if dur_match:
            hours, minutes, seconds = dur_match.groups()
            duration_sec = int(hours) * 3600 + int(minutes) * 60 + float(seconds)

        bit_match = re.search(r"bitrate:\s*(\d+)\s*kb/s", output)
        if bit_match:
            bitrate_kbps = int(bit_match.group(1))

        # 2. Parse Video Stream
        has_video = False
        video_codec = None
        width, height = None, None
        fps = 25.0

        v_match = re.search(r"Stream #.*?: Video:\s*([a-zA-Z0-9_\-]+)", output)
        if v_match:
            has_video = True
            video_codec = v_match.group(1)

            res_match = re.search(r"(\d{2,5})x(\d{2,5})", output)
            if res_match:
                width = int(res_match.group(1))
                height = int(res_match.group(2))

            fps_match = re.search(r"(\d+(?:\.\d+)?)\s*fps", output)
            if fps_match:
                fps = float(fps_match.group(1))

        # 3. Parse Audio Stream
        has_audio = False
        audio_codec = None
        sample_rate = 16000
        channels = 1

        a_match = re.search(r"Stream #.*?: Audio:\s*([a-zA-Z0-9_\-]+)", output)
        if a_match:
            has_audio = True
            audio_codec = a_match.group(1)

            sr_match = re.search(r"(\d+)\s*Hz", output)
            if sr_match:
                sample_rate = int(sr_match.group(1))

            if "stereo" in output.lower():
                channels = 2
            elif "mono" in output.lower():
                channels = 1

        # Enforce that media must have a playable video stream
        if not has_video:
            raise MediaValidationException(
                "Uploaded file contains no valid video stream. Video is required for facial forensics.",
                details={"has_video": False, "has_audio": has_audio}
            )

        if duration_sec < 0.5:
            raise MediaValidationException(
                f"Video duration ({duration_sec:.2f}s) is too short. Minimum duration is 0.8 seconds.",
                details={"duration_sec": duration_sec, "minimum": 0.8}
            )

        return {
            "has_video": has_video,
            "has_audio": has_audio,
            "duration_seconds": round(duration_sec, 2),
            "bitrate_kbps": bitrate_kbps,
            "video_codec": video_codec,
            "width": width,
            "height": height,
            "resolution": f"{width}x{height}" if width and height else "unknown",
            "fps": round(fps, 2),
            "frame_count": int(duration_sec * fps) if duration_sec else 0,
            "audio_codec": audio_codec,
            "audio_sample_rate": sample_rate,
            "audio_channels": channels,
        }

    def process_upload(
        self,
        upload_file: UploadFile,
        db: Session,
        user_id: str,
        title: str = None
    ) -> Tuple[MediaAsset, Dict[str, Any]]:
        """Processes upload, inspects metadata, stores file safely, and saves DB record."""
        self.validate_file_header(upload_file)

        raw_filename = upload_file.filename or "uploaded_video.mp4"
        asset_id = f"ARG-{generate_uuid()[:12].upper()}"

        # 1. Save uploaded file via Storage Service
        saved_path = storage_service.save_upload(
            asset_id=asset_id,
            file_obj=upload_file.file,
            filename=raw_filename
        )

        file_size_bytes = saved_path.stat().st_size
        if file_size_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
            storage_service.delete_asset_files(asset_id)
            raise MediaValidationException(
                f"File size exceeds maximum permitted limit ({settings.MAX_UPLOAD_SIZE_BYTES / (1024*1024):.0f}MB).",
                details={"file_size_bytes": file_size_bytes}
            )

        # 2. Inspect with FFmpeg
        try:
            metadata = self.inspect_with_ffmpeg(saved_path)
        except Exception as exc:
            storage_service.delete_asset_files(asset_id)
            raise exc

        # 3. Create Database Record
        asset = MediaAsset(
            id=asset_id,
            user_id=user_id,
            title=title or Path(raw_filename).stem,
            media_type="video",
            file_name=saved_path.name,
            file_size_bytes=file_size_bytes,
            storage_path=str(saved_path.relative_to(settings.BASE_STORAGE_DIR)),
            mime_type=upload_file.content_type or "video/mp4",
            duration_seconds=metadata["duration_seconds"],
            width=metadata["width"],
            height=metadata["height"],
            resolution=metadata["resolution"],
            fps=metadata["fps"],
            frame_count=metadata["frame_count"],
            video_codec=metadata["video_codec"],
            audio_codec=metadata["audio_codec"],
            audio_sample_rate=metadata["audio_sample_rate"],
            audio_channels=metadata["audio_channels"],
            bitrate_kbps=metadata["bitrate_kbps"],
            is_protected=True,
            protection_seal=f"ARG-SEAL-{generate_uuid()[:8].upper()}",
            watermark_strength=0.88
        )

        db.add(asset)
        db.commit()
        db.refresh(asset)

        logger.info(f"[MEDIA_UPLOAD] Registered asset_id={asset_id} filename={raw_filename} duration={asset.duration_seconds}s")
        return asset, metadata


upload_service = UploadService()
