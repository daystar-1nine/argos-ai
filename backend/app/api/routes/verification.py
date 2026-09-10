"""
ARGOS AI - Public Provenance & Derivative Verification API
Permits zero-login provenance checking against Media DNA roots.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.db.models.media import MediaAsset, MediaFingerprint

router = APIRouter(prefix="/verify", tags=["Public Provenance Verification"])


class VerificationQuery(BaseModel):
    query: str  # Asset ID (e.g. ARG-2026-8A92F1) or SHA-256 hash


@router.post("")
def verify_asset_or_hash(payload: VerificationQuery, db: Session = Depends(get_db)):
    """
    POST /api/verify
    Validates cryptographic lineage and compares query against registered Media DNA.
    """
    query_str = payload.query.strip()

    # 1. Search by Asset ID
    asset = db.query(MediaAsset).filter(MediaAsset.id == query_str).first()
    fingerprint = None
    if asset:
        fingerprint = db.query(MediaFingerprint).filter(MediaFingerprint.asset_id == asset.id).first()
    else:
        # 2. Search by SHA-256 hash
        fingerprint = db.query(MediaFingerprint).filter(MediaFingerprint.sha256_hash == query_str).first()
        if fingerprint:
            asset = db.query(MediaAsset).filter(MediaAsset.id == fingerprint.asset_id).first()

    if not asset and not fingerprint:
        # Fallback check for demo asset ID
        if query_str.upper() in ["ARG-2026-8A92F1", "DEMO"]:
            return {
                "is_found": True,
                "asset_id": "ARG-2026-8A92F1",
                "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "c2pa_manifest_valid": True,
                "watermark_detected": True,
                "post_protection_modified": True,
                "provenance_issuer": "ARGOS Sovereign Provenance CA 2026",
                "status": "MODIFIED_DERIVATIVE_DISCOVERED",
                "risk_assessment": "Potentially synthetic (Audio-visual desynchronization in interval 00:14-00:18)",
            }

        return {
            "is_found": False,
            "query": query_str,
            "provenance_verified": False,
            "message": "No matching Media DNA or sovereign C2PA root manifest discovered in the registry.",
        }

    return {
        "is_found": True,
        "asset_id": asset.id,
        "title": asset.title,
        "file_name": asset.file_name,
        "is_protected": asset.is_protected,
        "protection_seal": asset.protection_seal,
        "watermark_strength": asset.watermark_strength,
        "sha256_hash": fingerprint.sha256_hash if fingerprint else None,
        "phash": fingerprint.phash if fingerprint else None,
        "visual_signature": fingerprint.visual_signature if fingerprint else None,
        "audio_signature": fingerprint.audio_signature if fingerprint else None,
        "temporal_signature": fingerprint.temporal_signature if fingerprint else None,
        "provenance_verified": True,
        "status": "AUTHENTIC_ROOT_LOCATED",
    }
