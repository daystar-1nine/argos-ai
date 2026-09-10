"""
ARGOS AI - Forensic Report Schemas
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class ReportCreateRequest(BaseModel):
    analysis_id: str
    title: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    report_number: str
    asset_id: str
    analysis_id: Optional[str]
    title: str
    classification: str
    summary: str
    verification_hash: str
    pdf_download_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
