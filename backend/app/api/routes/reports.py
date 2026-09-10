"""
ARGOS AI - Forensic Dossiers & Reports API Endpoints
"""

from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, get_db
from app.core.exceptions import EntityNotFoundException, ArgosException
from app.db.models.user import User
from app.db.models.analysis import Analysis
from app.db.models.media import MediaAsset
from app.db.models.report import Report
from app.schemas.report import ReportResponse
from app.services.report_service import report_service

from app.services.subscription_service import require_feature

router = APIRouter(prefix="/reports", tags=["Forensic Reports & Dossiers"])


@router.post("/{analysis_id}", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_forensic_report(
    analysis_id: str,
    current_user: User = Depends(require_feature("advanced_reports")),
    db: Session = Depends(get_db),
):
    """
    POST /api/reports/{analysis_id}
    Generates a cryptographically sealed PDF dossier from a completed analysis.
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise EntityNotFoundException("Analysis", analysis_id)

    if analysis.status != "completed":
        raise ArgosException(
            "Cannot generate report for an analysis that has not completed.",
            code="ANALYSIS_INCOMPLETE",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    asset = db.query(MediaAsset).filter(MediaAsset.id == analysis.asset_id).first()
    if not asset:
        raise EntityNotFoundException("MediaAsset", analysis.asset_id)

    report = report_service.generate_pdf(analysis=analysis, asset=asset, db=db)
    return report


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_metadata(report_id: str, db: Session = Depends(get_db)):
    """GET /api/reports/{report_id} — Retrieves report metadata and SHA-256 seal."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        # Check by report_number
        report = db.query(Report).filter(Report.report_number == report_id).first()
    if not report:
        raise EntityNotFoundException("Report", report_id)

    return report


@router.get("/{report_id}/download")
def download_pdf_report(report_id: str, db: Session = Depends(get_db)):
    """GET /api/reports/{report_id}/download — Streams binary PDF file."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        report = db.query(Report).filter(Report.report_number == report_id).first()
    if not report:
        raise EntityNotFoundException("Report", report_id)

    pdf_file_path = settings.BASE_STORAGE_DIR / report.pdf_path
    if not pdf_file_path.exists():
        raise EntityNotFoundException("ReportPDFFile", str(pdf_file_path))

    return FileResponse(
        str(pdf_file_path),
        media_type="application/pdf",
        filename=f"{report.report_number}.pdf"
    )
