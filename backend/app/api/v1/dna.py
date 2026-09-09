import hashlib
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import MediaDNA
from app.core.mock_data import SAMPLE_DNA, DEMO_ASSET_ID

router = APIRouter(prefix="/dna", tags=["Media DNA"])

@router.get("/{asset_id}", response_model=MediaDNA)
def get_media_dna(asset_id: str):
    """Retrieve cryptographic Media DNA for a registered asset."""
    if asset_id in SAMPLE_DNA:
        return MediaDNA(**SAMPLE_DNA[asset_id])
    
    # Generate dynamic DNA for any requested asset ID
    short_hash = hashlib.sha256(asset_id.encode()).hexdigest()[:16]
    return MediaDNA(
        id=f"dna_{asset_id.lower()}",
        asset_id=asset_id,
        sha256_hash=hashlib.sha256(asset_id.encode()).hexdigest(),
        phash=short_hash,
        visual_dna_signature=f"VDNA-{short_hash[:4].upper()}-{short_hash[4:8].upper()}-901B-A44F",
        audio_dna_signature=f"ADNA-{short_hash[8:12].upper()}-7761-4190-DE21",
        temporal_dna_signature=f"TDNA-{short_hash[12:16].upper()}-0021-AA90-8812",
        feature_vector_sample=[0.75, -0.32, 0.88, 0.14, -0.55, 0.68, 0.91, -0.12, 0.39, 0.47],
        generated_at=datetime.utcnow(),
        entropy_score=0.954
    )

@router.post("/generate", response_model=MediaDNA)
def generate_media_dna(payload: dict):
    """Generate Media DNA for a newly uploaded asset."""
    asset_id = payload.get("asset_id", f"ARG-2026-{uuid.uuid4().hex[:6].upper()}")
    salt = payload.get("salt", "argos_v1")
    full_hash = hashlib.sha256(f"{asset_id}_{salt}".encode()).hexdigest()
    
    dna = MediaDNA(
        id=f"dna_{uuid.uuid4().hex[:8]}",
        asset_id=asset_id,
        sha256_hash=full_hash,
        phash=full_hash[:16],
        visual_dna_signature=f"VDNA-{full_hash[:4].upper()}-{full_hash[4:8].upper()}-8821-C10A",
        audio_dna_signature=f"ADNA-{full_hash[8:12].upper()}-4401-9921-EB02",
        temporal_dna_signature=f"TDNA-{full_hash[12:16].upper()}-7712-3301-FA11",
        feature_vector_sample=[0.81, -0.39, 0.92, 0.11, -0.61, 0.72, 0.85, -0.17, 0.42, 0.50],
        generated_at=datetime.utcnow(),
        entropy_score=0.961
    )
    return dna
