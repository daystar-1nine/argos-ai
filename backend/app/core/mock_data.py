from datetime import datetime, timedelta
from typing import Dict, List, Any

# Primary Demo Asset ID
DEMO_ASSET_ID = "ARG-2026-8A92F1"

SAMPLE_ASSETS = [
    {
        "id": "ARG-2026-8A92F1",
        "user_id": "usr_dev_01",
        "title": "CEO Keynote Speech & Product Release 2026",
        "media_type": "video",
        "file_name": "ceo_keynote_master_4k.mp4",
        "file_size_bytes": 142589000,
        "duration_seconds": 32.4,
        "resolution": "3840x2160",
        "fps": 60.0,
        "created_at": datetime.utcnow() - timedelta(days=2),
        "is_protected": True,
        "storage_uri": "s3://argos-vault/assets/ARG-2026-8A92F1/master.mp4",
        "thumbnail_uri": "/samples/ceo_keynote_thumb.jpg"
    },
    {
        "id": "ARG-2026-4C19D2",
        "user_id": "usr_dev_01",
        "title": "Independent Journalism Investigative Interview",
        "media_type": "video",
        "file_name": "investigative_field_raw.mov",
        "file_size_bytes": 89452000,
        "duration_seconds": 45.0,
        "resolution": "1920x1080",
        "fps": 30.0,
        "created_at": datetime.utcnow() - timedelta(days=5),
        "is_protected": True,
        "storage_uri": "s3://argos-vault/assets/ARG-2026-4C19D2/master.mov",
        "thumbnail_uri": "/samples/interview_thumb.jpg"
    },
    {
        "id": "ARG-2026-9E88B0",
        "user_id": "usr_dev_01",
        "title": "Cybersecurity Architecture Whiteboard Session",
        "media_type": "image",
        "file_name": "zero_trust_topology_vector.png",
        "file_size_bytes": 12400000,
        "duration_seconds": None,
        "resolution": "4096x2304",
        "fps": None,
        "created_at": datetime.utcnow() - timedelta(days=1),
        "is_protected": True,
        "storage_uri": "s3://argos-vault/assets/ARG-2026-9E88B0/original.png",
        "thumbnail_uri": "/samples/whiteboard_thumb.jpg"
    }
]

SAMPLE_DNA = {
    "ARG-2026-8A92F1": {
        "id": "dna_8a92f1_master",
        "asset_id": "ARG-2026-8A92F1",
        "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "phash": "b8f419d2a6c8e034",
        "visual_dna_signature": "VDNA-9941-8A92-BF20-CC81-772A",
        "audio_dna_signature": "ADNA-3419-EF90-1120-998A-004B",
        "temporal_dna_signature": "TDNA-6602-0044-8891-AA12-FE44",
        "feature_vector_sample": [0.82, -0.41, 0.95, 0.12, -0.63, 0.74, 0.88, -0.19, 0.44, 0.52],
        "generated_at": datetime.utcnow() - timedelta(days=2),
        "entropy_score": 0.962
    }
}

SAMPLE_PROTECTION = {
    "ARG-2026-8A92F1": {
        "id": "prot_8a92f1",
        "asset_id": "ARG-2026-8A92F1",
        "watermark_key_id": "WMK-SEC-2026-449",
        "watermark_applied": True,
        "watermark_strength": 0.88,
        "dna_registered": True,
        "cryptographic_seal": "SEAL-SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
        "status": "active",
        "protected_at": datetime.utcnow() - timedelta(days=2)
    }
}

SAMPLE_PROVENANCE = {
    "ARG-2026-8A92F1": {
        "id": "c2pa_manifest_8a92f1",
        "asset_id": "ARG-2026-8A92F1",
        "c2pa_manifest_id": "urn:c2pa:8a92f1-4402-99ab-2026",
        "signing_authority": "ARGOS Sovereign Provenance CA 2026",
        "claim_generator": "ARGOS Media Defender / C2PA v2.1",
        "issuer_did": "did:argos:sig-7b2f901a",
        "timestamp": datetime.utcnow() - timedelta(days=2),
        "is_valid": True,
        "assertions": [
            {"label": "c2pa.actions", "data": {"action": "c2pa.created", "softwareAgent": "Sony FX6 Camera Firmware 4.0"}},
            {"label": "c2pa.hash.data", "data": {"alg": "sha256", "val": "e3b0c44298fc1c149afbf4c8996fb924"}},
            {"label": "argos.dna.fingerprint", "data": {"visual_dna": "VDNA-9941", "audio_dna": "ADNA-3419"}},
            {"label": "argos.authenticity_gate", "data": {"verdict": "Likely authentic", "confidence": 0.984}}
        ]
    }
}

