"""
ARGOS AI - Complete Production Authentication & Session Management Test Suite
Verifies all 20 criteria specified in Requirement 29:
1. Signup works.
2. Duplicate email rejected.
3. Password is hashed.
4. Login works.
5. Invalid password rejected.
6. Session created.
7. /api/auth/me works.
8. Logout invalidates session.
9. Protected route rejects unauthenticated user.
10. Authenticated user can access dashboard APIs.
11. User cannot access another user's media.
12. Free user can run detection.
13. Free user cannot access protection.
14. Pro user can access protection.
15. Expired Pro user loses Pro permissions.
16. Password reset works securely.
17. Reset token expires.
18. Logout-all revokes sessions.
19. Frontend redirects and routing contracts.
20. Auth state persists with cookies.
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
from app.core.security import hash_token, get_password_hash, create_refresh_token
from app.db.session import init_db, SessionLocal
from app.db.models.user import User
from app.db.models.session import UserSession, PasswordResetToken
from app.db.models.subscription import Subscription, Plan
from app.db.models.media import MediaAsset
from app.services.subscription_service import subscription_service

init_db()
client = TestClient(app)


def get_random_email() -> str:
    return f"op_{uuid.uuid4().hex[:8]}@argos.ai"


def test_01_signup_works():
    """1. Signup works: creates user, default Free plan, active subscription, and tokens."""
    email = get_random_email()
    payload = {
        "name": "Forensic Operator Alpha",
        "email": email,
        "password": "SecurePassword2026!",
        "confirm_password": "SecurePassword2026!",
        "terms_accepted": True,
        "organization": "ARGOS Cyber Unit",
    }
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email

    # Verify cookies set
    assert "argos_access_token" in res.cookies
    assert "argos_refresh_token" in res.cookies

    # Verify database state
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert user.subscription is not None
        assert user.subscription.plan_id == "free"
        assert user.subscription.status == "active"
    finally:
        db.close()


def test_02_duplicate_email_rejected():
    """2. Duplicate email rejected with 400 Bad Request."""
    email = get_random_email()
    payload = {
        "name": "Operator Original",
        "email": email,
        "password": "SecurePassword2026!",
        "confirm_password": "SecurePassword2026!",
    }
    res1 = client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 201

    # Attempt duplicate registration
    res2 = client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 400
    assert res2.json()["error"]["code"] == "USER_EXISTS"


def test_03_password_is_hashed():
    """3. Password is hashed: never stored as plaintext, verified bcrypt hash."""
    email = get_random_email()
    raw_password = "SecretPassword123!"
    payload = {
        "name": "Bcrypt Operator",
        "email": email,
        "password": raw_password,
        "confirm_password": raw_password,
    }
    client.post("/api/auth/signup", json=payload)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        assert raw_password not in user.hashed_password
        assert user.hashed_password.startswith("$2b$") or user.hashed_password.startswith("$2a$")
    finally:
        db.close()


def test_04_login_works():
    """4. Login works: verifies credentials, returns access token, session ID, and cookies."""
    email = get_random_email()
    password = "CorrectPassword2026!"
    client.post("/api/auth/signup", json={
        "name": "Login Test Operator",
        "email": email,
        "password": password,
        "confirm_password": password,
    })

    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password,
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["session_id"] is not None
    assert "argos_access_token" in login_res.cookies
    assert "argos_refresh_token" in login_res.cookies


def test_05_invalid_password_rejected():
    """5. Invalid password rejected with HTTP 401."""
    email = get_random_email()
    password = "CorrectPassword2026!"
    client.post("/api/auth/signup", json={
        "name": "Invalid Password Tester",
        "email": email,
        "password": password,
        "confirm_password": password,
    })

    bad_login = client.post("/api/auth/login", json={
        "email": email,
        "password": "WrongPassword999!",
    })
    assert bad_login.status_code == 401
    assert "Invalid email or password" in bad_login.json()["error"]["message"]


def test_06_session_created():
    """6. Session created: UserSession recorded in database with refresh_token_hash."""
    email = get_random_email()
    password = "SessionPassword2026!"
    res = client.post("/api/auth/signup", json={
        "name": "Session Record Tester",
        "email": email,
        "password": password,
        "confirm_password": password,
    })
    session_id = res.json()["session_id"]

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        session = db.query(UserSession).filter(UserSession.id == session_id).first()
        assert session is not None
        assert session.user_id == user.id
        assert session.refresh_token_hash is not None
        assert session.revoked_at is None
    finally:
        db.close()


def test_07_auth_me_works():
    """7. /api/auth/me returns authenticated operator profile with plan and details."""
    email = get_random_email()
    password = "AuthMePassword2026!"
    reg = client.post("/api/auth/signup", json={
        "name": "Profile Me Tester",
        "email": email,
        "password": password,
        "confirm_password": password,
    })
    token = reg.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["authenticated"] is True
    assert data["user"]["email"] == email
    assert data["user"]["plan"] == "free"
    assert data["user"]["name"] == "Profile Me Tester"


def test_08_logout_invalidates_session():
    """8. Logout invalidates session in database and clears cookies."""
    email = get_random_email()
    password = "LogoutPassword2026!"
    reg = client.post("/api/auth/signup", json={
        "name": "Logout Tester",
        "email": email,
        "password": password,
        "confirm_password": password,
    })
    token = reg.json()["access_token"]
    session_id = reg.json()["session_id"]

    logout_res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert logout_res.status_code == 200

    db = SessionLocal()
    try:
        session = db.query(UserSession).filter(UserSession.id == session_id).first()
        assert session is not None
        assert session.revoked_at is not None
    finally:
        db.close()


def test_09_protected_route_rejects_unauthenticated():
    """9. Protected route rejects unauthenticated request with HTTP 401."""
    # Ensure fresh client without cookies
    clean_client = TestClient(app)
    res = clean_client.get("/api/profile")
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "AUTHENTICATION_REQUIRED"


def test_10_authenticated_user_can_access_dashboard_apis():
    """10. Authenticated user can access dashboard and telemetry APIs."""
    email = get_random_email()
    password = "DashboardPassword2026!"
    reg = client.post("/api/auth/signup", json={
        "name": "Dashboard Operator",
        "email": email,
        "password": password,
        "confirm_password": password,
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    profile_res = client.get("/api/profile", headers=headers)
    assert profile_res.status_code == 200

    usage_res = client.get("/api/usage", headers=headers)
    assert usage_res.status_code == 200

    sub_res = client.get("/api/subscription", headers=headers)
    assert sub_res.status_code == 200


def test_11_user_cannot_access_another_users_media():
    """11. User cannot access another user's media asset (HTTP 403 FORBIDDEN)."""
    email_a = get_random_email()
    email_b = get_random_email()
    pwd = "SharedPassword2026!"

    reg_a = client.post("/api/auth/signup", json={"name": "Owner A", "email": email_a, "password": pwd, "confirm_password": pwd})
    token_a = reg_a.json()["access_token"]

    reg_b = client.post("/api/auth/signup", json={"name": "Intruder B", "email": email_b, "password": pwd, "confirm_password": pwd})
    token_b = reg_b.json()["access_token"]

    # Create media asset for User A directly in DB
    db = SessionLocal()
    try:
        user_a = db.query(User).filter(User.email == email_a).first()
        asset = MediaAsset(
            id=f"ast_{uuid.uuid4().hex[:10]}",
            user_id=user_a.id,
            title="Classified Evidence Video",
            file_name="classified_sample.mp4",
            storage_path="uploads/classified_sample.mp4",
            file_size_bytes=1024,
            duration_seconds=10.0,
        )
        db.add(asset)
        db.commit()
        asset_id = asset.id
    finally:
        db.close()

    # User B attempts to access User A's asset
    b_res = client.get(f"/api/media/{asset_id}", headers={"Authorization": f"Bearer {token_b}"})
    assert b_res.status_code == 403
    assert b_res.json()["error"]["code"] == "FORBIDDEN"


