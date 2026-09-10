"""
ARGOS AI - Forensic PDF Report Generation Service
Generates official, cryptographically sealed PDF forensic dossiers using ReportLab.
"""

import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import logger
from app.db.base import generate_uuid
from app.db.models.analysis import Analysis
from app.db.models.media import MediaAsset
from app.db.models.report import Report
from app.services.storage_service import storage_service


class ReportService:
    """Generates immutable forensic analysis dossiers in PDF format."""

    def generate_pdf(self, analysis: Analysis, asset: MediaAsset, db: Session) -> Report:
        """Generates a complete forensic dossier and registers the report in PostgreSQL."""
        report_id = generate_uuid()
        report_number = f"REP-ARG-{datetime.utcnow().year}-{report_id[:8].upper()}"

        reports_dir = settings.REPORTS_DIR / analysis.id
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_path = reports_dir / f"{report_number}.pdf"

        # Initialize ReportLab Document
        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        styles = getSampleStyleSheet()
        normal = styles["Normal"]

        # Custom brutalist/forensic styles
        title_style = ParagraphStyle(
            "ArgosTitle",
            parent=normal,
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#111111"),
            spaceAfter=4,
        )

        badge_style = ParagraphStyle(
            "ArgosBadge",
            parent=normal,
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=11,
            textColor=colors.HexColor("#844469"),
            spaceAfter=6,
        )

        body_style = ParagraphStyle(
            "ArgosBody",
            parent=normal,
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#222222"),
        )

        h2_style = ParagraphStyle(
            "ArgosH2",
            parent=normal,
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#111111"),
            spaceBefore=12,
            spaceAfter=6,
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("ARGOS AI // SOVEREIGN MEDIA FORENSICS", badge_style))
        story.append(Paragraph("FORENSIC ANALYSIS DOSSIER", title_style))
        story.append(Paragraph("Audio-Visual Temporal Lip-Sync & Deepfake Detection Engine", body_style))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#111111"), spaceAfter=15))

        # 2. Case Identifiers Table
        case_info = [
            [Paragraph("<b>REPORT NUMBER:</b>", body_style), Paragraph(report_number, body_style)],
            [Paragraph("<b>ASSET ID:</b>", body_style), Paragraph(asset.id, body_style)],
            [Paragraph("<b>ANALYSIS ID:</b>", body_style), Paragraph(analysis.id, body_style)],
            [Paragraph("<b>DATE / TIME (UTC):</b>", body_style), Paragraph(datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), body_style)],
            [Paragraph("<b>MEDIA FILE:</b>", body_style), Paragraph(f"{asset.file_name} ({asset.duration_seconds:.2f}s @ {asset.fps} FPS)", body_style)],
        ]
        info_table = Table(case_info, colWidths=[150, 380])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8E8E8")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#111111")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E0C0C0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 15))

        # 3. Core Verdict & Confidence Callout
        verdict_str = analysis.verdict or "INCONCLUSIVE"
        conf_pct = (analysis.confidence or 0.0) * 100.0
        is_manipulated = "MANIPULATED" in verdict_str or "HIGH" in verdict_str

        verdict_color = colors.HexColor("#D95D5D") if is_manipulated else colors.HexColor("#439657")
        verdict_text = "POTENTIALLY MANIPULATED (SYNTHETIC DERIVATIVE DETECTED)" if is_manipulated else "AUTHENTIC MEDIA (NATURAL AUDIO-VISUAL COHERENCE)"

        verdict_data = [
            [
                Paragraph("<b>OVERALL FORENSIC VERDICT:</b>", body_style),
                Paragraph(f"<font color='{verdict_color.hexval()}'><b>{verdict_text}</b></font>", body_style),
            ],
            [
                Paragraph("<b>MODEL CONFIDENCE:</b>", body_style),
                Paragraph(f"<b>{conf_pct:.1f}%</b> (P_real={analysis.real_probability or 0:.3f}, P_fake={analysis.fake_probability or 0:.3f})", body_style),
            ],
        ]
        verdict_table = Table(verdict_data, colWidths=[180, 350])
        verdict_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFD99C")),
            ("BOX", (0, 0), (-1, -1), 2, colors.HexColor("#111111")),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(verdict_table)
        story.append(Spacer(1, 15))

        # 4. Cross-Modal Scores Breakdown
        story.append(Paragraph("CROSS-MODAL METRIC BREAKDOWN", h2_style))
        scores_data = [
            ["METRIC", "SCORE", "EVALUATION BASIS"],
            ["Lip-Sync Alignment", f"{analysis.sync_score or 0:.1f}%", "SyncNet 3D-CNN cross-modal cosine similarity S(t)"],
            ["Visual Kinematics", f"{analysis.visual_score or 0:.1f}%", "Normalized 96x96 Lip ROI temporal trajectory stability"],
            ["Audio Consistency", f"{analysis.audio_score or 0:.1f}%", "80-Band Mel-spectrogram & formant frequency continuity"],
            ["Temporal Offset", str(analysis.temporal_mismatch_ms or "0ms"), "Estimated acoustic-visual viseme lag"],
        ]
        scores_table = Table(scores_data, colWidths=[140, 90, 300])
        scores_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#111111")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#F4CD3F")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#111111")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("TOPPADDING", (0, 1), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ]))
        story.append(scores_table)
        story.append(Spacer(1, 15))

        # 5. Suspicious Temporal Windows
        story.append(Paragraph("SUSPICIOUS TEMPORAL INTERVALS", h2_style))
        windows = analysis.windows or []
        if not windows:
            story.append(Paragraph("No temporal intervals dropped below the 0.55 synchronization threshold. Continuous audio-visual alignment maintained.", body_style))
        else:
            win_rows = [["INTERVAL", "FRAMES", "MIN SYNC", "SEVERITY", "ANOMALY REASON"]]
            for w in windows[:6]:  # Show top 6
                win_rows.append([
                    f"{w.start_sec:.2f}s - {w.end_sec:.2f}s",
                    f"#{w.start_frame}-{w.end_frame}",
                    f"{w.sync_score * 100:.1f}%",
                    w.risk_level,
                    w.anomaly_reason or "Desynchronization dip"
                ])
            win_table = Table(win_rows, colWidths=[90, 70, 65, 65, 240])
            win_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#844469")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(win_table)

        story.append(Spacer(1, 15))

        # 6. Forensic Limitations & Legal Disclaimer
        story.append(Paragraph("SCIENTIFIC METHODOLOGY & LIMITATIONS NOTICE", h2_style))
        disclaimer = (
            "ARGOS AI evaluates probabilistic indicators of synthetic manipulation through deep multimodal neural networks. "
            "Forensic outputs do not constitute absolute legal certainty ('100% confirmed'). Extreme compression, optical motion blur, "
            "acoustic reverberation, or non-English dubbing may affect synchronization metrics. "
            "This report represents empirical forensic measurements computed against mathematical reference models."
        )
        story.append(Paragraph(disclaimer, ParagraphStyle("Disclaimer", parent=body_style, fontSize=8, leading=11, textColor=colors.HexColor("#555555"))))
        story.append(Spacer(1, 15))

        # Build PDF
        doc.build(story)

        # Compute SHA-256 seal of the generated PDF
        hasher = hashlib.sha256()
        with open(pdf_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        seal_hash = hasher.hexdigest()

        # Save DB Report entity
        report = Report(
            id=report_id,
            report_number=report_number,
            asset_id=asset.id,
            analysis_id=analysis.id,
            title=f"Forensic Dossier: {asset.file_name}",
            classification="CONFIDENTIAL FORENSIC DOSSIER",
            summary=f"Analysis executed on {asset.file_name}. Verdict: {verdict_str} (Confidence: {conf_pct:.1f}%).",
            pdf_path=str(pdf_path.relative_to(settings.BASE_STORAGE_DIR)),
            verification_hash=seal_hash,
            data_snapshot={
                "verdict": verdict_str,
                "confidence": conf_pct,
                "sync_score": analysis.sync_score,
                "visual_score": analysis.visual_score,
                "audio_score": analysis.audio_score,
            }
        )

        db.add(report)
        db.commit()
        db.refresh(report)

        logger.info(f"[REPORT] Generated PDF report {report_number} seal={seal_hash[:12]}...")
        return report


report_service = ReportService()
