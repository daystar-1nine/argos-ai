"""
ARGOS AI - Detections & Derivatives API Endpoints
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.exceptions import EntityNotFoundException
from app.db.models.detection import Detection
from app.schemas.detection import DetectionResponse

router = APIRouter(prefix="/detections", tags=["Forensic Detections Feed"])


@router.get("", response_model=List[DetectionResponse])
def list_detections(
    risk_level: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """GET /api/detections — Lists detected synthetic derivatives and matches."""
    query = db.query(Detection)
    if risk_level:
        query = query.filter(Detection.risk_level == risk_level)
    if region:
        query = query.filter(Detection.region == region)

    results = query.order_by(Detection.detected_at.desc()).all()

    # If database is fresh, populate realistic seeded records
    if not results:
        sample_detections = [
            Detection(
                id="match_01",
                asset_id="ARG-2026-8A92F1",
                source_name="X (Public Relay)",
                source_url="https://x.com/status/9821731",
                region="USA",
                risk_level="CRITICAL",
                match_type="Face Swap + Voice Clone",
                confidence=0.942,
                status="Escalated to Case #ARG-8291",
                detected_at=datetime.utcnow()
            ),
            Detection(
                id="match_02",
                asset_id="ARG-2026-8A92F1",
                source_name="TikTok (Indexed Mirror)",
                source_url="https://tiktok.com/@mirror/video/281",
                region="UK",
                risk_level="DANGER",
                match_type="Lip-Sync Temporal Lag",
                confidence=0.875,
                status="Under Investigation",
                detected_at=datetime.utcnow()
            ),
            Detection(
                id="match_03",
                asset_id="ARG-2026-8A92F1",
                source_name="YouTube (Public Index)",
                source_url="https://youtube.com/watch?v=preview",
                region="India",
                risk_level="WARNING",
                match_type="20% Crop + Re-encode",
                confidence=0.791,
                status="Watermark Intact",
                detected_at=datetime.utcnow()
            ),
        ]
        for d in sample_detections:
            db.add(d)
        db.commit()
        results = sample_detections

    return results


@router.get("/{detection_id}", response_model=DetectionResponse)
def get_detection(detection_id: str, db: Session = Depends(get_db)):
    """GET /api/detections/{detection_id} — Retrieves detailed detection record."""
    detection = db.query(Detection).filter(Detection.id == detection_id).first()
    if not detection:
        raise EntityNotFoundException("Detection", detection_id)
    return detection
