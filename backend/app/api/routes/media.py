"""
ARGOS AI - Media Asset Management & Upload Endpoints
"""

from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, verify_asset_ownership
from app.core.exceptions import EntityNotFoundException, AuthorizationException
from app.db.session import get_db
from app.db.models.user import User
from app.db.models.media import MediaAsset
from app.schemas.media import MediaUploadResponse, MediaAssetResponse
from app.services.upload_service import upload_service
from app.services.dna_service import dna_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/media", tags=["Media Vault & Ingestion"])


@router.get("", response_model=List[MediaAssetResponse])
def list_user_media_assets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /api/media — Returns all media assets owned by the authenticated user."""
    if current_user.role in ["admin", "analyst"]:
        assets = db.query(MediaAsset).order_by(MediaAsset.created_at.desc()).all()
    else:
        assets = db.query(MediaAsset).filter(MediaAsset.user_id == current_user.id).order_by(MediaAsset.created_at.desc()).all()
    return assets


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)

def upload_media_asset(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /api/media/upload
    Validates file format and streams with FFmpeg, stores file securely,
    calculates Media DNA, and registers the asset.
    """
    asset, metadata = upload_service.process_upload(
        upload_file=file,
        db=db,
        user_id=current_user.id,
        title=title,
    )

    # Automatically generate Media DNA fingerprint
    try:
        dna_service.generate_and_store_dna(asset, db)
    except Exception as e:
        # Non-fatal during initial upload
        pass

    return MediaUploadResponse(
        asset_id=asset.id,
        status="uploaded",
        filename=asset.file_name,
        duration=asset.duration_seconds,
        has_audio=metadata["has_audio"],
        has_video=metadata["has_video"],
        resolution=asset.resolution,
        fps=asset.fps,
        file_size_bytes=asset.file_size_bytes,
    )


@router.get("/{asset_id}", response_model=MediaAssetResponse)
def get_media_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /api/media/{asset_id} — Retrieves media asset metadata and Media DNA."""
    asset = verify_asset_ownership(asset_id, current_user, db)
    return asset


@router.get("/{asset_id}/file")
def stream_media_file(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /api/media/{asset_id}/file — Streams verified media file safely."""
    asset = verify_asset_ownership(asset_id, current_user, db)
    file_path = settings.BASE_STORAGE_DIR / asset.storage_path
    if not file_path.exists():
        raise EntityNotFoundException("MediaFile", str(file_path))

    return FileResponse(
        str(file_path),
        media_type=asset.mime_type or "video/mp4",
        filename=asset.file_name
    )


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media_asset(
    asset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """DELETE /api/media/{asset_id} — Securely purges media asset and associated storage."""
    asset = verify_asset_ownership(asset_id, current_user, db)
    storage_service.delete_asset_files(asset.id)
    db.delete(asset)
    db.commit()
    return None
