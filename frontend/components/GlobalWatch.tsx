'use client';

import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  ExternalLink, 
  ShieldAlert,
  Radio,
  MapPin,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DEMO_MATCHES, DEMO_MONITORING_SOURCES } from '@/lib/data';
import { DetectedMatch } from '@/lib/types';
import ArgosGlobeWrapper from '@/components/monitoring/ArgosGlobeWrapper';

export default function GlobalWatch({ onSelectMatch }: { onSelectMatch?: (match: DetectedMatch) => void }) {
  const [selectedMatch, setSelectedMatch] = useState<DetectedMatch>(DEMO_MATCHES[0]);
  const [activeRegion, setActiveRegion] = useState<string>('All');

  return (
    <section id="global-watch" className="w-full py-20 px-4 lg:px-8 bg-[#EFD99C] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-3">
              06 // SUPPORTED INDEXED STREAMS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
              ARGOS GLOBAL WATCH
            </h2>
          </div>
          
          {/* Strict required scope note */}
          <div className="p-3 bg-white border-[2.5px] border-[#111111] font-mono text-xs max-w-md brutal-shadow-sm">
            <span className="font-black text-[#844469] block mb-0.5">COVERAGE BOUNDARY:</span>
            <span className="text-[#111111]/80">
              "Monitoring supported public, indexed and integrated sources."
            </span>
          </div>
        </div>

        {/* Aggregate Telemetry Counts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-mono">
          <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
            <div className="text-[11px] text-[#111111]/70 uppercase font-bold">POTENTIAL MATCHES</div>
            <div className="text-3xl sm:text-4xl font-black text-[#111111] font-display mt-1">
              6 <span className="text-xs font-mono font-normal">flagged</span>
            </div>
          </div>

          <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
            <div className="text-[11px] text-[#111111]/70 uppercase font-bold">MODIFIED COPIES</div>
            <div className="text-3xl sm:text-4xl font-black text-[#844469] font-display mt-1">
              3 <span className="text-xs font-mono font-normal">re-encoded</span>
            </div>
          </div>

          <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
            <div className="text-[11px] text-[#111111]/70 uppercase font-bold">SUSPECTED MANIPULATIONS</div>
            <div className="text-3xl sm:text-4xl font-black text-[#D95D5D] font-display mt-1">
              2 <span className="text-xs font-mono font-normal">critical</span>
            </div>
          </div>

          <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
            <div className="text-[11px] text-[#111111]/70 uppercase font-bold">ORIGINAL COPY</div>
            <div className="text-3xl sm:text-4xl font-black text-[#8BCF9B] font-display mt-1">
              1 <span className="text-xs font-mono font-normal">clean</span>
            </div>
          </div>
        </div>

        {/* Main Watch Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 7 Cols: Interactive 3D WebGL Argos Globe */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <ArgosGlobeWrapper
              selectedRegion={activeRegion}
              onSelectRegion={(reg) => setActiveRegion(reg)}
              highlightedDetectionId={selectedMatch.id}
            />

            {/* Region Telemetry Quick Bar */}
            <div className="p-3 bg-[#111111] border-[2.5px] border-[#111111] text-[#EFD99C] font-mono text-[11px] flex flex-wrap items-center justify-between gap-2 brutal-shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink-fast" />
                <span className="font-bold text-[#F4CD3F]">ACTIVE SENSOR SITES:</span>
                <span className="text-white/80">
                  {activeRegion !== 'All'
                    ? `FOCUSED ON ${activeRegion.toUpperCase()} CLUSTER`
                    : '5 REGIONAL CLUSTERS LINKED'}
                </span>
              </div>
              {activeRegion !== 'All' && (
                <button
                  type="button"
                  onClick={() => setActiveRegion('All')}
                  className="px-2 py-0.5 bg-[#F4CD3F] text-black font-bold text-[10px] hover:bg-white transition-colors"
                >
                  [ RESET TO ALL ]
                </button>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Detected Match Cards (SOURCE A, B, C) */}
          <div className="lg:col-span-5 flex flex-col gap-4 font-mono">
            <div className="font-mono text-xs font-black uppercase text-[#111111] flex items-center justify-between">
              <span>SUSPICIOUS DERIVATIVES DISCOVERED</span>
              <span className="text-[10px] text-[#844469]">CLICK TO INSPECT</span>
            </div>

            {DEMO_MATCHES.map((match) => {
              const isSelected = selectedMatch.id === match.id;
              const isCritical = match.riskLevel === 'critical';

              return (
                <div
                  key={match.id}
                  onClick={() => {
                    setSelectedMatch(match);
                    const targetRegion =
                      match.id === 'match_01'
                        ? 'India'
                        : match.id === 'match_02'
                        ? 'UK'
                        : 'USA';
                    setActiveRegion(targetRegion);
                    if (onSelectMatch) onSelectMatch(match);
                  }}
                  className={`border-[3px] border-[#111111] p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white shadow-[5px_5px_0px_#111111] translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-[#F7F3E8] hover:bg-white shadow-[2px_2px_0px_#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-black text-xs uppercase text-[#111111]">
                      {match.sourceName}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase border border-[#111111] ${
                      isCritical ? 'bg-[#D95D5D] text-white' : 'bg-[#F4CD3F] text-black'
                    }`}>
                      {match.matchPercentage}% MATCH
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#844469] mb-2">
                    {match.detectedManipulation}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-600 pt-2 border-t border-[#111111]/15">
                    <span>PLATFORM: {match.platform}</span>
                    <span className="text-black font-bold flex items-center gap-1">
                      VIEW EVIDENCE <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Drilldown Trigger to Incident Center */}
            <div className="mt-2 p-4 bg-[#844469] text-white border-[3px] border-[#111111] brutal-shadow-sm flex items-center justify-between">
              <div>
                <div className="font-bold text-xs uppercase">ACTIVE CASE OPENED</div>
                <div className="text-[10px] text-[#EFD99C]">Case #ARG-8291 assigned to Source A derivative.</div>
              </div>
              <a
                href="#incident-response"
                className="px-3 py-1.5 bg-[#F4CD3F] text-black font-mono text-xs font-black border-[2px] border-black brutal-btn"
              >
                OPEN CASE →
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
