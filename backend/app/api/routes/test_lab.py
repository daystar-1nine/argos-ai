"""
ARGOS AI - Developer & Evaluation Test Lab API Endpoints
Provides real video testing, live stage tracking, keyframe evidence serving,
and comparative Real vs Fake analysis.
"""

import os
import uuid
import shutil
import threading
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Query
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings
from app.core.exceptions import EntityNotFoundException, ArgosException
from ml.evaluation.evaluator import VideoEvaluator, SUPPORTED_VIDEO_EXTENSIONS

router = APIRouter(prefix="/test-lab", tags=["Forensic Test Lab"])

# Storage roots for Test Lab
TEST_LAB_DIR = settings.BASE_STORAGE_DIR / "test_lab"
VIDEOS_DIR = TEST_LAB_DIR / "videos"
RESULTS_DIR = TEST_LAB_DIR / "results"

VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# In-memory execution registry for Test Lab runs
_test_jobs: Dict[str, Dict[str, Any]] = {}
_evaluator_singleton: Optional[VideoEvaluator] = None


def get_evaluator() -> VideoEvaluator:
    global _evaluator_singleton
    if _evaluator_singleton is None:
        _evaluator_singleton = VideoEvaluator()
    return _evaluator_singleton


def _run_evaluation_background(test_id: str, video_path: str, ground_truth: Optional[str], debug: bool):
    """Worker function executed in background thread."""
    output_dir = RESULTS_DIR / test_id
    output_dir.mkdir(parents=True, exist_ok=True)
    evaluator = get_evaluator()

    def on_progress(stage_num: int, stage_desc: str):
        if test_id in _test_jobs:
            progress = min(100, round((stage_num / 12.0) * 100.0))
            _test_jobs[test_id]["stage_number"] = stage_num
            _test_jobs[test_id]["total_stages"] = 12
            _test_jobs[test_id]["current_stage"] = stage_desc
            _test_jobs[test_id]["progress_pct"] = progress

    try:
        result = evaluator.evaluate(
            video_path=video_path,
            ground_truth=ground_truth,
            debug=debug,
            output_dir=output_dir,
            progress_callback=on_progress,
        )

        status_str = result.get("status", "completed")
        _test_jobs[test_id]["status"] = status_str
        _test_jobs[test_id]["progress_pct"] = 100
        _test_jobs[test_id]["current_stage"] = "Evaluation Complete" if status_str == "completed" else result.get("message", "Evaluation Failed")
        _test_jobs[test_id]["result"] = result

    except Exception as exc:
        _test_jobs[test_id]["status"] = "failed"
        _test_jobs[test_id]["progress_pct"] = 100
        _test_jobs[test_id]["current_stage"] = "Evaluation Error"
        _test_jobs[test_id]["error_message"] = str(exc)


@router.get("/samples")
def list_benchmark_samples():
    """
    GET /api/test-lab/samples
    Returns pre-synthesized benchmark test videos available for instant evaluation.
    """
    root_data = Path(__file__).resolve().parents[4] / "data" / "test"
    samples = {"real": [], "fake": [], "edge_cases": []}

    for cat in ["real", "fake", "edge_cases"]:
        p = root_data / cat
        if p.exists():
            for f in sorted(p.iterdir()):
                if f.is_file() and f.suffix.lower() in SUPPORTED_VIDEO_EXTENSIONS:
                    samples[cat].append({
                        "filename": f.name,
                        "category": cat,
                        "size_bytes": f.stat().st_size,
                        "path": str(f),
                    })

    return samples


