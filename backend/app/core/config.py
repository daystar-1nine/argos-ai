import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "ARGOS AI Forensic & Media Protection Engine"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "argos-sovereign-dev-secret-2026-c2pa")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*"
    ]

settings = Settings()
