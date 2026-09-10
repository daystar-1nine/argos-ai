'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Eye, Filter, AlertTriangle, ChevronRight, ShieldAlert, Search, Sparkles, Cpu, Play } from 'lucide-react';
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
      id: "live",
      assetId: "ARG-LIVE-NEURAL-01",
      risk: "REAL ML INFERENCE",
      riskLevel: "danger" as const,
      match: "LIVE PIPELINE",
      source: "Local / Web Client",
      sourceName: "PyTorch 11-Stage Forensic Lab",
      manipulationType: "Dual-Stream SyncNet + Multimodal Temporal Classifier",
      detectedAt: "Online & Ready",
      status: "Hardware Engine Active",
      anomalyBadge: "PROBLEM STATEMENT 4",
      isLive: true
    },
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
            subtitle="Suspected synthetic derivatives surfaced by public source crawlers, evaluated against original Media DNA root hashes and real-time temporal lip-sync models."
            actions={
              <Link
                href="/detections/live"
                className="px-4 py-2.5 bg-[#111111] hover:bg-[#844469] text-[#F4CD3F] border-[2px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-[#8BCF9B]" />
                LAUNCH REAL ML FORENSIC LAB →
              </Link>
            }
          />

          {/* Featured Real ML Pipeline Callout Banner */}
          <div className="bg-[#111111] text-[#F8E8E8] border-[3px] border-[#111111] brutal-shadow p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#F4CD3F] text-black font-black text-[10px] uppercase">
                  PROBLEM STATEMENT 4 LIVE
                </span>
                <span className="text-xs font-bold text-[#8BCF9B]">
                  GENUINE PYTORCH TEMPORAL LIP-SYNC ENGINE
                </span>
              </div>
              <h3 className="text-xl font-black uppercase font-display text-white">
                Audio-Visual Temporal Deepfake Detection Pipeline
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Upload any MP4 / MOV video to execute real 11-stage feature extraction: 96x96 lip ROI cropping, 80-band Mel spectrograms, 0.8s synchronized sliding windows, dual-stream 3D-CNN SyncNet embeddings, and frame-level anomaly evidence generation.
              </p>
            </div>

            <Link
              href="/detections/live"
              className="shrink-0 px-6 py-3.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-black border-[2.5px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              TEST VIDEO IN FORENSIC STUDIO →
            </Link>
          </div>

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
                className={`border-[3px] border-[#111111] brutal-shadow p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:translate-x-[-2px] transition-all ${
                  d.isLive ? 'bg-[#EFD99C]/50 border-l-[8px] border-l-[#844469]' : 'bg-white'
                }`}
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-[#111111] bg-[#EFD99C] px-2 py-0.5 border border-black">
                      {d.isLive ? 'LIVE ENGINE' : `MATCH: ${d.id}`}
                    </span>
                    <span className="text-xs text-[#844469] font-bold">
                      ASSET: {d.assetId}
                    </span>
                    <StatusBadge
                      status={d.riskLevel === 'critical' || d.riskLevel === 'danger' ? 'danger' : 'warning'}
                      label={d.isLive ? 'REAL ML PIPELINE ACTIVE' : `MANIPULATION RISK: ${d.risk}`}
                      pulsing={d.riskLevel === 'critical' || d.isLive}
                    />
                  </div>

                  <h3 className="text-lg font-black font-display uppercase tracking-tight">
                    {d.manipulationType}
                  </h3>

                  <div className="text-xs text-gray-600 flex flex-wrap gap-4">
                    <span>Source: <strong>{d.source}</strong></span>
                    <span>Consensus: <strong>{d.match}</strong></span>
                    <span>Status: <strong>{d.status}</strong></span>
                  </div>

                  <div className="text-xs font-bold text-[#844469]">
                    Mode: {d.anomalyBadge}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/detections/${d.id}`}
                    className={`px-5 py-3 border-[2.5px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-2 ${
                      d.isLive
                        ? 'bg-[#111111] text-[#F4CD3F] hover:bg-[#844469]'
                        : 'bg-[#F4CD3F] hover:bg-[#ffe066] text-black'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {d.isLive ? 'OPEN LIVE ML STUDIO →' : 'OPEN FORENSIC STUDIO →'}
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
