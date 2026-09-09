from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ARGOS AI: Complete Media Protection & Deepfake Forensics Lifecycle Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "brand": "ARGOS AI",
        "tagline": "Protect. Detect. Verify. Respond.",
        "status": "online",
        "system_status": {
            "ai_engine": "ONLINE",
            "provenance": "ONLINE",
            "media_dna": "ONLINE",
            "monitoring": "ONLINE",
            "forensics": "ONLINE"
        },
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": "2026-09-10T00:00:00Z",
        "service": "ARGOS AI Forensics Core"
    }
