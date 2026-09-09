from datetime import datetime
from fastapi import APIRouter, HTTPException
from app.models.schemas import Incident
from app.core.mock_data import SAMPLE_INCIDENT, SAMPLE_DNA, DEMO_ASSET_ID

router = APIRouter(prefix="/takedown", tags=["Incident Response"])

@router.get("/case/{incident_id}")
def get_incident_case(incident_id: str):
    """
    Retrieve full dossier for an incident case (e.g. ARG-8291).
    """
    if incident_id != SAMPLE_INCIDENT["id"]:
        # Return customized instance
        data = dict(SAMPLE_INCIDENT)
        data["id"] = incident_id
        return data
    
    return {
        **SAMPLE_INCIDENT,
        "original_asset_status": "Verified authentic",
        "provenance_status": "Valid (C2PA signed)",
        "media_dna_status": "Matched (SHA-256 + Perceptual DNA)",
        "manipulation_verdict": "Detected (93.0% risk)",
        "evidence_summary": {
            "frames_count": 12,
            "audio_waveform_count": 1,
            "analysis_graphs_count": 3,
            "hash_chain": "sha256:e3b0c442...996fb924"
        },
        "disclaimer": "Argos assists users with evidence and reporting workflows. We do not claim guaranteed automatic deletion from every platform."
    }

@router.post("/generate-notice/{incident_id}")
def generate_platform_notice(incident_id: str, payload: dict = None):
    """
    Generates a structured DMCA 512(c) or EU DSA Article 16 Forensic Notice
    formatted for platform trust & safety / copyright agents.
    """
    platform = (payload or {}).get("platform", "Target Platform Host")
    claimant = (payload or {}).get("claimant", "Authorized Rights Holder / Creator")
    
    notice_text = f"""================================================================================
FORMAL FORENSIC NOTICE OF UNAUTHORIZED DERIVATIVE & SYNTHETIC MANIPULATION
Reference Case: #{incident_id} | Argos Provenance Seal: SEAL-SHA256:7f83b165
================================================================================

To the Designated Agent / Trust & Safety Division of {platform}:

This notice provides cryptographically verifiable evidence under 17 U.S.C. § 512(c) 
and EU Digital Services Act (DSA) Article 16 regarding the unauthorized distribution 
and synthetic deepfake manipulation of protected copyrighted media.

1. IDENTIFICATION OF ORIGINAL PROTECTED ASSET:
   - Asset ID: {DEMO_ASSET_ID}
   - Provenance Standard: C2PA v2.1 Claim URN: urn:c2pa:8a92f1-4402-99ab-2026
   - Media DNA Root Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
   - Rights Holder: {claimant}

2. IDENTIFICATION OF INFRINGING / MANIPULATED DERIVATIVE:
   - Suspect Location: {SAMPLE_INCIDENT['suspect_url']}
   - Forensic Anomaly Score: 93.0% (Multi-Model Consensus: 4/4)
   - Specific Manipulation: Temporal mouth-warp (+320ms phoneme lag) and AI voice synthesis.

3. FORENSIC EVIDENCE DOSSIER:
   - 12 high-resolution timestamped frame delta exhibits attached.
   - Spectral vocoder audio anomaly graph attached.
   - Cryptographic proof of origin and spread-spectrum watermark match attached.

4. GOOD FAITH STATEMENT:
   The undersigned has a good-faith belief that the use of the material in the manner 
   complained of is not authorized by the copyright owner, its agent, or the law.

Submitted via ARGOS AI Incident Response System.
Verification Portal: https://argos-ai.defense/verify?id={DEMO_ASSET_ID}
"""
    return {
        "incident_id": incident_id,
        "platform": platform,
        "generated_at": datetime.utcnow(),
        "notice_text": notice_text,
        "evidence_pack_items": [
            "forensic_dossier_rep_8291.pdf",
            "c2pa_manifest_claim.json",
            "frame_comparison_annex_12x.zip",
            "spectral_waveform_spectrogram.png"
        ]
    }