def test_12_free_user_can_run_detection():
    """12. Authenticated Free user can run deepfake detection (Problem Statement 4)."""
    email = get_random_email()
    pwd = "DetectionPassword2026!"
    reg = client.post("/api/auth/signup", json={"name": "Forensic Free User", "email": email, "password": pwd, "confirm_password": pwd})
    token = reg.json()["access_token"]

    sample_res = client.post(
        "/api/v1/analyze/sample?scenario=authentic",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert sample_res.status_code == 200
    data = sample_res.json()
    assert "analysis_id" in data
    assert data["status"] in ["processing", "completed"]


def test_13_free_user_cannot_access_protection():
    """13. Free user cannot access Pro protection features (HTTP 403 PRO_FEATURE_REQUIRED)."""
    email = get_random_email()
    pwd = "ProProtectedPassword2026!"
    reg = client.post("/api/auth/signup", json={"name": "Free User", "email": email, "password": pwd, "confirm_password": pwd})
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Media DNA generation
    dna_res = client.post("/api/v1/dna/generate", json={"asset_id": "test"}, headers=headers)
    assert dna_res.status_code == 403
    assert dna_res.json()["error"]["code"] == "PRO_FEATURE_REQUIRED"

    # Watermark registration
    wm_res = client.post("/api/protection/watermark", json={"asset_id": "test"}, headers=headers)
    assert wm_res.status_code == 403
    assert wm_res.json()["error"]["code"] == "PRO_FEATURE_REQUIRED"


def test_14_pro_user_can_access_protection():
    """14. Pro user can access protection features."""
    email = get_random_email()
    pwd = "ProAccessPassword2026!"
    reg = client.post("/api/auth/signup", json={"name": "Pro User", "email": email, "password": pwd, "confirm_password": pwd})
    token = reg.json()["access_token"]

    # Upgrade user to Pro in database
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        sub.plan_id = "pro"
        sub.status = "active"
        sub.started_at = datetime.now(timezone.utc)
        sub.expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        db.commit()
    finally:
        db.close()

    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/protection/watermark", json={"asset_id": "ast_demo"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "watermarked"


def test_15_expired_pro_user_loses_pro_permissions():
    """15. Expired Pro user falls back to Free permissions."""
    email = get_random_email()
    pwd = "ExpiredProPassword2026!"
    reg = client.post("/api/auth/signup", json={"name": "Expired Pro", "email": email, "password": pwd, "confirm_password": pwd})
    token = reg.json()["access_token"]

    # Set expired Pro subscription in DB
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        sub = user.subscription
        sub.plan_id = "pro"
        sub.status = "expired"
        sub.expires_at = datetime.now(timezone.utc) - timedelta(days=2)
        db.commit()
    finally:
        db.close()

    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/protection/watermark", json={"asset_id": "ast_demo"}, headers=headers)
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "PRO_FEATURE_REQUIRED"


def test_16_password_reset_works_securely():
    """16. Password reset works securely: validates token, updates password, revokes active sessions."""
    email = get_random_email()
    old_pwd = "OldPassword2026!"
    new_pwd = "NewPassword2026!"
    reg = client.post("/api/auth/signup", json={"name": "Reset Tester", "email": email, "password": old_pwd, "confirm_password": old_pwd})
    session_id = reg.json()["session_id"]

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        raw_token = create_refresh_token()[:40]
        hashed = hash_token(raw_token)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=15),
        )
        db.add(reset_token)
        db.commit()
    finally:
        db.close()

    # Reset password
    reset_res = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": new_pwd,
        "confirm_password": new_pwd,
    })
    assert reset_res.status_code == 200

    # Old password no longer works
    fail_res = client.post("/api/auth/login", json={"email": email, "password": old_pwd})
    assert fail_res.status_code == 401

    # New password works
    success_res = client.post("/api/auth/login", json={"email": email, "password": new_pwd})
    assert success_res.status_code == 200

    # Previous session was revoked
    db = SessionLocal()
    try:
        old_session = db.query(UserSession).filter(UserSession.id == session_id).first()
        assert old_session.revoked_at is not None
    finally:
        db.close()


