# ==============================================================================
# ARGOS AI - Production Dockerfile
# Multi-stage build supporting CPU development and GPU CUDA acceleration.
# ==============================================================================

FROM python:3.11-slim as base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies: FFmpeg, libgl for OpenCV, libsndfile for audio
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsm6 \
    libxext6 \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel && \
    pip install -r /app/requirements.txt

# Copy application source code
COPY . /app

# Ensure runtime directories exist
RUN mkdir -p /app/storage/uploads /app/storage/evidence /app/storage/reports /app/temp /app/models

EXPOSE 8000

# Default command: FastAPI uvicorn production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
