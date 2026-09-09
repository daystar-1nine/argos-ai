import { 
  MediaAsset, 
  MediaDNA, 
  ProtectionRecord, 
  ProvenanceRecord, 
  MonitoringSource, 
  DetectedMatch, 
  ForensicAnalysis, 
  AlertItem, 
  IncidentCase,
  AttackType,
  AttackSimulationResult
} from './types';

export const DEMO_ASSET: MediaAsset = {
  id: "ARG-2026-8A92F1",
  userId: "usr_argos_creator_99",
  title: "CEO Keynote Address & Product Release 2026",
  mediaType: "video",
  fileName: "ceo_keynote_master_4k.mp4",
  fileSizeBytes: 142589000,
  durationSeconds: 32.4,
  resolution: "3840x2160",
  fps: 60.0,
  createdAt: "2026-09-08T14:32:00Z",
  isProtected: true,
  storageUri: "s3://argos-vault/assets/ARG-2026-8A92F1/master.mp4",
  thumbnailUri: "/samples/ceo_thumb.jpg"
};

export const DEMO_DNA: MediaDNA = {
  id: "dna_8a92f1_master",
  assetId: "ARG-2026-8A92F1",
  sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  phash: "b8f419d2a6c8e034",
  visualDnaSignature: "VDNA-9941-8A92-BF20-CC81-772A",
  audioDnaSignature: "ADNA-3419-EF90-1120-998A-004B",
  temporalDnaSignature: "TDNA-6602-0044-8891-AA12-FE44",
  featureVectorSample: [0.82, -0.41, 0.95, 0.12, -0.63, 0.74, 0.88, -0.19, 0.44, 0.52],
  generatedAt: "2026-09-08T14:33:12Z",
  entropyScore: 0.962
};

export const DEMO_PROTECTION: ProtectionRecord = {
  id: "prot_8a92f1",
  assetId: "ARG-2026-8A92F1",
  watermarkKeyId: "WMK-SEC-2026-449",
  watermarkApplied: true,
  watermarkStrength: 0.88,
  dnaRegistered: true,
  cryptographicSeal: "SEAL-SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  status: "active",
  protectedAt: "2026-09-08T14:34:00Z"
};

export const DEMO_PROVENANCE: ProvenanceRecord = {
  id: "c2pa_manifest_8a92f1",
  assetId: "ARG-2026-8A92F1",
  c2paManifestId: "urn:c2pa:8a92f1-4402-99ab-2026",
  signingAuthority: "ARGOS Sovereign Provenance CA 2026",
  claimGenerator: "ARGOS Media Defender / C2PA v2.1",
  issuerDid: "did:argos:sig-7b2f901a",
  timestamp: "2026-09-08T14:34:00Z",
  isValid: true,
  assertions: [
    { label: "c2pa.actions", data: { action: "c2pa.created", softwareAgent: "Sony FX6 Camera Firmware 4.0" } },
    { label: "c2pa.hash.data", data: { alg: "sha256", val: "e3b0c44298fc1c149afbf4c8996fb924" } },
    { label: "argos.dna.fingerprint", data: { visual_dna: "VDNA-9941", audio_dna: "ADNA-3419" } },
    { label: "argos.authenticity_gate", data: { verdict: "Likely authentic", confidence: 0.984 } }
  ]
};

export const DEMO_MONITORING_SOURCES: MonitoringSource[] = [
  {
    id: "src_01",
    sourceName: "Public Video Index Alpha",
    sourceType: "public_indexed",
    region: "Global",
    status: "online",
    itemsMonitoredHourly: 48200,
    lastSyncAt: "Just now"
  },
  {
    id: "src_02",
    sourceName: "Social Discussion Streams (Public Forums)",
    sourceType: "public_indexed",
    region: "USA",
    status: "online",
    itemsMonitoredHourly: 194000,
    lastSyncAt: "1 min ago"
  },
  {
    id: "src_03",
    sourceName: "Microblogging Public Stream (Source A)",
    sourceType: "public_indexed",
    region: "Global",
    status: "online",
    itemsMonitoredHourly: 320000,
    lastSyncAt: "45 sec ago"
  },
  {
    id: "src_04",
    sourceName: "Short-Form Video Search Stream (Source B)",
    sourceType: "integrated_api",
    region: "India & SE Asia",
    status: "online",
    itemsMonitoredHourly: 89000,
    lastSyncAt: "3 min ago"
  },
  {
    id: "src_05",
    sourceName: "Broadcast Web Archive (Source C)",
    sourceType: "public_indexed",
    region: "UK & Europe",
    status: "online",
    itemsMonitoredHourly: 31000,
    lastSyncAt: "5 min ago"
  }
];

