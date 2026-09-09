from fastapi import APIRouter, HTTPException
from app.models.schemas import ForensicAnalysis
from app.core.mock_data import SAMPLE_FORENSIC_ANALYSIS, DEMO_ASSET_ID

router = APIRouter(prefix="/forensics", tags=["Forensics"])

@router.get("/{asset_id}", response_model=ForensicAnalysis)
def get_forensic_analysis(asset_id: str):
    """
    Returns deep multi-model forensic analysis for an asset,
    including timeline segments, SyncNet audio-visual discrepancy,
    lip-sync anomaly scores, and model agreement.
    """
    if asset_id in SAMPLE_FORENSIC_ANALYSIS:
        return ForensicAnalysis(**SAMPLE_FORENSIC_ANALYSIS[asset_id])
    
    # Return primary analysis mapped to the requested asset
    data = dict(SAMPLE_FORENSIC_ANALYSIS[DEMO_ASSET_ID])
    data["id"] = f"forensic_{asset_id.lower()}"
    data["asset_id"] = asset_id
    return ForensicAnalysis(**data)

@router.get("/timeline/{asset_id}")
def get_timeline_data(asset_id: str):
    """
    Timeline scrubbing data with frame-by-frame risk indicators and audio-lip delta.
    """
    return {
        "asset_id": asset_id,
        "duration_seconds": 32.4,
        "fps": 60,
        "segments": SAMPLE_FORENSIC_ANALYSIS.get(asset_id, SAMPLE_FORENSIC_ANALYSIS[DEMO_ASSET_ID])["timeline_segments"],
        "telemetry": {
            "sync_percentage": 41,
            "manipulation_risk_percentage": 93,
            "temporal_mismatch_ms": "+320ms",
            "phoneme_viseme_delta": "0.482 rad",
            "spectral_variance_zscore": 3.84
        }
    }
