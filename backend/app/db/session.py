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
    """Initializes schema tables if not yet created and seeds default plans."""
    global engine, SessionLocal
    if engine is None:
        create_database_engine()
    Base.metadata.create_all(bind=engine)
    logger.info("[DATABASE] Database schema verified & initialized.")

    # Seed default plans
    from app.db.models.subscription import Plan, Subscription, NotificationPreference
    from app.db.models.user import User

    db = SessionLocal()
    try:
        free_plan = db.query(Plan).filter(Plan.id == "free").first()
        if not free_plan:
            free_plan = Plan(
                id="free",
                name="ARGOS FREE",
                price_inr=0,
                billing_period=None,
                is_active=True
            )
            db.add(free_plan)

        pro_plan = db.query(Plan).filter(Plan.id == "pro").first()
        if not pro_plan:
            pro_plan = Plan(
                id="pro",
                name="ARGOS PRO",
                price_inr=199,
                billing_period="monthly",
                is_active=True
            )
            db.add(pro_plan)
        db.commit()

        # Ensure demo/existing users have subscriptions and notification preferences
        users_without_sub = db.query(User).filter(~User.subscription.has()).all()
        for u in users_without_sub:
            # Demo analyst gets PRO for comprehensive demonstration, others get FREE
            initial_plan = "pro" if u.email == "analyst@argos.ai" else "free"
            sub = Subscription(
                user_id=u.id,
                plan_id=initial_plan,
                status="active",
                provider="manual"
            )
            db.add(sub)

        users_without_pref = db.query(User).filter(~User.notification_preference.has()).all()
        for u in users_without_pref:
            pref = NotificationPreference(
                user_id=u.id,
                email_alerts=True,
                push_alerts=False,
                detection_alerts=True,
                incident_alerts=True
            )
            db.add(pref)

        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"[DATABASE] Plan/user seed note: {e}")
    finally:
        db.close()


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
