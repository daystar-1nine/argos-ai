"""
ARGOS AI - Complete End-to-End Forensic Lifecycle Test
Tests:
Upload -> Stream Inspection -> Media DNA -> Analysis Job -> 11-Stage ML Pipeline ->
Result Verification -> Forensic Evidence -> PDF Report Generation -> Binary Download.
"""

import sys
import uuid
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.db.session import init_db
from app.workers.analysis_tasks import execute_analysis_sync

init_db()
client = TestClient(app)


def test_full_forensic_lifecycle():
    sample_video_path = backend_dir / "static" / "samples" / "test_authentic.mp4"
    assert sample_video_path.exists(), "Sample test video must exist in backend/static/samples"

    # 1. Register Analyst User
    email = f"lead_auditor_{uuid.uuid4().hex[:8]}@argos.ai"
    reg_res = client.post("/api/auth/register", json={
        "email": email,
        "password": "Password2026!",
        "name": "Chief Forensics Officer",
        "organization": "ARGOS Sovereign Lab",
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload Video Media Asset
    with open(sample_video_path, "rb") as f:
        upload_res = client.post(
            "/api/media/upload",
            headers=headers,
            files={"file": ("test_authentic.mp4", f, "video/mp4")},
            data={"title": "Official Test Evidence Subject"}
        )
    assert upload_res.status_code == 201, f"Upload failed: {upload_res.text}"
    upload_data = upload_res.json()
    asset_id = upload_data["asset_id"]
    assert upload_data["status"] == "uploaded"
    assert upload_data["has_video"] is True
    assert upload_data["has_audio"] is True
    assert upload_data["duration"] > 0

    # 3. Retrieve Asset & Verify Media DNA
    asset_res = client.get(f"/api/media/{asset_id}", headers=headers)
    assert asset_res.status_code == 200
    asset_data = asset_res.json()
    assert asset_data["fingerprint"] is not None
    assert len(asset_data["fingerprint"]["sha256_hash"]) == 64

    # 4. Initiate Forensic Analysis Job
    analysis_create_res = client.post(
        "/api/analyses",
        headers=headers,
        json={"asset_id": asset_id}
    )
    assert analysis_create_res.status_code == 202
    analysis_id = analysis_create_res.json()["analysis_id"]

    # 5. Execute Synchronous Worker on Analysis Job
    execute_analysis_sync(analysis_id)

    # 6. Check Analysis Completed Status
    status_res = client.get(f"/api/analyses/{analysis_id}")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "completed"
    assert status_data["progress"] == 100

    # 7. Retrieve Full Forensic Findings
    result_res = client.get(f"/api/analyses/{analysis_id}/result")
    assert result_res.status_code == 200
    result_data = result_res.json()
    assert result_data["verdict"] in ["REAL", "POTENTIALLY_MANIPULATED", "POTENTIALLY MANIPULATED"]
    assert result_data["confidence"] is not None
    assert "visual_score" in result_data
    assert "audio_score" in result_data
    assert "sync_score" in result_data

    # 8. Upgrade User to PRO & Generate Sealed PDF Forensic Report
    from app.db.session import SessionLocal
    from app.db.models.subscription import Subscription
    from datetime import datetime, timezone, timedelta
    db = SessionLocal()
    sub = db.query(Subscription).filter(Subscription.user_id == reg_res.json()["user"]["id"]).first()
    if sub:
        sub.plan_id = "pro"
        sub.status = "active"
        sub.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        db.commit()
    db.close()

    report_create_res = client.post(
        f"/api/reports/{analysis_id}",
        headers=headers
    )
    assert report_create_res.status_code == 201, f"Report failed: {report_create_res.text}"
    report_data = report_create_res.json()
    report_id = report_data["id"]
    assert len(report_data["verification_hash"]) == 64

    # 9. Download Generated PDF Report & Check Magic Bytes
    download_res = client.get(f"/api/reports/{report_id}/download")
    assert download_res.status_code == 200
    assert download_res.content.startswith(b"%PDF"), "Report file must be a valid PDF format"
    print(f"\n[E2E TEST PASSED] Asset: {asset_id}, Analysis: {analysis_id}, Report: {report_data['report_number']}")


if __name__ == "__main__":
    test_full_forensic_lifecycle()
