'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Eye, Filter, AlertTriangle, ChevronRight, ShieldAlert, Search } from 'lucide-react';
import { DEMO_MATCHES } from '@/lib/data';

export default function DetectionsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = [
    'All',
    'High Risk',
    'Medium',
    'Low',
    'Face Manipulation',
    'Lip-Sync',
    'Audio Manipulation',
  ];

  const detections = [
    {
      id: "match_01",
      assetId: "ARG-2026-8A92F1",
      risk: "93.0%",
      riskLevel: "critical" as const,
      match: "94.2%",
      source: "X (Public Relay)",
      sourceName: "Microblogging Stream",
      manipulationType: "Face Swap + Voice Clone",
      detectedAt: "3 hours ago",
      status: "Escalated to Case #ARG-8291",
      anomalyBadge: "LIP-SYNC +320ms"
    },
    {
      id: "match_02",
      assetId: "ARG-2026-8A92F1",
      risk: "87.5%",
      riskLevel: "danger" as const,
      match: "87.5%",
      source: "TikTok (Indexed Mirror)",
      sourceName: "Short-Form Video Search Stream",
      manipulationType: "Lip-Sync Temporal Lag",
      detectedAt: "8 hours ago",
      status: "Under Investigation",
      anomalyBadge: "VISEME MISMATCH"
    },
    {
      id: "match_03",
      assetId: "ARG-2026-8A92F1",
      risk: "42.0%",
      riskLevel: "warning" as const,
      match: "79.1%",
      source: "YouTube (Public Index)",
      sourceName: "Video Index Alpha",
      manipulationType: "20% Crop + Re-encode",
      detectedAt: "14 hours ago",
      status: "Watermark Intact",
      anomalyBadge: "BENIGN TRANSCODE"
    }
  ];

  const filtered = detections.filter(d => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'High Risk') return d.riskLevel === 'critical' || d.riskLevel === 'danger';
    if (activeFilter === 'Medium') return d.riskLevel === 'warning';
    if (activeFilter === 'Face Manipulation') return d.manipulationType.includes('Face');
    if (activeFilter === 'Lip-Sync') return d.manipulationType.includes('Lip-Sync');
    if (activeFilter === 'Audio Manipulation') return d.manipulationType.includes('Voice') || d.manipulationType.includes('Audio');
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Forensic Detections" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="MULTI-MODEL ENSEMBLE"
            badgeColor="mauve"
            title="DEEPFAKE DETECTIONS"
            subtitle="Suspected synthetic derivatives surfaced by public source crawlers, evaluated against original Media DNA root hashes."
          />

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 pb-4 border-b border-[#111111]/20">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`px-3 py-1.5 border-[2px] border-[#111111] text-xs font-bold uppercase transition-all ${
                  activeFilter === opt
                    ? 'bg-[#111111] text-[#F4CD3F] shadow-[2px_2px_0px_#844469]'
                    : 'bg-[#EFD99C] hover:bg-white text-black'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Detections Cards & Table */}
          <div className="space-y-4">
            {filtered.map((d) => (
              <div
                key={d.id}
                className="bg-white border-[3px] border-[#111111] brutal-shadow p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:translate-x-[-2px] transition-all"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-[#111111] bg-[#EFD99C] px-2 py-0.5 border border-black">
                      MATCH: {d.id}
                    </span>
                    <span className="text-xs text-[#844469] font-bold">
                      ASSET: {d.assetId}
                    </span>
                    <StatusBadge
                      status={d.riskLevel === 'critical' || d.riskLevel === 'danger' ? 'danger' : 'warning'}
                      label={`MANIPULATION RISK: ${d.risk}`}
                      pulsing={d.riskLevel === 'critical'}
                    />
                  </div>

                  <h3 className="text-lg font-black font-display uppercase tracking-tight">
                    {d.manipulationType} on {d.sourceName}
                  </h3>

                  <div className="text-xs text-gray-600 flex flex-wrap gap-4">
                    <span>Source: <strong>{d.source}</strong></span>
                    <span>DNA Match: <strong>{d.match}</strong></span>
                    <span>Discovered: <strong>{d.detectedAt}</strong></span>
                  </div>

                  <div className="text-xs font-bold text-[#844469]">
                    Status: {d.status}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/detections/${d.id}`}
                    className="px-5 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-black border-[2.5px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    OPEN FORENSIC STUDIO →
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