@router.post("/analyze", status_code=status.HTTP_202_ACCEPTED)
async def upload_and_analyze_video(
    file: UploadFile = File(...),
    ground_truth: Optional[str] = Form("unknown"),
    debug: bool = Form(True),
):
    """
    POST /api/test-lab/analyze
    Accepts real video files (.mp4, .mov, .avi, .webm, .mkv) and dispatches genuine inference.
    """
    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{suffix}'. Supported: {', '.join(sorted(SUPPORTED_VIDEO_EXTENSIONS))}",
        )

    test_id = f"tst_{uuid.uuid4().hex[:10]}"
    saved_video_path = VIDEOS_DIR / f"{test_id}_{file.filename}"

    with open(saved_video_path, "wb") as f_out:
        content = await file.read()
        f_out.write(content)

    gt_value = (ground_truth or "unknown").strip().lower()

    _test_jobs[test_id] = {
        "test_id": test_id,
        "filename": file.filename,
        "video_path": str(saved_video_path),
        "ground_truth": gt_value,
        "status": "processing",
        "current_stage": "01 VIDEO VALIDATION: Ingesting & inspecting streams",
        "stage_number": 1,
        "total_stages": 12,
        "progress_pct": 8,
        "result": None,
        "error_message": None,
    }

    # Launch evaluation worker thread
    thread = threading.Thread(
        target=_run_evaluation_background,
        args=(test_id, str(saved_video_path), gt_value, debug),
        daemon=True,
    )
    thread.start()

    return {
        "test_id": test_id,
        "status": "processing",
        "filename": file.filename,
        "ground_truth": gt_value,
        "message": "Video accepted. Multimodal forensic evaluation underway.",
    }


@router.post("/analyze-sample", status_code=status.HTTP_202_ACCEPTED)
def analyze_existing_sample(
    category: str = Query(..., pattern="^(real|fake|edge_cases)$"),
    filename: str = Query(...),
    ground_truth: Optional[str] = Query(None),
    debug: bool = Query(True),
):
    """
    POST /api/test-lab/analyze-sample
    Dispatches evaluation directly on pre-seeded test fixtures.
    """
    sample_path = Path(__file__).resolve().parents[4] / "data" / "test" / category / filename
    if not sample_path.exists():
        raise EntityNotFoundException("TestSample", f"{category}/{filename}")

    gt_value = (ground_truth or category).strip().lower()
    test_id = f"tst_{uuid.uuid4().hex[:10]}"
    _test_jobs[test_id] = {
        "test_id": test_id,
        "filename": filename,
        "video_path": str(sample_path),
        "ground_truth": gt_value,
        "status": "processing",
        "current_stage": "01 VIDEO VALIDATION: Loading media from benchmark dataset",
        "stage_number": 1,
        "total_stages": 12,
        "progress_pct": 8,
        "result": None,
        "error_message": None,
    }

    thread = threading.Thread(
        target=_run_evaluation_background,
        args=(test_id, str(sample_path), gt_value, debug),
        daemon=True,
    )
    thread.start()

    return {
        "test_id": test_id,
        "status": "processing",
        "filename": filename,
        "ground_truth": gt_value,
        "message": f"Sample '{filename}' ({category.upper()}) queued for forensic analysis.",
    }


@router.get("/{test_id}")
def get_test_status(test_id: str):
    """
    GET /api/test-lab/{test_id}
    Returns real-time execution stage, progress percentage, and summary.
    """
    job = _test_jobs.get(test_id)
    if not job:
        raise EntityNotFoundException("TestLabRun", test_id)

    return {
        "test_id": test_id,
        "filename": job["filename"],
        "status": job["status"],
        "current_stage": job["current_stage"],
        "stage_number": job.get("stage_number", 1),
        "progress_pct": job["progress_pct"],
        "error_message": job.get("error_message"),
        "has_result": job["result"] is not None,
    }


