"""
ARGOS AI - Structured Forensic Logging System
Provides unified format with correlation identifiers (analysis_id, asset_id, user_id).
"""

import sys
import logging
from typing import Optional


class ArgosFormatter(logging.Formatter):
    """Custom log formatter supporting ANSI color codes and structured tag metadata."""

    GREY = "\x1b[38;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    CYAN = "\x1b[36;20m"
    RESET = "\x1b[0m"

    FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"

    def format(self, record):
        log_fmt = self.FORMAT
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


def setup_logger(name: str = "argos_ai", level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(level)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(ArgosFormatter())
        logger.addHandler(handler)
        logger.propagate = False
    return logger


logger = setup_logger("argos")


def log_analysis_event(
    analysis_id: str,
    stage: str,
    status: str,
    details: Optional[str] = None,
    asset_id: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Logs structured lifecycle event for ML analysis jobs."""
    msg = f"[ANALYSIS] analysis_id={analysis_id} stage={stage} status={status}"
    if asset_id:
        msg += f" asset_id={asset_id}"
    if user_id:
        msg += f" user_id={user_id}"
    if details:
        msg += f" details={details}"
    logger.info(msg)
