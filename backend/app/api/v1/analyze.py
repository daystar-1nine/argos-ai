"""
ARGOS AI - Live Video Analysis API Endpoints
Accepts real video uploads, executes multimodal temporal lip-sync detection,
and serves progressive analysis states and forensic evidence frames.
"""

import os
import uuid
import shutil
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ml.config import (
    STATIC_DIR,
    TEMP_DIR,
    EVIDENCE_DIR,
    DEVICE,
    DEVICE_NAME,
)
from ml.pipeline import ArgosDeepfakePipeline, PIPELINE_STAGES
from ml.preprocessing.sample_generator import create_sample_audiovisual_video

router = APIRouter(prefix="/analyze", tags=["Real ML Deepfake Detection Engine"])

# Global in-memory job store for background analysis tracking
ANALYSIS_JOBS: Dict[str, Dict[str, Any]] = {}

# Lazy pipeline singleton instance
_pipeline_instance: Optional[ArgosDeepfakePipeline] = None

# Static sample cache directory
STATIC_SAMPLES_DIR = STATIC_DIR / "samples"
STATIC_SAMPLES_DIR.mkdir(parents=True, exist_ok=True)


def get_pipeline() -> ArgosDeepfakePipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = ArgosDeepfakePipeline(device=DEVICE)
    return _pipeline_instance


def execute_background_analysis(analysis_id: str, video_path: str, is_sample: bool = False):
    """Background worker executing full 11-stage multimodal pipeline."""
    pipeline = get_pipeline()

    def on_progress(stage_num: int, stage_desc: str):
        if analysis_id in ANALYSIS_JOBS:
            ANALYSIS_JOBS[analysis_id]["stage"] = stage_num
            ANALYSIS_JOBS[analysis_id]["stage_name"] = stage_desc
            ANALYSIS_JOBS[analysis_id]["progress_pct"] = round((stage_num / len(PIPELINE_STAGES)) * 100.0)

    try:
        result = pipeline.analyze_video(
            video_path=video_path,
            analysis_id=analysis_id,
            progress_callback=on_progress,
        )
        ANALYSIS_JOBS[analysis_id]["status"] = "completed"
        ANALYSIS_JOBS[analysis_id]["stage"] = 11
        ANALYSIS_JOBS[analysis_id]["stage_name"] = "Analysis Complete"
        ANALYSIS_JOBS[analysis_id]["progress_pct"] = 100
        ANALYSIS_JOBS[analysis_id]["result"] = result
    except Exception as exc:
        ANALYSIS_JOBS[analysis_id]["status"] = "failed"
        ANALYSIS_JOBS[analysis_id]["error"] = str(exc)
    finally:
        # Clean up uploaded video temp file if not a static sample
        if not is_sample:
            try:
                if Path(video_path).exists():
                    Path(video_path).unlink(missing_ok=True)
            except Exception:
                pass


@router.get("/system/device")
def get_ml_device_status():
    """
    GET /api/v1/analyze/system/device
    Returns hardware acceleration status (CUDA GPU vs multi-threaded CPU).
    """
    import torch
    return {
        "device": str(DEVICE),
        "device_name": DEVICE_NAME,
        "cuda_available": torch.cuda.is_available(),
        "torch_version": torch.__version__,
        "pipeline_stages_count": len(PIPELINE_STAGES),
        "supported_codecs": ["h264", "hevc", "vp9", "aac", "pcm_s16le"],
    }


class SampleAnalysisRequest(BaseModel):
    sample_type: str = "authentic"  # "authentic" or "manipulated"


