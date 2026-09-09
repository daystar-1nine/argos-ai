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

export default function GlobalWatch({ onSelectMatch }: { onSelectMatch?: (match: DetectedMatch) => void }) {
  const [selectedMatch, setSelectedMatch] = useState<DetectedMatch>(DEMO_MATCHES[0]);
  const [activeRegion, setActiveRegion] = useState<string>('All');

  const regions = [
    { name: 'India', coords: { x: 70, y: 48 }, status: 'Active (4 nodes)' },
    { name: 'USA', coords: { x: 22, y: 35 }, status: 'Active (12 nodes)' },
    { name: 'UK', coords: { x: 48, y: 28 }, status: 'Active (6 nodes)' },
    { name: 'Singapore', coords: { x: 76, y: 56 }, status: 'Active (3 nodes)' },
    { name: 'Australia', coords: { x: 86, y: 72 }, status: 'Active (3 nodes)' }
  ];

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
          
          {/* Left 7 Cols: Interactive World Map with Regional Nodes */}
          <div className="lg:col-span-7 bg-[#111111] border-[4px] border-[#111111] brutal-shadow-xl p-5 text-[#EFD99C] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/20 font-mono text-xs">
                <span className="text-[#F4CD3F] font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  GLOBAL TELEMETRY SENSOR GRID
                </span>
                <span className="text-white/60 text-[10px]">
                  5 REGIONS ACTIVE
                </span>
              </div>

              {/* The SVG World Map with Pins */}
              <div className="relative aspect-[16/9] w-full bg-[#181d24] border-[2px] border-white/20 p-2 overflow-hidden">
                <div className="absolute inset-0 opacity-15 retro-grid" />
                
                {/* Simplified Continents Outline */}
                <svg className="w-full h-full text-white/15" viewBox="0 0 100 60">
                  {/* North America */}
                  <path d="M12,14 Q25,12 32,24 Q24,34 16,30 Z" fill="currentColor" />
                  {/* South America */}
                  <path d="M26,35 Q34,36 30,52 Q22,48 26,35 Z" fill="currentColor" />
                  {/* Europe */}
                  <path d="M44,14 Q54,12 56,25 Q46,28 44,14 Z" fill="currentColor" />
                  {/* Africa */}
                  <path d="M46,28 Q58,28 55,48 Q44,45 46,28 Z" fill="currentColor" />
                  {/* Asia */}
                  <path d="M58,12 Q82,10 84,34 Q66,38 58,12 Z" fill="currentColor" />
                  {/* Australia */}
                  <path d="M78,42 Q88,40 88,54 Q76,52 78,42 Z" fill="currentColor" />
                </svg>

                {/* Blinking Regional Markers */}
                {regions.map((reg) => (
                  <div
                    key={reg.name}
                    style={{ left: `${reg.coords.x}%`, top: `${reg.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                    onClick={() => setActiveRegion(reg.name)}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="w-3 h-3 bg-[#D95D5D] border border-white rounded-none led-blink" />
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] bg-black text-[#F4CD3F] px-1 py-0.2 whitespace-nowrap border border-white/30">
                        {reg.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Region Hubs Bar */}
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-2 font-mono text-[10px]">
              {regions.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setActiveRegion(r.name)}
                  className={`px-2.5 py-1 border border-white/30 ${
                    activeRegion === r.name ? 'bg-[#F4CD3F] text-black font-bold' : 'bg-black text-white/80'
                  }`}
                >
                  {r.name}: {r.status}
                </button>
              ))}
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