@router.get("/{test_id}/result")
def get_test_result(test_id: str):
    """
    GET /api/test-lab/{test_id}/result
    Returns comprehensive forensic report, scores, timeline, and evidence frames.
    """
    job = _test_jobs.get(test_id)
    if not job:
        raise EntityNotFoundException("TestLabRun", test_id)

    if job["status"] == "processing":
        raise ArgosException(
            f"Test job {test_id} is still processing ({job.get('current_stage')}).",
            code="ANALYSIS_IN_PROGRESS",
            status_code=status.HTTP_409_CONFLICT,
        )

    if job["status"] == "failed":
        raise ArgosException(
            f"Test evaluation failed: {job.get('error_message')}",
            code="ANALYSIS_FAILED",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return job["result"]


@router.get("/{test_id}/evidence/{filename}")
def serve_test_evidence_frame(test_id: str, filename: str):
    """
    GET /api/test-lab/{test_id}/evidence/{filename}
    Streams the genuine extracted keyframe JPEG image with anomaly bounding box.
    """
    frame_path = RESULTS_DIR / test_id / "evidence" / filename
    # Also check if filename is inside a nested video folder
    if not frame_path.exists():
        matches = list((RESULTS_DIR / test_id).glob(f"**/evidence/**/{filename}"))
        if matches:
            frame_path = matches[0]
        else:
            matches_root = list(Path("results").glob(f"**/evidence/**/{filename}"))
            if matches_root:
                frame_path = matches_root[0]
            else:
                raise EntityNotFoundException("EvidenceFrame", filename)

    return FileResponse(str(frame_path), media_type="image/jpeg")


@router.get("/{test_id}/debug/{filename}")
def serve_test_debug_artifact(test_id: str, filename: str):
    """
    GET /api/test-lab/{test_id}/debug/{filename}
    Serves debug plots (temporal_sync_plot.png, mel_spectrogram.png) or crops.
    """
    artifact_path = RESULTS_DIR / test_id / "debug" / filename
    if not artifact_path.exists():
        matches = list((RESULTS_DIR / test_id).glob(f"**/debug/**/{filename}"))
        if matches:
            artifact_path = matches[0]
        else:
            matches_root = list(Path("results").glob(f"**/debug/**/{filename}"))
            if matches_root:
                artifact_path = matches_root[0]
            else:
                raise EntityNotFoundException("DebugArtifact", filename)

    media_type = "image/png" if filename.endswith(".png") else ("image/jpeg" if filename.endswith(".jpg") else "application/json")
    return FileResponse(str(artifact_path), media_type=media_type)


@router.post("/compare")
def compare_real_and_fake(
    real_test_id: str = Form(...),
    fake_test_id: str = Form(...),
):
    """
    POST /api/test-lab/compare
    Produces side-by-side comparative forensic breakdown between a Real video and a Fake video.
    """
    job_real = _test_jobs.get(real_test_id)
    job_fake = _test_jobs.get(fake_test_id)

    if not job_real or not job_real.get("result"):
        raise EntityNotFoundException("TestLabRun (Real)", real_test_id)
    if not job_fake or not job_fake.get("result"):
        raise EntityNotFoundException("TestLabRun (Fake)", fake_test_id)

    res_real = job_real["result"]
    res_fake = job_fake["result"]

    comparison = {
        "real": {
            "test_id": real_test_id,
            "video": res_real["video"],
            "verdict": res_real["verdict"],
            "confidence_pct": res_real["confidence_pct"],
            "sync_score": res_real["sync_score"],
            "visual_score": res_real["visual_score"],
            "audio_score": res_real["audio_score"],
            "temporal_mismatch": res_real["temporal_mismatch_ms"],
            "suspicious_windows_count": len(res_real.get("suspicious_windows", [])),
            "timeline": res_real.get("timeline", []),
        },
        "fake": {
            "test_id": fake_test_id,
            "video": res_fake["video"],
            "verdict": res_fake["verdict"],
            "confidence_pct": res_fake["confidence_pct"],
            "sync_score": res_fake["sync_score"],
            "visual_score": res_fake["visual_score"],
            "audio_score": res_fake["audio_score"],
            "temporal_mismatch": res_fake["temporal_mismatch_ms"],
            "suspicious_windows_count": len(res_fake.get("suspicious_windows", [])),
            "timeline": res_fake.get("timeline", []),
        },
        "matrix": [
            {
                "metric": "AV Sync Score",
                "real": f"{res_real['sync_score']:.2f}",
                "fake": f"{res_fake['sync_score']:.2f}",
                "delta": f"{res_real['sync_score'] - res_fake['sync_score']:+.2f}",
            },
            {
                "metric": "Visual Score",
                "real": f"{res_real['visual_score']}%",
                "fake": f"{res_fake['visual_score']}%",
                "delta": f"{res_real['visual_score'] - res_fake['visual_score']:+.1f}%",
            },
            {
                "metric": "Audio Score",
                "real": f"{res_real['audio_score']}%",
                "fake": f"{res_fake['audio_score']}%",
                "delta": f"{res_real['audio_score'] - res_fake['audio_score']:+.1f}%",
            },
            {
                "metric": "Confidence",
                "real": f"{res_real['confidence_pct']}%",
                "fake": f"{res_fake['confidence_pct']}%",
                "delta": f"{res_real['confidence_pct'] - res_fake['confidence_pct']:+.1f}%",
            },
            {
                "metric": "Temporal Mismatch",
                "real": res_real["temporal_mismatch_ms"],
                "fake": res_fake["temporal_mismatch_ms"],
                "delta": "N/A",
            },
        ],
    }

    return comparison
