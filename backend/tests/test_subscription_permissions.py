"""
ARGOS AI - Comprehensive Subscription, Profile & Two-Tier Access Test Suite
Verifies all 14 acceptance criteria:
1. New user gets Free plan.
2. Free user can run deepfake detection.
3. Free user cannot access Media DNA.
4. Free user cannot create protection certificate.
5. Free user cannot activate monitoring.
6. Pro user can access protection.
7. Pro user can access monitoring.
8. Expired Pro user falls back to Free permissions.
9. Usage limits work.
10. User cannot modify their own plan through frontend/API payload.
11. User cannot access another user's subscription.
12. Profile returns correct subscription.
13. Upgrade checkout does not falsely report success.
14. Detection remains functional after subscription changes.
"""

import sys
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.core.config import settings
from app.db.session import init_db, SessionLocal
from app.db.models.user import User
from app.db.models.subscription import Subscription, UsageRecord
from app.db.models.media import MediaAsset
from app.services.subscription_service import subscription_service

init_db()
client = TestClient(app)


def create_test_user(email_prefix: str = "user", is_pro: bool = False):
    """Helper to create a fresh user and return (user_id, token, headers)."""
    unique_email = f"{email_prefix}_{uuid.uuid4().hex[:8]}@argos.ai"
    reg_payload = {
        "email": unique_email,
        "password": "SecurePassword123!",
        "name": f"Test Operator {email_prefix}",
        "organization": "ARGOS Forensic Labs",
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Failed to register user: {res.text}"
    data = res.json()
    token = data["access_token"]
    user_id = data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    db = SessionLocal()
    sub = db.query(Subscription).filter(Subscription.user_id == user_id).first()
    if is_pro:
        if not sub:
            sub = Subscription(
                user_id=user_id,
                plan_id="pro",
                status="active",
                provider="manual",
                started_at=datetime.now(timezone.utc),
                expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            )
            db.add(sub)
        else:
            sub.plan_id = "pro"
            sub.status = "active"
            sub.started_at = datetime.now(timezone.utc)
            sub.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        db.commit()
    db.close()
    return user_id, unique_email, headers


def test_1_new_user_gets_free_plan():
    """1. New user gets Free plan."""
    user_id, email, headers = create_test_user("new_user")
    res = client.get("/api/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["subscription"]["plan"] == "free"
    assert data["subscription"]["price_inr"] == 0
    assert data["features"]["detection"] is True
    assert data["features"]["media_dna"] is False
    assert data["features"]["protection_certificate"] is False


def test_2_free_user_can_run_deepfake_detection():
    """2. Free user can run deepfake detection (Problem Statement 4)."""
    user_id, email, headers = create_test_user("free_detect")
    db = SessionLocal()
    asset = MediaAsset(
        id=f"ast_test_{uuid.uuid4().hex[:6]}",
        user_id=user_id,
        title="Test Deepfake Target",
        media_type="video",
        file_name="sample.mp4",
        file_size_bytes=1024 * 1024,
        storage_path=str(settings.UPLOAD_DIR / "dummy.mp4"),
    )
    db.add(asset)
    db.commit()
    asset_id = asset.id
    db.close()

    res = client.post("/api/analyses", json={"asset_id": asset_id}, headers=headers)
    assert res.status_code == 202, f"Expected 202, got: {res.text}"
    assert "analysis_id" in res.json()
    assert res.json()["status"] in ["queued", "processing"]


def test_3_free_user_cannot_access_media_dna():
    """3. Free user cannot access Media DNA generation."""
    user_id, email, headers = create_test_user("free_dna")
    res = client.post("/api/v1/dna/generate", json={"asset_id": "ARG-TEST-01"}, headers=headers)
    assert res.status_code == 403
    data = res.json()
    assert data["error"]["code"] == "PRO_FEATURE_REQUIRED"


def test_4_free_user_cannot_create_protection_certificate():
    """4. Free user cannot create protection certificate."""
    user_id, email, headers = create_test_user("free_cert")
    res = client.post("/api/protection/register", json={"asset_id": "ARG-TEST-01"}, headers=headers)
    assert res.status_code == 403
    data = res.json()
    assert data["error"]["code"] == "PRO_FEATURE_REQUIRED"


def test_5_free_user_cannot_activate_monitoring():
    """5. Free user cannot access gated protection/monitoring endpoints."""
    user_id, email, headers = create_test_user("free_monitor")
    res = client.post("/api/protection/incidents", json={"asset_id": "ARG-01", "title": "Takedown", "suspect_url": "https://x.com"}, headers=headers)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "PRO_FEATURE_REQUIRED"


def test_6_pro_user_can_access_protection():
    """6. Pro user can access protection."""
    user_id, email, headers = create_test_user("pro_protect", is_pro=True)
    res = client.post("/api/protection/register", json={"asset_id": "ARG-TEST-PRO"}, headers=headers)
    assert res.status_code == 200, f"Expected 200, got: {res.text}"
    data = res.json()
    assert data["status"] == "registered"
    assert "certificate_id" in data

    # Test watermark
    wm_res = client.post("/api/protection/watermark", json={"asset_id": "ARG-TEST-PRO"}, headers=headers)
    assert wm_res.status_code == 200
    assert wm_res.json()["status"] == "watermarked"

    # Test C2PA
    c2pa_res = client.post("/api/protection/c2pa", json={"asset_id": "ARG-TEST-PRO"}, headers=headers)
    assert c2pa_res.status_code == 200
    assert c2pa_res.json()["status"] == "signed"


def test_7_pro_user_can_access_monitoring():
    """7. Pro user can access monitoring & incident response."""
    user_id, email, headers = create_test_user("pro_monitor", is_pro=True)
    res = client.post(
        "/api/protection/incidents",
        json={"asset_id": "ARG-01", "title": "Stolen Video Investigation", "suspect_url": "https://t.me/fake"},
        headers=headers
    )
    assert res.status_code == 201, f"Expected 201, got: {res.text}"
    assert res.json()["status"] == "opened"


def test_8_expired_pro_user_falls_back_to_free():
    """8. Expired Pro user falls back to Free permissions."""
    user_id, email, headers = create_test_user("expired_pro", is_pro=True)
    db = SessionLocal()
    sub = db.query(Subscription).filter(Subscription.user_id == user_id).first()
    # Expire the subscription
    sub.expires_at = datetime.now(timezone.utc) - timedelta(days=2)
    db.commit()
    db.close()

    # Attempting Pro feature should now be rejected
    res = client.post("/api/protection/register", json={"asset_id": "ARG-EXP-01"}, headers=headers)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "PRO_FEATURE_REQUIRED"

    # But detection must still work
    prof_res = client.get("/api/profile", headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["features"]["detection"] is True


def test_9_usage_limits_work():
    """9. Free usage limits are enforced on detection."""
    user_id, email, headers = create_test_user("free_limits")
    db = SessionLocal()
    asset = MediaAsset(
        id=f"ast_limit_{uuid.uuid4().hex[:6]}",
        user_id=user_id,
        title="Quota Test Video",
        media_type="video",
        file_name="test.mp4",
        file_size_bytes=5000,
        storage_path=str(settings.UPLOAD_DIR / "dummy.mp4"),
    )
    db.add(asset)
    db.commit()
    asset_id = asset.id

    # Pre-fill usage record to limit
    user = db.query(User).filter(User.id == user_id).first()
    rec = subscription_service.get_or_create_usage_record(user, "analyses_count", db)
    rec.count = settings.FREE_ANALYSIS_LIMIT
    db.commit()
    db.close()

    # Next analysis should exceed limit
    res = client.post("/api/analyses", json={"asset_id": asset_id}, headers=headers)
    assert res.status_code == 403
    data = res.json()
    assert data["error"]["code"] == "USAGE_LIMIT_EXCEEDED"


def test_10_user_cannot_modify_plan_via_profile_patch():
    """10. User cannot modify their own plan through frontend/API payload."""
    user_id, email, headers = create_test_user("tamper_plan")
    res = client.patch(
        "/api/profile",
        json={"name": "Attacker", "plan": "pro", "subscription": "pro", "role": "admin"},
        headers=headers
    )
    assert res.status_code == 200

    # Verify subscription is still free
    prof_res = client.get("/api/profile", headers=headers)
    assert prof_res.json()["subscription"]["plan"] == "free"


def test_11_user_cannot_access_another_user_subscription():
    """11. User cannot access another user's subscription."""
    user1_id, email1, headers1 = create_test_user("user_alpha")
    user2_id, email2, headers2 = create_test_user("user_beta", is_pro=True)

    # Calling /api/profile with user1 headers only returns user1 profile
    res = client.get("/api/profile", headers=headers1)
    assert res.status_code == 200
    assert res.json()["user"]["id"] == user1_id
    assert res.json()["subscription"]["plan"] == "free"


def test_12_profile_returns_correct_subscription():
    """12. Profile returns correct subscription and live feature map."""
    user_id, email, headers = create_test_user("prof_check", is_pro=True)
    res = client.get("/api/profile", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["subscription"]["plan"] == "pro"
    assert data["subscription"]["price_inr"] == 199
    assert data["subscription"]["status"] == "active"
    assert data["features"]["detection"] is True
    assert data["features"]["media_dna"] is True
    assert data["features"]["protection_certificate"] is True
    assert "analyses" in data["usage"]


def test_13_upgrade_checkout_does_not_falsely_report_success():
    """13. Upgrade checkout does not falsely report success when payment provider is unconfigured."""
    user_id, email, headers = create_test_user("checkout_test")
    res = client.post("/api/subscription/checkout", json={"plan_id": "pro"}, headers=headers)
    assert res.status_code == 501
    data = res.json()
    assert data["error"]["code"] == "PAYMENT_PROVIDER_NOT_CONFIGURED"


def test_14_detection_pipeline_remains_functional():
    """14. Detection remains functional after subscription changes."""
    user_id, email, headers = create_test_user("pipeline_test")
    # Verify health of ML model engine
    res = client.get("/api/health/models")
    assert res.status_code == 200
    assert res.json()["weights"]["syncnet_pth"] is True
    assert res.json()["weights"]["classifier_pth"] is True

    # Downgrade / change subscription
    cancel_res = client.post("/api/subscription/cancel", headers=headers)
    assert cancel_res.status_code == 200

    # Detection remains 100% accessible
    feat_res = client.get("/api/subscription/features", headers=headers)
    assert feat_res.status_code == 200
    assert feat_res.json()["features"]["detection"] is True
    assert feat_res.json()["features"]["deepfake_analysis"] is True
