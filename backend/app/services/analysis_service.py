"""
ARGOS AI - Unified ML Analysis Service
Coordinates end-to-end multimodal deepfake forensics across all API routes
(Detection page, Test Lab, Media Protection workers) through a single canonical pipeline.
"""

import time
import uuid
import json
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, Callable

from ml.config import (
    DEVICE,
    DEVICE_NAME,
    TEMP_DIR,
    EVIDENCE_DIR,
    STATIC_DIR,
    SYNCNET_WEIGHTS_PATH,
    CLASSIFIER_WEIGHTS_PATH,
)
from ml.pipeline import ArgosDeepfakePipeline, PIPELINE_STAGES
from ml.preprocessing.video_processor import (
    VideoProcessingError,
    MissingAudioError,
    CorruptedVideoError,
    VideoDurationError,
)

# Persistent Job Storage Directory
JOBS_STORAGE_DIR = TEMP_DIR / "jobs"
JOBS_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


class AnalysisService:
    """
    Unified forensic analysis service.
    Orchestrates the 11-stage multimodal temporal lip-sync & deepfake detection pipeline,
    maintains resilient job tracking across server reloads, and formats forensic manifests.
    """

    _instance: Optional["AnalysisService"] = None

    def __init__(self):
        self.pipeline = ArgosDeepfakePipeline(device=DEVICE)
        self.in_memory_jobs: Dict[str, Dict[str, Any]] = {}
        self._load_persisted_jobs()

    @classmethod
    def get_instance(cls) -> "AnalysisService":
        if cls._instance is None:
            cls._instance = AnalysisService()
        return cls._instance

    def _job_file(self, job_id: str) -> Path:
        return JOBS_STORAGE_DIR / f"{job_id}.json"

    def _load_persisted_jobs(self):
        """Restores recent active jobs from disk to prevent 404s after uvicorn reload."""
        try:
            for p in JOBS_STORAGE_DIR.glob("*.json"):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self.in_memory_jobs[data["analysis_id"]] = data
                except Exception:
                    pass
        except Exception:
            pass

    def _save_job_state(self, job_id: str):
        """Persists job state atomically to disk."""
        if job_id in self.in_memory_jobs:
            job_data = self.in_memory_jobs[job_id]
            try:
                temp_p = JOBS_STORAGE_DIR / f"{job_id}.tmp"
                target_p = self._job_file(job_id)
                with open(temp_p, "w", encoding="utf-8") as f:
                    json.dump(job_data, f, indent=2)
                temp_p.replace(target_p)
            except Exception:
                pass

    def register_job(self, job_id: str, filename: str) -> Dict[str, Any]:
        """Registers an ingested video job in the tracking registry."""
        job = {
            "analysis_id": job_id,
            "filename": filename,
            "status": "processing",
            "stage": 1,
            "stage_name": PIPELINE_STAGES[0][1],
            "progress_pct": 5,
            "result": None,
            "error": None,
            "created_at": time.time(),
            "updated_at": time.time(),
        }
        self.in_memory_jobs[job_id] = job
        self._save_job_state(job_id)
        return job

    def update_job_progress(self, job_id: str, stage_num: int, stage_desc: str):
        """Updates real-time pipeline execution telemetry."""
        if job_id in self.in_memory_jobs:
            self.in_memory_jobs[job_id]["stage"] = stage_num
            self.in_memory_jobs[job_id]["stage_name"] = stage_desc
            self.in_memory_jobs[job_id]["progress_pct"] = round((stage_num / len(PIPELINE_STAGES)) * 100.0)
            self.in_memory_jobs[job_id]["updated_at"] = time.time()
            self._save_job_state(job_id)

    def mark_job_completed(self, job_id: str, result: Dict[str, Any]):
        """Marks a job completed with final multimodal inference manifest."""
        if job_id in self.in_memory_jobs:
            self.in_memory_jobs[job_id]["status"] = "completed"
            self.in_memory_jobs[job_id]["stage"] = 11
            self.in_memory_jobs[job_id]["stage_name"] = "Analysis Complete"
            self.in_memory_jobs[job_id]["progress_pct"] = 100
            self.in_memory_jobs[job_id]["result"] = result
            self.in_memory_jobs[job_id]["error"] = None
            self.in_memory_jobs[job_id]["updated_at"] = time.time()
            self._save_job_state(job_id)

    def mark_job_failed(self, job_id: str, error_info: Any):
        """Marks a job failed with actionable error description and structured diagnostics."""
        if job_id in self.in_memory_jobs:
            self.in_memory_jobs[job_id]["status"] = "failed"
            if isinstance(error_info, dict):
                self.in_memory_jobs[job_id]["error"] = error_info.get("message", str(error_info))
                self.in_memory_jobs[job_id]["error_details"] = error_info
            elif hasattr(error_info, "to_dict"):
                self.in_memory_jobs[job_id]["error"] = getattr(error_info, "message", str(error_info))
                self.in_memory_jobs[job_id]["error_details"] = error_info.to_dict()
            else:
                self.in_memory_jobs[job_id]["error"] = str(error_info)
                self.in_memory_jobs[job_id]["error_details"] = {
                    "stage": "pipeline_execution",
                    "status": "failed",
                    "error_code": "ANALYSIS_FAILED",
                    "message": str(error_info),
                    "details": "",
                }
            self.in_memory_jobs[job_id]["updated_at"] = time.time()
            self._save_job_state(job_id)

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves active job record."""
        if job_id not in self.in_memory_jobs:
            job_p = self._job_file(job_id)
            if job_p.exists():
                try:
                    with open(job_p, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        self.in_memory_jobs[job_id] = data
                except Exception:
                    pass
        return self.in_memory_jobs.get(job_id)

    def execute_analysis(
        self,
        video_path: str,
        analysis_id: Optional[str] = None,
        progress_callback: Optional[Callable[[int, str], None]] = None,
    ) -> Dict[str, Any]:
        """
        Executes genuine 11-stage multimodal temporal lip-sync analysis.
        """
        if analysis_id is None:
            analysis_id = f"argos_{uuid.uuid4().hex[:10]}"

        def on_stage(stage_num: int, stage_desc: str):
            self.update_job_progress(analysis_id, stage_num, stage_desc)
            if progress_callback:
                progress_callback(stage_num, stage_desc)

        try:
            result = self.pipeline.analyze_video(
                video_path=video_path,
                analysis_id=analysis_id,
                progress_callback=on_stage,
            )
            self.mark_job_completed(analysis_id, result)
            return result
        except PipelineStageError as e:
            self.mark_job_failed(analysis_id, e)
            raise
        except Exception as e:
            structured_err = {
                "stage": "pipeline_execution",
                "status": "failed",
                "error_code": "ANALYSIS_FAILED",
                "message": f"Inference Pipeline Error: {str(e)}",
                "details": str(e),
            }
            self.mark_job_failed(analysis_id, structured_err)
            raise VideoProcessingError(str(e)) from e


# Global singleton instance
analysis_service = AnalysisService.get_instance()
