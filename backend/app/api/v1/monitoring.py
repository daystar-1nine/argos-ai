from fastapi import APIRouter
from typing import List
from app.models.schemas import MonitoringSource, DetectedMatch
from app.core.mock_data import SAMPLE_MONITORING_SOURCES, SAMPLE_DETECTED_MATCHES

router = APIRouter(prefix="/monitoring", tags=["Global Watch"])

@router.get("/sources", response_model=List[MonitoringSource])
def list_monitoring_sources():
    """
    List supported public, indexed and integrated sources currently monitored.
    """
    return [MonitoringSource(**s) for s in SAMPLE_MONITORING_SOURCES]

@router.get("/matches", response_model=List[DetectedMatch])
def list_detected_matches(asset_id: str = None):
    """
    List suspicious derivatives detected across monitored public sources.
    """
    matches = SAMPLE_DETECTED_MATCHES
    if asset_id:
        matches = [m for m in matches if m["asset_id"] == asset_id]
    return [DetectedMatch(**m) for m in matches]

@router.get("/stats")
def get_monitoring_stats():
    """
    Aggregated telemetry for Argos Global Watch.
    """
    return {
        "scope_notice": "Monitoring supported public, indexed and integrated sources.",
        "active_sources_count": len(SAMPLE_MONITORING_SOURCES),
        "total_items_indexed_hourly": sum(s["items_monitored_hourly"] for s in SAMPLE_MONITORING_SOURCES),
        "potential_matches_found": 6,
        "modified_copies": 3,
        "suspected_manipulations": 2,
        "original_copies": 1,
        "monitored_regions": [
            {"region": "India", "active_nodes": 4, "status": "nominal"},
            {"region": "USA", "active_nodes": 12, "status": "nominal"},
            {"region": "UK", "active_nodes": 6, "status": "nominal"},
            {"region": "Singapore", "active_nodes": 3, "status": "nominal"},
            {"region": "Australia", "active_nodes": 3, "status": "nominal"}
        ]
    }
