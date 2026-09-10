export type MediaType = 'image' | 'video' | 'audio';

export type Plan = 'free' | 'pro';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled'
  | 'expired'
  | 'pending';

export type Feature =
  | 'detect'
  | 'deepfake_analysis'
  | 'audio_analysis'
  | 'visual_analysis'
  | 'lip_sync_analysis'
  | 'temporal_analysis'
  | 'evidence'
  | 'verification'
  | 'media_dna'
  | 'watermark'
  | 'c2pa'
  | 'protection_certificate'
  | 'monitoring'
  | 'derivative_matching'
  | 'alerts'
  | 'incidents'
  | 'advanced_reports';

export interface SubscriptionInfo {
  plan: Plan;
  name: string;
  status: SubscriptionStatus;
  price_inr: number;
  billing_period: string | null;
  started_at?: string | null;
  expires_at?: string | null;
  provider?: string | null;
}

export interface UsageInfo {
  analyses: number;
  analysis_limit: number;
  analyses_remaining: number;
  protected_assets: number;
  monitoring_sources: number;
  incidents: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: string;
  created_at?: string;
  avatar_url?: string;
}

export interface UserProfile {
  user: UserSummary;
  subscription: SubscriptionInfo;
  usage: UsageInfo;
  features: Record<string, boolean>;
}

export interface NotificationPreferences {
  email_alerts: boolean;
  push_alerts: boolean;
  detection_alerts: boolean;
  incident_alerts: boolean;
}

export type AuthenticityVerdict = 
  | 'Likely authentic' 
  | 'Potentially synthetic' 
  | 'Insufficient evidence';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'investigating' | 'notice_sent' | 'resolved' | 'closed';

export type AttackType = 
  | 'face_swap' 
  | 'lip_sync' 
  | 'audio_replacement' 
  | 'ai_regeneration' 
  | 'crop' 
  | 'resize' 
  | 'compression';

export interface User {
  id: string;
  email: string;
  name: string;
  organization?: string;
  role: string;
  createdAt: string;
  activeMonitorsCount: number;
  protectedAssetsCount: number;
}

export interface MediaAsset {
  id: string;
  userId: string;
  title: string;
  mediaType: MediaType;
  fileName: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  resolution?: string;
  fps?: number;
  createdAt: string;
  isProtected: boolean;
  storageUri?: string;
  thumbnailUri?: string;
}

export interface MediaDNA {
  id: string;
  assetId: string;
  sha256Hash: string;
  phash: string;
  visualDnaSignature: string;
  audioDnaSignature?: string;
  temporalDnaSignature?: string;
  featureVectorSample: number[];
  generatedAt: string;
  entropyScore: number;
}

export interface ProtectionRecord {
  id: string;
  assetId: string;
  watermarkKeyId: string;
  watermarkApplied: boolean;
  watermarkStrength: number;
  dnaRegistered: boolean;
  cryptographicSeal: string;
  status: 'active' | 'pending' | 'revoked';
  protectedAt: string;
}

export interface ProvenanceRecord {
  id: string;
  assetId: string;
  c2paManifestId: string;
  signingAuthority: string;
  claimGenerator: string;
  issuerDid: string;
  timestamp: string;
  isValid: boolean;
  assertions: Array<{ label: string; data: Record<string, any> }>;
}

export interface MonitoringSource {
  id: string;
  sourceName: string;
  sourceType: 'public_indexed' | 'integrated_api' | 'web_crawler';
  region: string;
  status: 'online' | 'syncing' | 'degraded';
  itemsMonitoredHourly: number;
  lastSyncAt: string;
}

export interface DetectedMatch {
  id: string;
  assetId: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  platform: string;
  matchPercentage: number;
  detectedManipulation: string;
  riskLevel: AlertSeverity;
  discoveredAt: string;
  status: 'unreviewed' | 'confirmed_tampered' | 'benign_copy' | 'escalated';
}

export interface TimelineSegment {
  start: string;
  end: string;
  status: 'normal' | 'suspicious' | 'high_risk';
  riskPct: number;
  note: string;
}

export interface EvidenceFrame {
  frameNumber: number;
  timestamp: string;
  label: string;
  riskPct: number;
  description: string;
}

export interface ForensicAnalysis {
  id: string;
  assetId: string;
  suspectMediaId?: string;
  overallManipulationRisk: number;
  verdict: string;
  lipSyncAnomaly: number;
  visualAnomaly: number;
  audioAnomaly: number;
  temporalAnomaly: number;
  modelAgreement: string;
  temporalMismatchMs: number;
  analyzedAt: string;
  explanation: string;
  timelineSegments: TimelineSegment[];
  evidenceFrames: EvidenceFrame[];
}

export interface AlertItem {
  id: string;
  assetId: string;
  matchId?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  sourceLabel: string;
  createdAt: string;
  actionRequired: boolean;
}

export interface IncidentCase {
  id: string;
  assetId: string;
  title: string;
  status: IncidentStatus;
  platformTarget: string;
  suspectUrl: string;
  takedownType: string;
  openedAt: string;
  lastUpdated: string;
  notes?: string;
  evidenceCount: number;
  waveformAnalyzed: boolean;
  analysisGraphsCount: number;
  originalAssetStatus: string;
  provenanceStatus: string;
  mediaDnaStatus: string;
  manipulationVerdict: string;
}

export interface AttackSimulationResult {
  assetId: string;
  attackType: AttackType;
  resilienceScore: number;
  watermarkDetected: boolean;
  mediaDnaMatched: boolean;
  manipulationDetected: boolean;
  tamperHeatScore: number;
  reconstructedMatchRatio: number;
  analysisNotes: string;
}
