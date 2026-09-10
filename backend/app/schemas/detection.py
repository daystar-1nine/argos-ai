"""
ARGOS AI - Detection & Monitoring Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DetectionResponse(BaseModel):
    id: str
    asset_id: str
    analysis_id: Optional[str]
    source_name: str
    source_url: Optional[str]
    region: str
    risk_level: str
    match_type: str
    confidence: float
    status: str
    detected_at: datetime

    class Config:
        from_attributes = True


class MonitoringSourceResponse(BaseModel):
    id: str
    source_name: str
    source_type: str
    region: str
    status: str
    items_monitored_hourly: int
    last_sync_at: datetime

    class Config:
        from_attributes = True
