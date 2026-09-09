from fastapi import APIRouter
from .authenticity import router as authenticity_router
from .dna import router as dna_router
from .forensics import router as forensics_router
from .attack_lab import router as attack_lab_router
from .monitoring import router as monitoring_router
from .takedown import router as takedown_router
from .verify import router as verify_router
from .reports import router as reports_router

api_router = APIRouter()
api_router.include_router(authenticity_router)
api_router.include_router(dna_router)
api_router.include_router(forensics_router)
api_router.include_router(attack_lab_router)
api_router.include_router(monitoring_router)
api_router.include_router(takedown_router)
api_router.include_router(verify_router)
api_router.include_router(reports_router)
