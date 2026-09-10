"""
ARGOS AI - Monitoring Source & Sensor Telemetry Database Model
"""

from sqlalchemy import Column, String, Integer, DateTime
from app.db.base import Base, TimestampMixin, generate_uuid


class MonitoringSource(Base, TimestampMixin):
    """Represents a supported public, indexed, or integrated crawl pipeline."""
    __tablename__ = "monitoring_sources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_name = Column(String(128), nullable=False)
    source_type = Column(String(64), default="public_indexed")  # public_indexed, integrated_api, web_crawler
    region = Column(String(64), default="Global")
    status = Column(String(32), default="online")  # online, syncing, degraded
    items_monitored_hourly = Column(Integer, default=1250)
    last_sync_at = Column(DateTime, nullable=False)
