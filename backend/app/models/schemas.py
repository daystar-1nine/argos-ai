from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# ----------------------------------------------------
# Enums
# ----------------------------------------------------

class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"

class AuthenticityVerdict(str, Enum):
    LIKELY_AUTHENTIC = "Likely authentic"
    POTENTIALLY_SYNTHETIC = "Potentially synthetic"
    INSUFFICIENT_EVIDENCE = "Insufficient evidence"

class ProtectionStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REVOKED = "revoked"

class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    NOTICE_SENT = "notice_sent"
    RESOLVED = "resolved"
    CLOSED = "closed"

class AttackType(str, Enum):
    FACE_SWAP = "face_swap"
    LIP_SYNC = "lip_sync"
    AUDIO_REPLACEMENT = "audio_replacement"
    AI_REGENERATION = "ai_regeneration"
    CROP = "crop"
    RESIZE = "resize"
    COMPRESSION = "compression"


# ----------------------------------------------------
# 13 Core Database & Domain Entities
# ----------------------------------------------------

class User(BaseModel):
    id: str
    email: str
    name: str
    organization: Optional[str] = "Independent Creator"
    role: str = "creator"  # creator, enterprise, forensic_analyst, admin
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active_monitors_count: int = 0
    protected_assets_count: int = 0


class MediaAsset(BaseModel):
    id: str  # e.g. ARG-2026-8A92F1
    user_id: str
    title: str
    media_type: MediaType
    file_name: str
    file_size_bytes: int
    duration_seconds: Optional[float] = None
    resolution: Optional[str] = None
    fps: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_protected: bool = True
    storage_uri: Optional[str] = None
    thumbnail_uri: Optional[str] = None


class MediaDNA(BaseModel):
    id: str
    asset_id: str
    sha256_hash: str
    phash: str  # Perceptual hash
    visual_dna_signature: str
    audio_dna_signature: Optional[str] = None
    temporal_dna_signature: Optional[str] = None
    feature_vector_sample: List[float] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    entropy_score: float = 0.94


class ProtectionRecord(BaseModel):
    id: str
    asset_id: str
    watermark_key_id: str
    watermark_applied: bool = True
    watermark_strength: float = 0.85
    dna_registered: bool = True
    cryptographic_seal: str
    status: ProtectionStatus = ProtectionStatus.ACTIVE
    protected_at: datetime = Field(default_factory=datetime.utcnow)


class ProvenanceRecord(BaseModel):
    id: str
    asset_id: str
    c2pa_manifest_id: str
    signing_authority: str = "ARGOS Sovereign Provenance CA 2026"
    claim_generator: str = "ARGOS Media Defender / C2PA v2.1"
    issuer_did: str = "did:argos:sig-7b2f901a"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_valid: bool = True
    assertions: List[Dict[str, Any]] = Field(default_factory=list)


class MonitoringSource(BaseModel):
    id: str
    source_name: str  # e.g. "Public Video Index Alpha", "Reddit /r/all Feed", "X Public Stream", "YouTube Search Index"
    source_type: str  # public_indexed, integrated_api, web_crawler
    region: str       # USA, UK, India, Singapore, Australia, Global
    status: str       # online, syncing, degraded
    items_monitored_hourly: int
    last_sync_at: datetime = Field(default_factory=datetime.utcnow)


class DetectedMatch(BaseModel):
    id: str
    asset_id: str
    source_id: str
    source_name: str
    source_url: str
    platform: str
    match_percentage: float  # e.g. 94.2
    detected_manipulation: str  # "Face swap + lip-sync anomaly", "Modified/re-encoded", "Audio clone"
    risk_level: AlertSeverity = AlertSeverity.HIGH
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "unreviewed"  # unreviewed, confirmed_tampered, benign_copy, escalated


class ForensicAnalysis(BaseModel):
    id: str
    asset_id: str
    suspect_media_id: Optional[str] = None
    overall_manipulation_risk: float  # 0 to 100
    verdict: str  # "HIGH RISK", "SUSPICIOUS", "LIKELY AUTHENTIC"
    lip_sync_anomaly: float  # 0 to 100
    visual_anomaly: float
    audio_anomaly: float
    temporal_anomaly: float
    model_agreement: str  # e.g. "4 / 4 models"
    temporal_mismatch_ms: int  # e.g. +320ms
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    timeline_segments: List[Dict[str, Any]] = Field(default_factory=list)
    explanation: str
    evidence_frames: List[Dict[str, Any]] = Field(default_factory=list)


class Alert(BaseModel):
    id: str
    asset_id: str
    match_id: Optional[str] = None
    title: str
    message: str
    severity: AlertSeverity = AlertSeverity.HIGH
    is_read: bool = False
    source_label: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    action_required: bool = True


class Incident(BaseModel):
    id: str  # e.g. ARG-8291
    asset_id: str
    title: str
    status: IncidentStatus = IncidentStatus.OPEN
    platform_target: str
    suspect_url: str
    takedown_type: str  # "DMCA 512(c)", "EU DSA Notice", "Platform Integrity Dispute"
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None


class Evidence(BaseModel):
    id: str
    incident_id: str
    asset_id: str
    evidence_type: str  # "frame_comparison", "audio_waveform", "syncnet_graph", "provenance_manifest"
    description: str
    file_uri: str
    sha256_hash: str
    timestamp_mark: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Report(BaseModel):
    id: str
    report_number: str  # e.g. REP-ARG-2026-9904
    incident_id: Optional[str] = None
    asset_id: str
    title: str
    classification: str = "CONFIDENTIAL FORENSIC DOSSIER"
    generated_by: str = "ARGOS AI Forensics Engine v3.4"
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    summary: str
    pdf_download_url: Optional[str] = None
    verification_hash: str


class VerificationRequest(BaseModel):
    id: str
    query_type: str  # "asset_id" or "file_hash"
    asset_id_queried: Optional[str] = None
    file_hash_queried: Optional[str] = None
    is_found: bool
    provenance_verified: bool
    integrity_valid: bool
    watermark_detected: bool
    post_protection_modified: bool
    ai_manipulation_probability: float
    conclusion: str
    queried_at: datetime = Field(default_factory=datetime.utcnow)


# ----------------------------------------------------
# Request / Response Transfer Objects
# ----------------------------------------------------

class AuthenticityGateRequest(BaseModel):
    file_name: str
    file_size_bytes: int
    media_type: MediaType
    simulated_scenario: Optional[str] = "authentic"  # "authentic", "ai_generated", "inconclusive"

class AuthenticityGateResponse(BaseModel):
    verdict: AuthenticityVerdict
    eligible_for_protection: bool
    ai_generation_score: float  # 0 to 100
    visual_consistency_score: float
    temporal_consistency_score: float
    metadata_integrity: str
    provenance_found: bool
    details: str

class AttackSimulationRequest(BaseModel):
    asset_id: str
    attack_type: AttackType
    intensity: float = 0.8  # 0.0 to 1.0

class AttackSimulationResponse(BaseModel):
    asset_id: str
    attack_type: AttackType
    resilience_score: int  # e.g. 86 / 100
    watermark_detected: bool
    media_dna_matched: bool
    manipulation_detected: bool
    tamper_heat_score: float
    reconstructed_match_ratio: float
    analysis_notes: str