SAMPLE_MONITORING_SOURCES = [
    {
        "id": "src_01",
        "source_name": "Public Video Index Alpha (Video Portals)",
        "source_type": "public_indexed",
        "region": "Global",
        "status": "online",
        "items_monitored_hourly": 48200,
        "last_sync_at": datetime.utcnow() - timedelta(minutes=2)
    },
    {
        "id": "src_02",
        "source_name": "Social Discussion Streams (Public Forums)",
        "source_type": "public_indexed",
        "region": "USA",
        "status": "online",
        "items_monitored_hourly": 194000,
        "last_sync_at": datetime.utcnow() - timedelta(minutes=1)
    },
    {
        "id": "src_03",
        "source_name": "Microblogging Public Feed (X/Threads Indexed)",
        "source_type": "public_indexed",
        "region": "Global",
        "status": "online",
        "items_monitored_hourly": 320000,
        "last_sync_at": datetime.utcnow() - timedelta(seconds=45)
    },
    {
        "id": "src_04",
        "source_name": "Short-Form Video Search Stream",
        "source_type": "integrated_api",
        "region": "India & SE Asia",
        "status": "online",
        "items_monitored_hourly": 89000,
        "last_sync_at": datetime.utcnow() - timedelta(minutes=4)
    },
    {
        "id": "src_05",
        "source_name": "Broadcast News Web Archive (Europe / UK)",
        "source_type": "public_indexed",
        "region": "UK & Europe",
        "status": "online",
        "items_monitored_hourly": 31000,
        "last_sync_at": datetime.utcnow() - timedelta(minutes=6)
    }
]

SAMPLE_DETECTED_MATCHES = [
    {
        "id": "match_01",
        "asset_id": "ARG-2026-8A92F1",
        "source_id": "src_03",
        "source_name": "Microblogging Public Stream (Source A)",
        "source_url": "https://public-feed-gateway.net/post/x881903",
        "platform": "X (Public)",
        "match_percentage": 94.2,
        "detected_manipulation": "Face swap + synthetic audio replacement detected",
        "risk_level": "critical",
        "discovered_at": datetime.utcnow() - timedelta(hours=3, minutes=12),
        "status": "escalated"
    },
    {
        "id": "match_02",
        "asset_id": "ARG-2026-8A92F1",
        "source_id": "src_04",
        "source_name": "Short-Form Video Search Stream (Source B)",
        "source_url": "https://short-index-mirror.org/clip/v99281a",
        "platform": "TikTok (Public Index)",
        "match_percentage": 87.5,
        "detected_manipulation": "Lip-sync anomaly and audio timing mismatch",
        "risk_level": "high",
        "discovered_at": datetime.utcnow() - timedelta(hours=8),
        "status": "unreviewed"
    },
    {
        "id": "match_03",
        "asset_id": "ARG-2026-8A92F1",
        "source_id": "src_01",
        "source_name": "Public Video Index Alpha (Source C)",
        "source_url": "https://video-indexer-cloud.io/watch/m8820",
        "platform": "YouTube (Indexed Copy)",
        "match_percentage": 79.1,
        "detected_manipulation": "Modified/re-encoded + crop with watermark intact",
        "risk_level": "medium",
        "discovered_at": datetime.utcnow() - timedelta(hours=14),
        "status": "confirmed_tampered"
    },
    {
        "id": "match_04",
        "asset_id": "ARG-2026-4C19D2",
        "source_id": "src_02",
        "source_name": "Social Discussion Streams (Public Forums)",
        "source_url": "https://reddit-public.net/r/tech/comments/z899",
        "platform": "Reddit",
        "match_percentage": 98.6,
        "detected_manipulation": "Unmodified original copy (C2PA signature intact)",
        "risk_level": "low",
        "discovered_at": datetime.utcnow() - timedelta(days=1),
        "status": "benign_copy"
    }
]

