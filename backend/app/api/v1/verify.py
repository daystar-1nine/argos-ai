from datetime import datetime
from fastapi import APIRouter
from app.models.schemas import VerificationRequest
from app.core.mock_data import DEMO_ASSET_ID, SAMPLE_ASSETS, SAMPLE_PROVENANCE

router = APIRouter(prefix="/verify", tags=["Public Verification"])

@router.get("/asset/{asset_id}")
def verify_asset_by_id(asset_id: str, test_mode: str = "derivative"):
    """
    Public verification endpoint: checks provenance, tamper status, and watermark.
    test_mode can be 'derivative' (tampered copy) or 'original' (clean original).
    """
    found = (asset_id.upper() == DEMO_ASSET_ID) or any(a["id"] == asset_id for a in SAMPLE_ASSETS)
    
    if not found:
        return {
            "query": asset_id,
            "is_found": False,
            "provenance_verified": False,
            "integrity_valid": False,
            "watermark_detected": False,
            "post_protection_modified": False,
            "ai_manipulation_probability": 0.0,
            "conclusion": "ASSET NOT REGISTERED IN ARGOS SOVEREIGN PROVENANCE LEDGER",
            "queried_at": datetime.utcnow()
        }

    if test_mode == "original":
        return {
            "query": asset_id,
            "is_found": True,
            "provenance_verified": True,
            "integrity_valid": True,
            "watermark_detected": True,
            "post_protection_modified": False,
            "ai_manipulation_probability": 1.2,
            "conclusion": "VERIFIED: AUTHENTIC REGISTERED ORIGINAL MASTER",
            "asset_title": "CEO Keynote Speech & Product Release 2026",
            "c2pa_manifest": SAMPLE_PROVENANCE[DEMO_ASSET_ID]["c2pa_manifest_id"],
            "signing_authority": "ARGOS Sovereign Provenance CA 2026",
            "queried_at": datetime.utcnow()
        }

    # Default: derivative / suspect file tested against registered asset
    return {
        "query": asset_id,
        "is_found": True,
        "provenance_verified": True,
        "integrity_valid": False,
        "watermark_detected": True,
        "post_protection_modified": True,
        "ai_manipulation_probability": 93.0,
        "conclusion": "THIS FILE IS NOT THE ORIGINAL PROTECTED VERSION. SYNTHETIC MANIPULATION DETECTED.",
        "asset_title": "CEO Keynote Speech & Product Release 2026",
        "c2pa_manifest": SAMPLE_PROVENANCE[DEMO_ASSET_ID]["c2pa_manifest_id"],
        "signing_authority": "ARGOS Sovereign Provenance CA 2026",
        "modifications_detected": [
            "Viseme alignment shifted by +320ms between 00:14 and 00:18",
            "Synthetic vocoder audio frequencies detected",
            "Facial boundary micro-warping detected"
        ],
        "queried_at": datetime.utcnow()
    }