export const DEMO_MATCHES: DetectedMatch[] = [
  {
    id: "match_01",
    assetId: "ARG-2026-8A92F1",
    sourceId: "src_03",
    sourceName: "SOURCE A — Public Microblog Stream",
    sourceUrl: "https://public-feed-gateway.net/post/x881903",
    platform: "X (Public)",
    matchPercentage: 94.2,
    detectedManipulation: "Face manipulation suspected & voice cloned",
    riskLevel: "critical",
    discoveredAt: "3 hours ago",
    status: "escalated"
  },
  {
    id: "match_02",
    assetId: "ARG-2026-8A92F1",
    sourceId: "src_04",
    sourceName: "SOURCE B — Short-Form Video Stream",
    sourceUrl: "https://short-index-mirror.org/clip/v99281a",
    platform: "TikTok (Indexed Mirror)",
    matchPercentage: 87.5,
    detectedManipulation: "Lip-sync mismatch (+320ms)",
    riskLevel: "high",
    discoveredAt: "8 hours ago",
    status: "unreviewed"
  },
  {
    id: "match_03",
    assetId: "ARG-2026-8A92F1",
    sourceId: "src_01",
    sourceName: "SOURCE C — Video Index Alpha",
    sourceUrl: "https://video-indexer-cloud.io/watch/m8820",
    platform: "YouTube (Public Index)",
    matchPercentage: 79.1,
    detectedManipulation: "Modified / re-encoded with 20% peripheral crop",
    riskLevel: "medium",
    discoveredAt: "14 hours ago",
    status: "confirmed_tampered"
  }
];

export const DEMO_FORENSIC_ANALYSIS: ForensicAnalysis = {
  id: "forensic_8a92f1_primary",
  assetId: "ARG-2026-8A92F1",
  suspectMediaId: "suspect_match_01",
  overallManipulationRisk: 93.0,
  verdict: "MANIPULATION DETECTED",
  lipSyncAnomaly: 91.0,
  visualAnomaly: 74.0,
  audioAnomaly: 62.0,
  temporalAnomaly: 88.0,
  modelAgreement: "4 / 4",
  temporalMismatchMs: 320,
  analyzedAt: "2026-09-09T21:14:00Z",
  explanation: "Between 00:14 and 00:18, visible mouth movements are temporally inconsistent with the corresponding speech. Viseme phoneme delta lags by +320ms with neural boundary blurring along the jawline.",
  timelineSegments: [
    { start: "00:00", end: "00:07", status: "normal", riskPct: 8, note: "Baseline authentic audio & video" },
    { start: "00:07", end: "00:14", status: "suspicious", riskPct: 42, note: "Subtle viseme lag starts developing" },
    { start: "00:14", end: "00:18", status: "high_risk", riskPct: 93, note: "HIGH RISK: Lip-sync mismatch +320ms, synthetic mouth warp" },
    { start: "00:18", end: "00:26", status: "high_risk", riskPct: 86, note: "AI voice synthesis spectral vocoder anomaly" },
    { start: "00:26", end: "00:32", status: "normal", riskPct: 12, note: "Authentic outro segment" }
  ],
  evidenceFrames: [
    {
      frameNumber: 420,
      timestamp: "00:14.00",
      label: "Bilinear Facial Warp",
      riskPct: 89,
      description: "Jawline boundary exhibits high-frequency neural blend artifacts inconsistent with key lighting."
    },
    {
      frameNumber: 480,
      timestamp: "00:16.00",
      label: "Desynchronized Phoneme",
      riskPct: 94,
      description: "Open vowel /o/ emitted in audio while lips remain stationary in a bilabial closure."
    },
    {
      frameNumber: 530,
      timestamp: "00:17.66",
      label: "Spectral Discontinuity",
      riskPct: 91,
      description: "Artificial vocoder frequency cut-off above 7.8 kHz indicating diffusion acoustic model."
    }
  ]
};

