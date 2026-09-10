"""
ARGOS AI - Master API Router
Aggregates all route modules under both /api and /api/v1 prefixes.
"""

from fastapi import APIRouter

# New Production API Routes
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.media import router as media_router
from app.api.routes.analyses import router as analyses_router
from app.api.routes.reports import router as reports_router
from app.api.routes.detections import router as detections_router
from app.api.routes.monitoring import router as monitoring_router
from app.api.routes.verification import router as verification_router

# Existing Application Routers
from app.api.v1.authenticity import router as authenticity_router
from app.api.v1.dna import router as dna_router
from app.api.v1.forensics import router as forensics_router
from app.api.v1.attack_lab import router as attack_lab_router
from app.api.v1.takedown import router as takedown_router
from app.api.v1.analyze import router as legacy_analyze_router

api_router = APIRouter()

# Core Production Routes
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(media_router)
api_router.include_router(analyses_router)
api_router.include_router(reports_router)
api_router.include_router(detections_router)
api_router.include_router(monitoring_router)
api_router.include_router(verification_router)

# Compatibility Routers
api_router.include_router(authenticity_router)
api_router.include_router(dna_router)
api_router.include_router(forensics_router)
api_router.include_router(attack_lab_router)
api_router.include_router(takedown_router)
api_router.include_router(legacy_analyze_router)