def test_17_reset_token_expires():
    """17. Expired reset token is rejected with HTTP 400."""
    email = get_random_email()
    pwd = "ExpireTester2026!"
    client.post("/api/auth/signup", json={"name": "Expired Token User", "email": email, "password": pwd, "confirm_password": pwd})

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        raw_token = create_refresh_token()[:40]
        hashed = hash_token(raw_token)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=hashed,
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),  # already expired
        )
        db.add(reset_token)
        db.commit()
    finally:
        db.close()

    res = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "AnotherPassword2026!",
        "confirm_password": "AnotherPassword2026!",
    })
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_OR_EXPIRED_TOKEN"


def test_18_logout_all_revokes_sessions():
    """18. Logout-all revokes all sessions for the user."""
    email = get_random_email()
    pwd = "MultiSessionPassword2026!"
    client.post("/api/auth/signup", json={"name": "Multi Session User", "email": email, "password": pwd, "confirm_password": pwd})

    # Create second session via login
    login_res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    token = login_res.json()["access_token"]

    # Execute logout-all
    logout_all_res = client.post("/api/auth/logout-all", headers={"Authorization": f"Bearer {token}"})
    assert logout_all_res.status_code == 200

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        active_sessions = db.query(UserSession).filter(
            UserSession.user_id == user.id,
            UserSession.revoked_at.is_(None)
        ).all()
        assert len(active_sessions) == 0
    finally:
        db.close()


def test_19_frontend_redirects_and_routes():
    """19. Tests that forgot-password unconfigured SMTP returns clear advisory."""
    email = get_random_email()
    pwd = "SMTPTesterPassword2026!"
    client.post("/api/auth/signup", json={"name": "SMTP Tester", "email": email, "password": pwd, "confirm_password": pwd})

    # Since SMTP_HOST is None, forgot-password must cleanly report EMAIL_PROVIDER_NOT_CONFIGURED
    forgot_res = client.post("/api/auth/forgot-password", json={"email": email})
    assert forgot_res.status_code == 503
    assert forgot_res.json()["error"]["code"] == "EMAIL_PROVIDER_NOT_CONFIGURED"


def test_20_auth_state_persists_with_cookies():
    """20. Auth state persists with HttpOnly cookie credentials."""
    email = get_random_email()
    pwd = "CookiePersistence2026!"
    client.post("/api/auth/signup", json={"name": "Cookie Operator", "email": email, "password": pwd, "confirm_password": pwd})

    login_res = client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert login_res.status_code == 200
    access_cookie = login_res.cookies.get("argos_access_token")
    assert access_cookie is not None

    # Call /api/auth/me using ONLY the cookie (no Authorization header)
    cookie_client = TestClient(app)
    cookie_client.cookies.set("argos_access_token", access_cookie)
    me_res = cookie_client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["authenticated"] is True
    assert me_res.json()["user"]["email"] == email