SAMPLE_FORENSIC_ANALYSIS = {
    "ARG-2026-8A92F1": {
        "id": "forensic_8a92f1_primary",
        "asset_id": "ARG-2026-8A92F1",
        "suspect_media_id": "suspect_match_01",
        "overall_manipulation_risk": 93.0,
        "verdict": "MANIPULATION DETECTED (HIGH RISK)",
        "lip_sync_anomaly": 91.4,
        "visual_anomaly": 74.2,
        "audio_anomaly": 62.8,
        "temporal_anomaly": 88.0,
        "model_agreement": "4 / 4 models in consensus",
        "temporal_mismatch_ms": 320,
        "analyzed_at": datetime.utcnow() - timedelta(hours=3),
        "explanation": (
            "Between 00:14 and 00:18, visible mouth movements are temporally inconsistent with the "
            "corresponding speech. Phoneme-to-viseme alignment degrades by +320ms, showing neural facial warp "
            "artifacts around the labial commissure and jawline boundary. Spectral audio analysis indicates "
            "high-frequency vocoder synthesis artifacts characteristic of diffusion audio models."
        ),
        "timeline_segments": [
            {"start": "00:00", "end": "00:07", "status": "normal", "risk_pct": 8, "note": "Original authentic baseline speech"},
            {"start": "00:07", "end": "00:14", "status": "suspicious", "risk_pct": 42, "note": "Phoneme shift begins, minor face boundary blur"},
            {"start": "00:14", "end": "00:18", "status": "high_risk", "risk_pct": 93, "note": "CRITICAL: Lip-sync mismatch +320ms, synthetic mouth warp"},
            {"start": "00:18", "end": "00:26", "status": "high_risk", "risk_pct": 86, "note": "Cloned audio synthesis with vocoder spectral cutoff"},
            {"start": "00:26", "end": "00:32", "status": "normal", "risk_pct": 14, "note": "Reverts to original outro speech segment"}
        ],
        "evidence_frames": [
            {
                "frame_number": 420,
                "timestamp": "00:14.00",
                "label": "Boundary Artifact",
                "risk_pct": 89,
                "description": "Bilinear warping artifact along jawline; inconsistent lighting angle vs keylight."
            },
            {
                "frame_number": 480,
                "timestamp": "00:16.00",
                "label": "Lip-Sync Desynchronization",
                "risk_pct": 94,
                "description": "Vowel /o/ audio phoneme emitted while lips remain closed; viseme lag measured at +320ms."
            },
            {
                "frame_number": 530,
                "timestamp": "00:17.66",
                "label": "Frequency Discontinuity",
                "risk_pct": 91,
                "description": "Cheek micro-movement lacks natural biological micro-saccades; bilateral symmetry abnormal."
            }
        ]
    }
}

SAMPLE_ALERTS = [
    {
        "id": "alt_01",
        "asset_id": "ARG-2026-8A92F1",
        "match_id": "match_01",
        "title": "HIGH-RISK ALERT: Unauthorized Derivative Detected",
        "message": "Your protected media may have been manipulated. Match 94.2% on public indexed feed with face & lip-sync alteration.",
        "severity": "critical",
        "is_read": False,
        "source_label": "Public Indexed Source (X / Microblog)",
        "created_at": datetime.utcnow() - timedelta(hours=3, minutes=10),
        "action_required": True
    },
    {
        "id": "alt_02",
        "asset_id": "ARG-2026-8A92F1",
        "match_id": "match_02",
        "title": "Suspicious Derivative Discovered",
        "message": "Short-form video stream matched at 87.5% with detected temporal timing mismatch (+280ms).",
        "severity": "high",
        "is_read": False,
        "source_label": "Short-Form Public Mirror",
        "created_at": datetime.utcnow() - timedelta(hours=8),
        "action_required": True
    },
    {
        "id": "alt_03",
        "asset_id": "ARG-2026-8A92F1",
        "match_id": "match_03",
        "title": "Modified Re-encoded Copy Found",
        "message": "Re-encoded video copy found on Video Index Alpha. Watermark remained 100% detectable.",
        "severity": "medium",
        "is_read": True,
        "source_label": "Video Index Alpha",
        "created_at": datetime.utcnow() - timedelta(hours=14),
        "action_required": False
    }
]

SAMPLE_INCIDENT = {
    "id": "ARG-8291",
    "asset_id": "ARG-2026-8A92F1",
    "title": "Deepfake Impersonation & Speech Replacement on Public Stream",
    "status": "investigating",
    "platform_target": "Public Streaming Platform / Social Relay",
    "suspect_url": "https://public-feed-gateway.net/post/x881903",
    "takedown_type": "DMCA 512(c) + EU DSA Article 16 Forensic Notice",
    "opened_at": datetime.utcnow() - timedelta(hours=3),
    "last_updated": datetime.utcnow() - timedelta(minutes=25),
    "notes": "Suspect video altered CEO statement regarding Q4 enterprise roadmap. Forensic dossier generated.",
    "evidence_count": 12,
    "waveform_analyzed": True,
    "analysis_graphs_count": 3
}

SAMPLE_REPORT = {
    "id": "rep_arg_8291",
    "report_number": "REP-ARG-2026-9904",
    "incident_id": "ARG-8291",
    "asset_id": "ARG-2026-8A92F1",
    "title": "DIGITAL MEDIA FORENSIC & PROVENANCE REPORT",
    "classification": "CONFIDENTIAL FORENSIC DOSSIER // AUTHORIZED USE ONLY",
    "generated_by": "ARGOS AI Forensics Engine v3.4 [SyncNet + SpectralRNN + SpatialResNet]",
    "generated_at": datetime.utcnow() - timedelta(hours=1),
    "summary": (
        "Multi-model analysis confirms substantial synthetic modification of protected asset ARG-2026-8A92F1. "
        "The suspect derivative exhibits 93.0% manipulation risk characterized by lip-sync desynchronization (+320ms) "
        "and vocoder spectral audio artifacting between timeline marks 00:14 and 00:18. Cryptographic Media DNA and "
        "invisible watermark were successfully extracted from the derivative, proving parentage to the registered asset."
    ),
    "verification_hash": "e93f608b8b84d62b53b817e75429177f15437ea6c836966601f465a3e144a991"
}
