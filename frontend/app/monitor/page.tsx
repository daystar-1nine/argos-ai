'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Globe, Search, ExternalLink, ChevronRight, Eye, AlertTriangle } from 'lucide-react';
import { DEMO_MATCHES, DEMO_MONITORING_SOURCES } from '@/lib/data';

export default function MonitorPage() {
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = [
    { name: 'India', coords: { x: 70, y: 48 }, nodes: '4 active nodes' },
    { name: 'USA', coords: { x: 22, y: 35 }, nodes: '12 active nodes' },
    { name: 'UK', coords: { x: 48, y: 28 }, nodes: '6 active nodes' },
    { name: 'Singapore', coords: { x: 76, y: 56 }, nodes: '3 active nodes' },
    { name: 'Australia', coords: { x: 86, y: 72 }, nodes: '3 active nodes' }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Argos Global Watch" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="TELEMETRY SENSOR GRID"
            badgeColor="mauve"
            title="ARGOS GLOBAL WATCH"
            subtitle='"Monitoring supported public, indexed and integrated sources."'
            actions={
              <div className="p-2.5 bg-white border-[2px] border-[#111111] text-xs font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#8BCF9B] rounded-full led-blink" />
                <span>5 CLUSTERS SYNCING</span>
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
              <div className="text-3xl font-black font-display mt-1">6 found</div>
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

          {/* Interactive World Map Section */}
          <div className="bg-[#111111] border-[4px] border-[#111111] brutal-shadow-lg p-6 text-[#EFD99C]">
            <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-white/20 text-xs">
              <span className="font-bold text-[#F4CD3F] flex items-center gap-2">
                <Globe className="w-4 h-4" /> REGIONAL TELEMETRY MAP (CLICK PIN TO FILTER)
              </span>
              <span className="text-white/60 text-[10px]">
                SCOPE: SUPPORTED INDEXED WEB SOURCES
              </span>
            </div>

            {/* SVG Map */}
            <div className="relative aspect-[21/9] w-full bg-[#181d24] border border-white/20 p-2 overflow-hidden">
              <div className="absolute inset-0 opacity-15 retro-grid" />
              
              <svg className="w-full h-full text-white/15" viewBox="0 0 100 60">
                <path d="M12,14 Q25,12 32,24 Q24,34 16,30 Z" fill="currentColor" />
                <path d="M26,35 Q34,36 30,52 Q22,48 26,35 Z" fill="currentColor" />
                <path d="M44,14 Q54,12 56,25 Q46,28 44,14 Z" fill="currentColor" />
                <path d="M46,28 Q58,28 55,48 Q44,45 46,28 Z" fill="currentColor" />
                <path d="M58,12 Q82,10 84,34 Q66,38 58,12 Z" fill="currentColor" />
                <path d="M78,42 Q88,40 88,54 Q76,52 78,42 Z" fill="currentColor" />
              </svg>

              {regions.map((reg) => (
                <div
                  key={reg.name}
                  style={{ left: `${reg.coords.x}%`, top: `${reg.coords.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  onClick={() => setSelectedRegion(reg.name)}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-3 h-3 bg-[#D95D5D] border border-white led-blink" />
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] bg-black text-[#F4CD3F] px-1 py-0.2 whitespace-nowrap border border-white/30">
                      {reg.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Region Switcher Buttons */}
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap gap-2 text-[10px]">
              <button
                onClick={() => setSelectedRegion('All')}
                className={`px-2.5 py-1 border border-white/30 ${selectedRegion === 'All' ? 'bg-[#F4CD3F] text-black font-bold' : 'bg-black text-white/80'}`}
              >
                All Regions
              </button>
              {regions.map((r) => (
                <button
                  key={r.name}
                  onClick={() => setSelectedRegion(r.name)}
                  className={`px-2.5 py-1 border border-white/30 ${selectedRegion === r.name ? 'bg-[#F4CD3F] text-black font-bold' : 'bg-black text-white/80'}`}
                >
                  {r.name} ({r.nodes})
                </button>
              ))}
            </div>
          </div>

          {/* Results Table: Source, Match %, Status, Manipulation, Detected, Action */}
          <div className="bg-white border-[3px] border-[#111111] brutal-shadow overflow-x-auto">
            <div className="p-4 bg-[#EFD99C] border-b-[2px] border-[#111111] flex items-center justify-between text-xs font-black uppercase">
              <span>SUSPICIOUS DERIVATIVES DISCOVERED</span>
              <span className="text-gray-600">3 ACTIVE PLATFORMS</span>
            </div>

            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8E8E8] border-b border-[#111111] text-[10px] font-black uppercase text-gray-700">
                  <th className="p-3">Source</th>
                  <th className="p-3">Match %</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Manipulation</th>
                  <th className="p-3">Detected</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111111]/20">
                {DEMO_MATCHES.map((match) => (
                  <tr key={match.id} className="hover:bg-[#F6C6D8]/30 transition-colors">
                    <td className="p-3 font-bold">
                      <div>{match.sourceName}</div>
                      <div className="text-[10px] text-gray-500">{match.platform}</div>
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

        </div>
      </div>
    </div>
  );
}
