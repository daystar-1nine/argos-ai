"""
ARGOS AI - SQLAlchemy Declarative Base & Model Utilities
Provides common base class, timestamp mixins, and UUID generator.
"""

import uuid
from datetime import datetime
from sqlalchemy import DateTime, Column
from sqlalchemy.orm import DeclarativeBase, declared_attr


def generate_uuid() -> str:
    """Generates standard RFC 4122 UUID4 string."""
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    """Declarative Base for all ARGOS AI database models."""
    
    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Defaults table name to pluralized lowercase class name
        return cls.__name__.lower() + "s"


class TimestampMixin:
    """Mixin adding standardized created_at and updated_at UTC timestamps."""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
