"""
ARGOS AI - Multimodal Analysis Background Tasks
Executes real PyTorch deepfake forensics in an isolated worker, updating
database progress and persisting windows and evidence frames.
"""

import sys
import time
import shutil
import threading
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger, log_analysis_event
from app.db.session import SessionLocal
from app.db.models.media import MediaAsset
from app.db.models.analysis import Analysis, AnalysisWindow, EvidenceFrame
from app.services.storage_service import storage_service
from app.workers.celery_app import celery_app

# Import real ML pipeline
from ml.pipeline import ArgosDeepfakePipeline, PIPELINE_STAGES
from ml.config import DEVICE, DEVICE_NAME

# Global ML Pipeline singleton within worker process
_worker_pipeline: Optional[ArgosDeepfakePipeline] = None


def get_worker_pipeline() -> ArgosDeepfakePipeline:
    global _worker_pipeline
    if _worker_pipeline is None:
        logger.info(f"[WORKER] Initializing ArgosDeepfakePipeline on {DEVICE_NAME}...")
        _worker_pipeline = ArgosDeepfakePipeline(device=DEVICE)
    return _worker_pipeline


def stage_to_status_string(stage_num: int) -> str:
    """Maps 1-11 pipeline stage numbers to database status enum."""
    if stage_num <= 3:
        return "preprocessing"
    elif stage_num <= 5:
        return "extracting_features"
    elif stage_num <= 8:
        return "analyzing_sync"
    elif stage_num == 9:
        return "temporal_analysis"
    elif stage_num == 10:
        return "generating_evidence"
    elif stage_num >= 11:
        return "completed"
    return "preprocessing"