@router.post("/sample")
async def analyze_sample_video(
    background_tasks: BackgroundTasks,
    request: Optional[SampleAnalysisRequest] = None,
    sample_type: Optional[str] = Query(None),
):
    """
    POST /api/v1/analyze/sample
    Executes real multimodal ML inference on a synthesized audiovisual test sample.
    Zero mock data - runs the full 11-stage pipeline on an actual test video stream.
    """
    kind = "manipulated" if (request and request.sample_type == "manipulated") or sample_type == "manipulated" else "authentic"
    is_anomaly = (kind == "manipulated")

    analysis_id = f"argos_sample_{uuid.uuid4().hex[:8]}"
    sample_file_path = STATIC_SAMPLES_DIR / f"test_{kind}.mp4"

    if not sample_file_path.exists():
        create_sample_audiovisual_video(
            output_path=sample_file_path,
            duration_sec=2.5,
            fps=25,
            sample_rate=16000,
            is_anomaly=is_anomaly,
        )

    # Copy to unique run instance so concurrent runs don't conflict
    run_file_path = TEMP_DIR / f"{analysis_id}_{sample_file_path.name}"
    shutil.copyfile(sample_file_path, run_file_path)

    ANALYSIS_JOBS[analysis_id] = {
        "analysis_id": analysis_id,
        "filename": f"sample_{kind}_video.mp4",
        "status": "processing",
        "stage": 1,
        "stage_name": "Video Uploaded & Validated",
        "progress_pct": 5,
        "result": None,
        "error": None,
    }

    background_tasks.add_task(execute_background_analysis, analysis_id, str(run_file_path), False)

    return {
        "analysis_id": analysis_id,
        "filename": f"sample_{kind}_video.mp4",
        "status": "processing",
        "stage": 1,
        "stage_name": "Video Ingested & Validated",
        "progress_pct": 5,
        "message": f"Real audiovisual test video ({kind}) submitted. Multimodal analysis initiated.",
    }


@router.post("")
async def upload_and_analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    POST /api/v1/analyze
    Accepts video file upload (.mp4, .mov, .avi), initiates real multimodal ML inference,
    and returns an analysis tracking ID.
    """
    filename = file.filename or "uploaded_video.mp4"
    valid_exts = [".mp4", ".mov", ".avi", ".mkv", ".webm"]
    ext = Path(filename).suffix.lower()

    if ext not in valid_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Supported formats: {', '.join(valid_exts)}"
        )

    analysis_id = f"argos_{uuid.uuid4().hex[:10]}"
    temp_save_path = TEMP_DIR / f"{analysis_id}_{filename}"

    # Save uploaded file to temp directory
    try:
        with open(temp_save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store uploaded video: {e}")

    # Register in jobs dictionary
    ANALYSIS_JOBS[analysis_id] = {
        "analysis_id": analysis_id,
        "filename": filename,
        "status": "processing",
        "stage": 1,
        "stage_name": "Video Uploaded & Validated",
        "progress_pct": 5,
        "result": None,
        "error": None,
    }

    # Dispatch to background task worker
    background_tasks.add_task(execute_background_analysis, analysis_id, str(temp_save_path), False)

    return {
        "analysis_id": analysis_id,
        "status": "processing",
        "stage": 1,
        "stage_name": "Video Uploaded & Validated",
        "progress_pct": 5,
        "message": "Video successfully ingested. Multimodal neural analysis pipeline initiated.",
    }


@router.get("/{analysis_id}")
def get_analysis_status_or_result(analysis_id: str):
    """
    GET /api/v1/analyze/{analysis_id}
    Returns active pipeline stage, progress percentage, and final forensic result when completed.
    """
    if analysis_id not in ANALYSIS_JOBS:
        raise HTTPException(status_code=404, detail=f"Analysis ID '{analysis_id}' not found.")

    job = ANALYSIS_JOBS[analysis_id]
    return job


@router.get("/{analysis_id}/frames/{frame_filename}")
def get_evidence_frame(analysis_id: str, frame_filename: str):
    """
    GET /api/v1/analyze/{analysis_id}/frames/{frame_filename}
    Serves forensic exhibit keyframe JPEG image.
    """
    frame_path = EVIDENCE_DIR / analysis_id / frame_filename
    if not frame_path.exists():
        raise HTTPException(status_code=404, detail=f"Evidence frame '{frame_filename}' not found.")

    return FileResponse(str(frame_path), media_type="image/jpeg")
