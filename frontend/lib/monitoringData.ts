import { DetectedMatch } from './types';

export type RegionRisk = 'high' | 'medium' | 'low';

export interface TelemetryRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  risk: RegionRisk;
  matches: number;
  activeNodes: number;
  potentialMatches: number;
  highRiskDetections: number;
  clusterStatus: string;
  lastPing: string;
  derivatives: DetectedMatch[];
}

export interface DerivativeArc {
  id: string;
  sourceRegion: string;
  targetRegion: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  risk: RegionRisk;
  color: string;
  label: string;
  speed: number;
}

export const DEMO_TELEMETRY_REGIONS: TelemetryRegion[] = [
  {
    id: 'reg_india',
    name: 'India',
    lat: 20.5937,
    lng: 78.9629,
    risk: 'high',
    matches: 4,
    activeNodes: 4,
    potentialMatches: 7,
    highRiskDetections: 2,
    clusterStatus: 'DEGRADED // THREAT SURGE',
    lastPing: '12s ago',
    derivatives: [
      {
        id: 'match_01',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_03',
        sourceName: 'SOURCE A — Public Microblog Stream',
        sourceUrl: 'https://public-feed-gateway.net/post/x881903',
        platform: 'X (Public Stream)',
        matchPercentage: 94.2,
        detectedManipulation: 'Neural face blend warp & voice clone vocoder anomaly',
        riskLevel: 'critical',
        discoveredAt: '12 min ago',
        status: 'escalated'
      },
      {
        id: 'match_in_02',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_04',
        sourceName: 'SOURCE D — Regional Messaging Index',
        sourceUrl: 'https://regional-stream-node.in/item/99120',
        platform: 'Telegram Public Channel',
        matchPercentage: 89.8,
        detectedManipulation: 'Lip-sync desync +320ms on Hindi dubbed audio',
        riskLevel: 'high',
        discoveredAt: '34 min ago',
        status: 'unreviewed'
      }
    ]
  },
  {
    id: 'reg_usa',
    name: 'USA',
    lat: 37.0902,
    lng: -95.7129,
    risk: 'high',
    matches: 3,
    activeNodes: 12,
    potentialMatches: 5,
    highRiskDetections: 1,
    clusterStatus: 'ACTIVE // REHYDRATING',
    lastPing: '3s ago',
    derivatives: [
      {
        id: 'match_us_01',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_01',
        sourceName: 'SOURCE E — Silicon Valley Video Mirror',
        sourceUrl: 'https://video-indexer-cloud.io/watch/m8820',
        platform: 'YouTube (Indexed)',
        matchPercentage: 92.4,
        detectedManipulation: 'Synthetic lipsync insertion & deepfake watermark removal',
        riskLevel: 'critical',
        discoveredAt: '1 hour ago',
        status: 'confirmed_tampered'
      },
      {
        id: 'match_us_02',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_05',
        sourceName: 'SOURCE F — North America CDN Hub',
        sourceUrl: 'https://us-mirror-cdn.net/stream/9811',
        platform: 'Reddit (r/technology)',
        matchPercentage: 81.3,
        detectedManipulation: '20% peripheral crop with audio transcode',
        riskLevel: 'medium',
        discoveredAt: '2 hours ago',
        status: 'unreviewed'
      }
    ]
  },
  {
    id: 'reg_uk',
    name: 'UK',
    lat: 55.3781,
    lng: -3.4360,
    risk: 'medium',
    matches: 2,
    activeNodes: 6,
    potentialMatches: 3,
    highRiskDetections: 0,
    clusterStatus: 'OPTIMAL // SENSOR HEALTH 99%',
    lastPing: '18s ago',
    derivatives: [
      {
        id: 'match_02',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_04',
        sourceName: 'SOURCE B — European Short-Form Mirror',
        sourceUrl: 'https://short-index-mirror.org/clip/v99281a',
        platform: 'TikTok (Indexed Mirror)',
        matchPercentage: 87.5,
        detectedManipulation: 'Lip-sync mismatch (+320ms viseme lag)',
        riskLevel: 'high',
        discoveredAt: '4 hours ago',
        status: 'unreviewed'
      }
    ]
  },
  {
    id: 'reg_singapore',
    name: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    risk: 'low',
    matches: 1,
    activeNodes: 3,
    potentialMatches: 2,
    highRiskDetections: 0,
    clusterStatus: 'STEADY // LOW LATENCY',
    lastPing: '45s ago',
    derivatives: [
      {
        id: 'match_sg_01',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_02',
        sourceName: 'SOURCE G — APAC Media Aggregator',
        sourceUrl: 'https://apac-stream-index.sg/news/3198',
        platform: 'News Portal Mirror',
        matchPercentage: 76.4,
        detectedManipulation: 'Benign 1080p transcode with valid intrinsic C2PA tag',
        riskLevel: 'low',
        discoveredAt: '6 hours ago',
        status: 'benign_copy'
      }
    ]
  },
  {
    id: 'reg_australia',
    name: 'Australia',
    lat: -25.2744,
    lng: 133.7751,
    risk: 'low',
    matches: 1,
    activeNodes: 3,
    potentialMatches: 1,
    highRiskDetections: 0,
    clusterStatus: 'STEADY // SYNC COMPLETE',
    lastPing: '2m ago',
    derivatives: [
      {
        id: 'match_au_01',
        assetId: 'ARG-2026-8A92F1',
        sourceId: 'src_06',
        sourceName: 'SOURCE H — Oceania Broadcast Index',
        sourceUrl: 'https://oceania-broadcast-archive.au/item/871',
        platform: 'Public Broadcast Web Index',
        matchPercentage: 74.0,
        detectedManipulation: 'H.264 CRF 28 re-compression (Watermark Resilient)',
        riskLevel: 'low',
        discoveredAt: '9 hours ago',
        status: 'benign_copy'
      }
    ]
  }
];

export const DEMO_DERIVATIVE_ARCS: DerivativeArc[] = [
  {
    id: 'arc_in_us',
    sourceRegion: 'India',
    targetRegion: 'USA',
    startLat: 20.5937,
    startLng: 78.9629,
    endLat: 37.0902,
    endLng: -95.7129,
    risk: 'high',
    color: '#D95D5D',
    label: 'Cross-Border High-Risk Deepfake Derivative (94.2% match)',
    speed: 3000
  },
  {
    id: 'arc_uk_in',
    sourceRegion: 'UK',
    targetRegion: 'India',
    startLat: 55.3781,
    startLng: -3.4360,
    endLat: 20.5937,
    endLng: 78.9629,
    risk: 'medium',
    color: '#F4CD3F',
    label: 'Viseme Phoneme Lag Propagation (+320ms)',
    speed: 4000
  },
  {
    id: 'arc_us_sg',
    sourceRegion: 'USA',
    targetRegion: 'Singapore',
    startLat: 37.0902,
    startLng: -95.7129,
    endLat: 1.3521,
    endLng: 103.8198,
    risk: 'low',
    color: '#8BCF9B',
    label: 'Syndicated Public Index Mirror',
    speed: 5000
  }
];

export const MONITORING_DISCLAIMER = "Monitoring supported public, indexed and integrated sources.";
export const IS_SIMULATED_DATA = true;