def execute_analysis_sync(analysis_id: str):
    """
    Core synchronous worker logic executing full 11-stage multimodal pipeline
    and writing real results, windows, and evidence frames to PostgreSQL.
    """
    db: Session = SessionLocal()
    pipeline = get_worker_pipeline()

    try:
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            logger.error(f"[WORKER] Analysis {analysis_id} not found in database.")
            return

        asset = db.query(MediaAsset).filter(MediaAsset.id == analysis.asset_id).first()
        if not asset:
            analysis.status = "failed"
            analysis.error_message = f"Associated MediaAsset {analysis.asset_id} not found."
            db.commit()
            return

        video_path = settings.BASE_STORAGE_DIR / asset.storage_path
        if not video_path.exists():
            analysis.status = "failed"
            analysis.error_message = f"Target media file does not exist at {video_path}."
            db.commit()
            return

        log_analysis_event(analysis_id, "ingest", "started", asset_id=asset.id)

        # Update initial running status
        analysis.status = "preprocessing"
        first_stage = PIPELINE_STAGES[0]
        analysis.current_stage = first_stage[1] if isinstance(first_stage, tuple) else str(first_stage)
        analysis.stage_number = 1
        analysis.progress_pct = 5
        db.commit()

        def on_progress(stage_num: int, stage_desc: str):
            """Progress callback invoked by ArgosDeepfakePipeline at every stage."""
            try:
                progress = round((stage_num / len(PIPELINE_STAGES)) * 100.0)
                status_str = stage_to_status_string(stage_num)
                desc_str = stage_desc[1] if isinstance(stage_desc, tuple) else str(stage_desc)
                # Re-query or update in fresh transaction
                db.query(Analysis).filter(Analysis.id == analysis_id).update({
                    "status": status_str,
                    "current_stage": desc_str,
                    "stage_number": stage_num,
                    "progress_pct": progress,
                })
                db.commit()
                log_analysis_event(analysis_id, f"stage_{stage_num}", status_str, details=desc_str)
            except Exception as e:
                db.rollback()
                logger.warning(f"[WORKER] Failed to update progress: {e}")

        # Run Real Multimodal Inference
        result = pipeline.analyze_video(
            video_path=str(video_path),
            analysis_id=analysis_id,
            progress_callback=on_progress,
        )

        # Update Analysis Summary Record
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        analysis.status = "completed"
        analysis.current_stage = "Analysis Complete"
        analysis.stage_number = 11
        analysis.progress_pct = 100
        analysis.verdict = result["verdict"]
        analysis.confidence = result["confidence"]
        analysis.real_probability = result["real_probability"]
        analysis.fake_probability = result["fake_probability"]
        analysis.visual_score = result["visual_score"]
        analysis.audio_score = result["audio_score"]
        analysis.sync_score = result["sync_score"]
        analysis.temporal_mismatch_ms = result["temporal_mismatch_ms"]
        analysis.device_used = result["analysis"]["device"]
        analysis.execution_time_sec = result["analysis"]["execution_time_sec"]
        analysis.total_windows_evaluated = result["analysis"]["total_windows"]
        analysis.metadata_json = result["analysis"]
        db.commit()

        # Persist Suspicious Temporal Windows
        for idx, win in enumerate(result.get("suspicious_windows", [])):
            window_row = AnalysisWindow(
                analysis_id=analysis_id,
                window_index=idx,
                start_sec=win["start_sec"],
                end_sec=win["end_sec"],
                start_frame=win["start_frame"],
                end_frame=win["end_frame"],
                sync_score=win["min_sync"],
                risk_level=win["risk_level"],
                anomaly_reason=win["reason"],
            )
            db.add(window_row)

        # Persist Forensic Keyframe Exhibits
        for frame in result.get("evidence_frames", []):
            f_idx = frame.get("frame_idx", frame.get("frame_number", 0))
            f_time = frame.get("timestamp_sec", 0.0)
            f_fmt = frame.get("timestamp_formatted", frame.get("timestamp", f"00:{f_time:05.2f}"))
            f_risk = frame.get("risk_pct", 50.0)
            f_reason = frame.get("reason", frame.get("description", frame.get("label", "Forensic anomaly frame")))
            f_path = frame.get("file_path", frame.get("image_url", ""))
            f_name = frame.get("filename", frame.get("file_name", f"evidence_{f_idx}.jpg"))

            evidence_row = EvidenceFrame(
                analysis_id=analysis_id,
                frame_index=f_idx,
                timestamp_sec=f_time,
                timestamp_formatted=f_fmt,
                risk_pct=f_risk,
                reason=f_reason,
                file_path=f_path,
                filename=f_name,
            )
            db.add(evidence_row)

        db.commit()
        log_analysis_event(
            analysis_id,
            "completion",
            "completed",
            details=f"verdict={result['verdict']} confidence={result['confidence_pct']}%"
        )

    except Exception as exc:
        db.rollback()
        logger.error(f"[WORKER_ERROR] Analysis {analysis_id} failed: {exc}", exc_info=True)
        db.query(Analysis).filter(Analysis.id == analysis_id).update({
            "status": "failed",
            "error_message": str(exc),
            "current_stage": "Analysis Failed",
        })
        db.commit()
    finally:
        db.close()


@celery_app.task(name="tasks.run_ml_analysis", bind=True)
def run_ml_analysis_task(self, analysis_id: str):
    """Celery task wrapper for asynchronous execution."""
    logger.info(f"[CELERY_TASK] Task {self.request.id} executing analysis {analysis_id}")
    execute_analysis_sync(analysis_id)
    return {"analysis_id": analysis_id, "status": "finished"}


def dispatch_analysis(analysis_id: str):
    """
    Intelligent dispatcher: dispatches to Celery if Redis is available,
    otherwise uses a background worker thread for standalone local development.
    """
    try:
        import redis
        r = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        r.ping()
        run_ml_analysis_task.delay(analysis_id)
        logger.info(f"[DISPATCHER] Dispatched analysis {analysis_id} to Celery queue.")
    except Exception:
        # Fallback to background worker thread
        logger.info(f"[DISPATCHER] Redis offline; executing analysis {analysis_id} in background thread worker.")
        thread = threading.Thread(target=execute_analysis_sync, args=(analysis_id,), daemon=True)
        thread.start()
