"""
ARGOS AI - Celery Distributed Task Queue Configuration
Configures asynchronous ML inference workers using Redis broker and result backend.
"""

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "argos_forensic_workers",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.analysis_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.ANALYSIS_TIMEOUT_SEC,
    worker_prefetch_multiplier=1,  # Ensure heavy GPU/CPU tasks are not hoarded
    worker_max_tasks_per_child=50,  # Prevent potential memory leaks across long runs
)
