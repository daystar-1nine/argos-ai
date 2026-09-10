"""
ARGOS AI - Database Engine, Session Factory & Lifecycle Management
Supports PostgreSQL with transparent SQLite fallback for resilient local development.
"""

from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger
from app.db.base import Base
# Ensure all models are imported so metadata is populated
import app.db.models  # noqa: F401

engine = None
SessionLocal = None
ACTIVE_DB_URL = None


def create_database_engine():
    """Attempts to connect to PostgreSQL; falls back to SQLite for local development."""
    global engine, SessionLocal, ACTIVE_DB_URL

    pg_url = settings.DATABASE_URL
    sqlite_url = settings.SQLITE_FALLBACK_URL

    try:
        # Test PostgreSQL connection with a short timeout
        test_engine = create_engine(pg_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine = test_engine
        ACTIVE_DB_URL = pg_url
        logger.info("[DATABASE] Successfully connected to PostgreSQL instance.")
    except Exception as exc:
        logger.warning(
            f"[DATABASE] PostgreSQL unreachable ({exc}). Falling back to local SQLite development database: {sqlite_url}"
        )
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        ACTIVE_DB_URL = sqlite_url

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine


# Initialize engine on import
create_database_engine()


def init_db():
    """Initializes schema tables if not yet created."""
    global engine
    if engine is None:
        create_database_engine()
    Base.metadata.create_all(bind=engine)
    logger.info("[DATABASE] Database schema verified & initialized.")


def get_db() -> Generator[Session, None, None]:
    """FastAPI Dependency for database sessions."""
    global SessionLocal
    if SessionLocal is None:
        create_database_engine()
    
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
