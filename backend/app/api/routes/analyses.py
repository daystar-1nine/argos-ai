"""
ARGOS AI - Deepfake Forensic Analyses API & WebSocket
"""

import asyncio
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, verify_asset_ownership
from app.core.exceptions import EntityNotFoundException, ArgosException
from app.db.base import generate_uuid
from app.db.session import get_db, SessionLocal
from app.db.models.user import User
from app.db.models.media import MediaAsset
from app.db.models.analysis import Analysis, AnalysisWindow, EvidenceFrame
from app.schemas.analysis import (
    AnalysisCreateRequest,
    AnalysisStatusResponse,
    AnalysisResultResponse,
    AnalysisWindowResponse,
    EvidenceFrameResponse,
)
from app.workers.analysis_tasks import dispatch_analysis

router = APIRouter(prefix="/analyses", tags=["Forensic Analysis Pipeline"])


@router.post("", response_model=AnalysisStatusResponse, status_code=status.HTTP_202_ACCEPTED)
def initiate_analysis(
    req: AnalysisCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /api/analyses
    Queues a new 11-stage multimodal temporal analysis job for the given asset_id.
    """
    asset = verify_asset_ownership(req.asset_id, current_user, db)

    # Check and enforce subscription quotas
    from app.services.subscription_service import subscription_service
    subscription_service.check_and_increment_usage(current_user, "analyses_count", db)

    analysis_id = f"anl_{generate_uuid()[:10]}"
    analysis = Analysis(
        id=analysis_id,
        asset_id=asset.id,
        user_id=current_user.id,
        status="queued",
        current_stage="Queued in Job Matrix",
        stage_number=1,
        progress_pct=5,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Dispatch to asynchronous worker queue
    dispatch_analysis(analysis_id)

    return AnalysisStatusResponse(
        analysis_id=analysis.id,
        status=analysis.status,
        progress=analysis.progress_pct,
        current_stage=analysis.current_stage,
    )


@router.get("/{analysis_id}", response_model=AnalysisStatusResponse)
def get_analysis_status(analysis_id: str, db: Session = Depends(get_db)):
    """GET /api/analyses/{analysis_id} — Returns current execution stage, progress percentage, or error."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise EntityNotFoundException("Analysis", analysis_id)

    result_payload = None
    if analysis.status == "completed":
        result_payload = {
            "verdict": analysis.verdict,
            "confidence": analysis.confidence,
            "real_probability": analysis.real_probability,
            "fake_probability": analysis.fake_probability,
            "sync_score": analysis.sync_score,
            "visual_score": analysis.visual_score,
            "audio_score": analysis.audio_score,
            "temporal_mismatch_ms": analysis.temporal_mismatch_ms,
        }

    return AnalysisStatusResponse(
        analysis_id=analysis.id,
        status=analysis.status,
        progress=analysis.progress_pct,
        current_stage=analysis.current_stage,
        error_message=analysis.error_message,
        result=result_payload,
    )


@router.get("/{analysis_id}/result", response_model=AnalysisResultResponse)
def get_full_analysis_result(analysis_id: str, db: Session = Depends(get_db)):
    """GET /api/analyses/{analysis_id}/result — Returns comprehensive forensic findings."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise EntityNotFoundException("Analysis", analysis_id)

    if analysis.status != "completed":
        raise ArgosException(
            f"Analysis {analysis_id} is currently '{analysis.status}'. Full result is not yet available.",
            code="ANALYSIS_NOT_COMPLETED",
            status_code=status.HTTP_409_CONFLICT
        )

    windows = db.query(AnalysisWindow).filter(AnalysisWindow.analysis_id == analysis_id).order_by(AnalysisWindow.window_index).all()
    evidence = db.query(EvidenceFrame).filter(EvidenceFrame.analysis_id == analysis_id).order_by(EvidenceFrame.frame_index).all()

    return AnalysisResultResponse(
        analysis_id=analysis.id,
        asset_id=analysis.asset_id,
        status=analysis.status,
        verdict=analysis.verdict,
        confidence=analysis.confidence,
        real_probability=analysis.real_probability,
        fake_probability=analysis.fake_probability,
        visual_score=analysis.visual_score,
        audio_score=analysis.audio_score,
        sync_score=analysis.sync_score,
        temporal_mismatch_ms=analysis.temporal_mismatch_ms,
        suspicious_windows=windows,
        evidence_frames=evidence,
        metadata=analysis.metadata_json or {},
        model={
            "name": analysis.model_version,
            "device": analysis.device_used,
            "execution_time_sec": analysis.execution_time_sec,
            "windows_evaluated": analysis.total_windows_evaluated,
        },
        created_at=analysis.created_at,
    )


@router.get("/{analysis_id}/windows", response_model=List[AnalysisWindowResponse])
def get_analysis_windows(analysis_id: str, db: Session = Depends(get_db)):
    """GET /api/analyses/{analysis_id}/windows — Retrieves evaluated temporal windows."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise EntityNotFoundException("Analysis", analysis_id)

    windows = db.query(AnalysisWindow).filter(AnalysisWindow.analysis_id == analysis_id).order_by(AnalysisWindow.window_index).all()
    return windows


@router.get("/{analysis_id}/evidence", response_model=List[EvidenceFrameResponse])
def get_analysis_evidence_frames(analysis_id: str, db: Session = Depends(get_db)):
    """GET /api/analyses/{analysis_id}/evidence — Retrieves forensic keyframe metadata."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise EntityNotFoundException("Analysis", analysis_id)

    frames = db.query(EvidenceFrame).filter(EvidenceFrame.analysis_id == analysis_id).order_by(EvidenceFrame.frame_index).all()
    return frames


@router.get("/{analysis_id}/evidence/{filename}")
def serve_evidence_frame_image(analysis_id: str, filename: str):
    """GET /api/analyses/{analysis_id}/evidence/{filename} — Serves actual keyframe JPEG image."""
    frame_path = settings.EVIDENCE_DIR / analysis_id / filename
    if not frame_path.exists():
        # Check backend/static/evidence fallback
        legacy_path = settings.BACKEND_DIR / "static" / "evidence" / analysis_id / filename
        if legacy_path.exists():
            frame_path = legacy_path
        else:
            raise EntityNotFoundException("EvidenceFrame", filename)

    return FileResponse(str(frame_path), media_type="image/jpeg")


# WebSocket for Real-time Stage Progression
@router.websocket("/ws/{analysis_id}")
async def analysis_websocket_endpoint(websocket: WebSocket, analysis_id: str):
    """
    WebSocket endpoint streaming live real-time state changes without fake delays.
    """
    await websocket.accept()
    last_stage = None
    last_status = None

    try:
        while True:
            db = SessionLocal()
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            db.close()

            if not analysis:
                await websocket.send_json({"error": f"Analysis {analysis_id} not found."})
                break

            if analysis.current_stage != last_stage or analysis.status != last_status:
                last_stage = analysis.current_stage
                last_status = analysis.status

                await websocket.send_json({
                    "analysis_id": analysis_id,
                    "status": analysis.status,
                    "stage_name": analysis.current_stage,
                    "stage_number": analysis.stage_number,
                    "progress_pct": analysis.progress_pct,
                })

            if analysis.status in ["completed", "failed"]:
                break

            await asyncio.sleep(0.5)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close()