export const DEMO_ALERTS: AlertItem[] = [
  {
    id: "alt_01",
    assetId: "ARG-2026-8A92F1",
    matchId: "match_01",
    title: "🚨 HIGH-RISK ALERT",
    message: "Your protected media may have been manipulated.",
    severity: "critical",
    isRead: false,
    sourceLabel: "Public indexed source (Source A)",
    createdAt: "3 hours ago",
    actionRequired: true
  },
  {
    id: "alt_02",
    assetId: "ARG-2026-8A92F1",
    matchId: "match_02",
    title: "TEMPORAL MISMATCH ALERT",
    message: "Lip-sync anomaly (+320ms) detected in 18s derivative.",
    severity: "high",
    isRead: false,
    sourceLabel: "Short-form indexed mirror (Source B)",
    createdAt: "8 hours ago",
    actionRequired: true
  },
  {
    id: "alt_03",
    assetId: "ARG-2026-8A92F1",
    matchId: "match_03",
    title: "DERIVATIVE TRANSCODE NOTICED",
    message: "Re-encoded copy found. Provenance watermark verified intact.",
    severity: "medium",
    isRead: true,
    sourceLabel: "Video Index Alpha (Source C)",
    createdAt: "14 hours ago",
    actionRequired: false
  }
];

export const DEMO_INCIDENT: IncidentCase = {
  id: "ARG-8291",
  assetId: "ARG-2026-8A92F1",
  title: "Synthetic Speech Replacement & Impersonation on Public Relay",
  status: "investigating",
  platformTarget: "Public Streaming Relay / Microblog Host",
  suspectUrl: "https://public-feed-gateway.net/post/x881903",
  takedownType: "DMCA 512(c) + EU DSA Article 16 Forensic Notice",
  openedAt: "2026-09-09T21:10:00Z",
  lastUpdated: "25 minutes ago",
  notes: "Suspect video altered CEO speech. Full forensic dossier assembled with 12 timestamped frame exhibits.",
  evidenceCount: 12,
  waveformAnalyzed: true,
  analysisGraphsCount: 3,
  originalAssetStatus: "Verified authentic",
  provenanceStatus: "Valid (C2PA signed)",
  mediaDnaStatus: "Matched (SHA-256 + Perceptual DNA)",
  manipulationVerdict: "Detected (93% risk)"
};

export const ATTACK_RESPONSES: Record<AttackType, AttackSimulationResult> = {
  face_swap: {
    assetId: "ARG-2026-8A92F1",
    attackType: "face_swap",
    resilienceScore: 86,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: true,
    tamperHeatScore: 92.4,
    reconstructedMatchRatio: 0.88,
    analysisNotes: "Deepfake face swap detected. Visual DNA anchor survived in peripheral background; watermark remained 88% intact."
  },
  lip_sync: {
    assetId: "ARG-2026-8A92F1",
    attackType: "lip_sync",
    resilienceScore: 89,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: true,
    tamperHeatScore: 94.1,
    reconstructedMatchRatio: 0.91,
    analysisNotes: "Wav2Lip phoneme retargeting detected. Audio-visual lag measured at +320ms. C2PA provenance flagged per-frame facial synthesis."
  },
  audio_replacement: {
    assetId: "ARG-2026-8A92F1",
    attackType: "audio_replacement",
    resilienceScore: 84,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: true,
    tamperHeatScore: 88.0,
    reconstructedMatchRatio: 0.84,
    analysisNotes: "Voice clone detected via vocoder high-frequency cutoff. Audio DNA signature failed cryptographic match."
  },
  ai_regeneration: {
    assetId: "ARG-2026-8A92F1",
    attackType: "ai_regeneration",
    resilienceScore: 81,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: true,
    tamperHeatScore: 95.8,
    reconstructedMatchRatio: 0.81,
    analysisNotes: "Diffusion inpainting localized to 34% of frame area. Watermark extracted via BCH error correction code."
  },
  crop: {
    assetId: "ARG-2026-8A92F1",
    attackType: "crop",
    resilienceScore: 94,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: false,
    tamperHeatScore: 12.0,
    reconstructedMatchRatio: 0.95,
    analysisNotes: "20% peripheral crop. pHash and redundant spread-spectrum watermark maintained 94% retrieval rate without flagging benign edit."
  },
  resize: {
    assetId: "ARG-2026-8A92F1",
    attackType: "resize",
    resilienceScore: 98,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: false,
    tamperHeatScore: 4.5,
    reconstructedMatchRatio: 0.99,
    analysisNotes: "Downsampled 4K to 720p. Wavelet-domain watermark fully survived spatial downscaling. Correctly classified as benign transcode."
  },
  compression: {
    assetId: "ARG-2026-8A92F1",
    attackType: "compression",
    resilienceScore: 96,
    watermarkDetected: true,
    mediaDnaMatched: true,
    manipulationDetected: false,
    tamperHeatScore: 6.2,
    reconstructedMatchRatio: 0.97,
    analysisNotes: "Aggressive H.264 CRF 28 re-compression. DNA entropy remained resilient with zero false positive deepfake warnings."
  }
};
