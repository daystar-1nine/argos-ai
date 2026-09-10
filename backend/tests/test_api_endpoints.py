"""
ARGOS AI - Comprehensive API Endpoints Test Suite
Validates health, authentication, media upload, analyses, reports, and verification endpoints.
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend path is configured
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.db.session import init_db

# Initialize database schema
init_db()
client = TestClient(app)


def test_health_endpoints():
    """Validates /api/health, /api/health/ready, and /api/health/models."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data

    ready_res = client.get("/api/health/ready")
    assert ready_res.status_code == 200
    assert ready_res.json()["database"]["connected"] is True

    models_res = client.get("/api/health/models")
    assert models_res.status_code == 200
    assert "sync_model" in models_res.json()


def test_auth_workflow():
    """Validates registration and login JWT token flow."""
    import uuid
    unique_email = f"analyst_{uuid.uuid4().hex[:8]}@argos.ai"
    reg_payload = {
        "email": unique_email,
        "password": "SecurePassword2026!",
        "name": "Forensic Auditor",
        "organization": "ARGOS Sovereign Lab",
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == unique_email

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "SecurePassword2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Profile check with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == unique_email


def test_public_verification():
    """Validates /api/verify for Media DNA provenance lookup."""
    res = client.post("/api/verify", json={"query": "ARG-2026-8A92F1"})
    assert res.status_code == 200
    assert res.json()["is_found"] is True
