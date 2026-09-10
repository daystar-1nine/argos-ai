'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  Globe, 
  Search, 
  ExternalLink, 
  ChevronRight, 
  Eye, 
  AlertTriangle, 
  Radio, 
  ShieldAlert, 
  Fingerprint, 
  Compass, 
  Layers,
  ArrowRight
} from 'lucide-react';
import ArgosGlobeWrapper from '@/components/monitoring/ArgosGlobeWrapper';
import { 
  DEMO_TELEMETRY_REGIONS, 
  MONITORING_DISCLAIMER, 
  IS_SIMULATED_DATA,
  TelemetryRegion 
} from '@/lib/monitoringData';
import { DetectedMatch } from '@/lib/types';
import ProFeatureGate from '@/components/ui/ProFeatureGate';
import { useProfile } from '@/lib/useProfile';

export default function MonitorPage() {
  const { profile, isLoading } = useProfile();
  const isPro = profile?.subscription.plan === 'pro';

  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>('match_01');

  // Flatten all derivatives across all regions for 'All' view
  const allDerivatives = useMemo(() => {
    const list: { match: DetectedMatch; regionName: string; regionRisk: string }[] = [];
    DEMO_TELEMETRY_REGIONS.forEach((reg) => {
      reg.derivatives.forEach((d) => {
        list.push({ match: d, regionName: reg.name, regionRisk: reg.risk });
      });
    });
    return list;
  }, []);

  const activeRegionData = useMemo(() => {
    return DEMO_TELEMETRY_REGIONS.find(
      (r) => r.name.toLowerCase() === selectedRegion.toLowerCase()
    );
  }, [selectedRegion]);

  const displayedDerivatives = useMemo(() => {
    if (selectedRegion === 'All' || !activeRegionData) {
      return allDerivatives;
    }
    return activeRegionData.derivatives.map((d) => ({
      match: d,
      regionName: activeRegionData.name,
      regionRisk: activeRegionData.risk
    }));
  }, [selectedRegion, activeRegionData, allDerivatives]);

  // Handle card click: updates highlighted card and rotates globe to region
  const handleCardClick = (matchId: string, regionName: string) => {
    setHighlightedCardId(matchId);
    setSelectedRegion(regionName);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Argos Global Watch" />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          {!isLoading && !isPro ? (
            <ProFeatureGate
              featureTitle="ARGOS GLOBAL WATCH & SENSOR GRID LOCKED"
              featureDescription="Continuous telemetry monitoring across supported public, indexed and integrated sources requires an active ARGOS PRO subscription. Upgrade to monitor your registered media for derivatives and deepfakes across 5 regional sensor clusters."
              bullets={[
                "3D WebGL Cesium / Three.js Sovereign Global Watch Telemetry",
                "Automated Audio-Visual Derivative Matching via Media DNA",
                "Continuous Polling on Supported Public, Indexed & Integrated Relays",
                "Real-Time Incident Notifications & Platform Mirroring",
                "Instant High-Risk Tamper Heat Anomaly Detection",
                "Automated Platform Takedown Package Assembly"
              ]}
            />
          ) : (
            <>
          
          <PageHeader
            badge="TELEMETRY SENSOR GRID"
            badgeColor="mauve"
            title="ARGOS GLOBAL WATCH"
            subtitle={`"${MONITORING_DISCLAIMER}"`}
            actions={
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-white border-[2px] border-[#111111] text-xs font-bold flex items-center gap-2 brutal-shadow-sm">
                  <span className="w-2.5 h-2.5 bg-[#8BCF9B] rounded-full led-blink-fast" />
                  <span>5 CLUSTERS SYNCING</span>
                </div>
                <div className="p-2.5 bg-[#EFD99C] border-[2px] border-[#111111] text-[10px] font-black uppercase hidden sm:block">
                  SIMULATED SENSORS
                </div>
              </div>
            }
          />

          {/* Aggregate Telemetry Strip: Sources, Matches, Modified copies, High-Risk */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-4 brutal-shadow-sm">
              <div className="text-[10px] text-gray-700 font-bold uppercase">MONITORED SOURCES</div>
              <div className="text-3xl font-black font-display mt-1">5 sources</div>
              <div className="text-[10px] text-[#8BCF9B] font-bold mt-1">● ALL HUBS ONLINE</div>
            </div>

            <div className="bg-[#F6C6D8] border-[3px] border-[#111111] p-4 brutal-shadow-sm">
              <div className="text-[10px] text-gray-700 font-bold uppercase">POTENTIAL MATCHES</div>
              <div className="text-3xl font-black font-display mt-1">7 found</div>
              <div className="text-[10px] text-gray-600 mt-1">ACROSS 3 PLATFORMS</div>
            </div>

            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-4 brutal-shadow-sm">
              <div className="text-[10px] text-gray-700 font-bold uppercase">MODIFIED COPIES</div>
              <div className="text-3xl font-black font-display mt-1 text-[#844469]">3 copies</div>
              <div className="text-[10px] text-gray-600 mt-1">RE-ENCODED / CROPPED</div>
            </div>

            <div className="bg-[#D95D5D] text-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
              <div className="text-[10px] font-bold uppercase opacity-90">HIGH-RISK DETECTIONS</div>
              <div className="text-3xl font-black font-display mt-1">2 critical</div>
              <div className="text-[10px] font-bold mt-1 bg-black/40 px-1 py-0.5 inline-block">CASE #ARG-8291</div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* MAIN TWO-COLUMN SECTION: 3D GLOBE (LEFT) & DERIVATIVES (RIGHT) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 7 Cols: Interactive 3D WebGL Argos Globe */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <ArgosGlobeWrapper
                selectedRegion={selectedRegion}
                onSelectRegion={(reg) => {
                  setSelectedRegion(reg);
                  if (reg !== selectedRegion) setHighlightedCardId(null);
                }}
                highlightedDetectionId={highlightedCardId || undefined}
              />

              {/* Telemetry Operational Notes below globe */}
              <div className="p-3 bg-white border-[2px] border-[#111111] brutal-shadow-sm text-[11px] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#844469] uppercase">SENSOR TELEMETRY:</span>
                  <span className="text-gray-700">
                    {activeRegionData 
                      ? `${activeRegionData.name.toUpperCase()} Cluster — ${activeRegionData.activeNodes} nodes active (${activeRegionData.clusterStatus})`
                      : 'All 5 regional sensor clusters active. Click any region on globe to filter threat feed.'}
                  </span>
                </div>
                <span className="text-[10px] bg-[#EFD99C] px-2 py-0.5 font-bold border border-[#111111]">
                  LATENCY &lt;45ms
                </span>
              </div>
            </div>

            {/* Right 5 Cols: SUSPICIOUS DERIVATIVES DISCOVERED */}
            <div className="lg:col-span-5 flex flex-col bg-white border-[3px] border-[#111111] brutal-shadow overflow-hidden">
              
              {/* Header */}
              <div className="p-3.5 bg-[#EFD99C] border-b-[2px] border-[#111111] flex items-center justify-between text-xs font-black uppercase">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#844469]" />
                  <span>SUSPICIOUS DERIVATIVES DISCOVERED</span>
                </div>
                <span className="text-[10px] bg-black text-[#F4CD3F] px-2 py-0.5 font-bold">
                  {selectedRegion.toUpperCase()} ({displayedDerivatives.length})
                </span>
              </div>

              {/* Sub-bar Filter Status & Helper */}
              <div className="p-2.5 bg-[#111111] text-[#EFD99C] border-b border-[#111111] flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D95D5D] led-blink" />
                  <span>SELECT CARD TO FOCUS SENSOR CAMERA</span>
                </span>
                {selectedRegion !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedRegion('All')}
                    className="text-[#F4CD3F] hover:underline font-bold"
                  >
                    [ RESET TO ALL ]
                  </button>
                )}
              </div>

              {/* Scrollable Derivative Cards Container */}
              <div className="p-3.5 space-y-3 max-h-[580px] overflow-y-auto bg-[#F8E8E8]">
                {displayedDerivatives.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 font-mono text-xs">
                    No suspicious derivatives detected in this regional cluster.
                  </div>
                ) : (
                  displayedDerivatives.map(({ match, regionName, regionRisk }) => {
                    const isSelected = highlightedCardId === match.id;
                    const isCritical = match.riskLevel === 'critical';

                    return (
                      <div
                        key={match.id}
                        onClick={() => handleCardClick(match.id, regionName)}
                        className={`p-3.5 bg-white border-[3px] cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#D95D5D] brutal-shadow ring-2 ring-[#D95D5D]/20'
                            : 'border-[#111111] hover:border-[#844469] brutal-shadow-sm'
                        }`}
                      >
                        {/* Card Top Row: Platform & Risk Badge */}
                        <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#111111]/15 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isCritical ? 'bg-[#D95D5D] led-blink' : 'bg-[#F4CD3F]'
                              }`}
                            />
                            <span className="font-bold text-[#111111]">{match.platform}</span>
                            <span className="text-[10px] text-gray-500">({regionName})</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-xs text-[#844469]">
                              {match.matchPercentage}% MATCH
                            </span>
                            <StatusBadge
                              status={isCritical ? 'danger' : 'warning'}
                              label={match.riskLevel.toUpperCase()}
                            />
                          </div>
                        </div>

                        {/* Source Name & Detected Manipulation */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-gray-800 line-clamp-1">
                            {match.sourceName}
                          </div>
                          
                          <div className="p-2 bg-[#F8E8E8] border border-[#111111]/20 text-[11px] text-[#111111] font-medium leading-relaxed">
                            <span className="font-bold text-[#D95D5D]">ANOMALY: </span>
                            {match.detectedManipulation}
                          </div>
                        </div>

                        {/* Card Bottom Row: Discovered At & Action Link */}
                        <div className="mt-3 pt-2 border-t border-[#111111]/10 flex items-center justify-between text-[10px]">
                          <span className="text-gray-500">
                            DETECTED: {match.discoveredAt}
                          </span>

                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <span className="text-[9px] text-[#D95D5D] font-bold animate-pulse">
                                ● GLOBE FOCUSED
                              </span>
                            )}
                            <Link
                              href={`/detections/${match.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 bg-[#111111] hover:bg-[#844469] text-[#F4CD3F] font-bold text-[10px] inline-flex items-center gap-1 uppercase transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Inspect
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Box Footer Telemetry */}
              <div className="p-2.5 bg-[#EFD99C] border-t-[2px] border-[#111111] flex items-center justify-between text-[10px] font-bold text-gray-700">
                <span>INDEXED SOURCES ONLY</span>
                <span>ESCROW EVIDENCE SECURED ✓</span>
              </div>

            </div>

          </div>

          {/* Bottom Historical Forensic Table */}
          <div className="bg-white border-[3px] border-[#111111] brutal-shadow overflow-x-auto">
            <div className="p-4 bg-[#EFD99C] border-b-[2px] border-[#111111] flex items-center justify-between text-xs font-black uppercase">
              <span>ACTIVE DERIVATIVE AUDIT LOG</span>
              <span className="text-gray-600">ALL AUDITED INCIDENT MATCHES</span>
            </div>

            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8E8E8] border-b border-[#111111] text-[10px] font-black uppercase text-gray-700">
                  <th className="p-3">Source & Platform</th>
                  <th className="p-3">Match %</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Manipulation Findings</th>
                  <th className="p-3">Detected</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/20">
                {allDerivatives.map(({ match, regionName }) => (
                  <tr 
                    key={match.id} 
                    className={`transition-colors ${
                      highlightedCardId === match.id ? 'bg-[#F6C6D8]/50' : 'hover:bg-[#F6C6D8]/20'
                    }`}
                  >
                    <td className="p-3 font-bold">
                      <div>{match.sourceName}</div>
                      <div className="text-[10px] text-gray-500">{match.platform} ({regionName})</div>
                    </td>
                    <td className="p-3">
                      <span className="font-black text-sm text-[#844469]">{match.matchPercentage}%</span>
                    </td>
                    <td className="p-3">
                      <StatusBadge
                        status={match.riskLevel === 'critical' ? 'danger' : 'warning'}
                        label={match.status.replace('_', ' ')}
                      />
                    </td>
                    <td className="p-3 font-medium text-[11px] text-[#111111]">
                      {match.detectedManipulation}
                    </td>
                    <td className="p-3 text-[11px] text-gray-600 whitespace-nowrap">
                      {match.discoveredAt}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/detections/${match.id}`}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-[#844469] text-[#F4CD3F] font-bold text-xs inline-flex items-center gap-1 uppercase"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
          )}

        </div>
      </div>
    </div>
  );
}
