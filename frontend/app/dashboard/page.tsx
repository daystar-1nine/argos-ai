'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import BrutalistCard from '@/components/ui/BrutalistCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  Film, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  ExternalLink,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import { DEMO_MATCHES, DEMO_ASSET, DEMO_ALERTS } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Overview" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          {/* Welcome Greeting Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-[3px] border-[#111111]">
            <div>
              <div className="text-xs font-black text-[#844469] uppercase tracking-wider mb-1">
                SOVEREIGN DEFENSE WORKBENCH // OPERATOR NODE 01
              </div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase font-display tracking-tight">
                Good morning, Creator.
              </h1>
              <p className="text-xs text-gray-700 mt-1">
                Argos is monitoring 5 supported public, indexed and integrated sources for your registered media.
              </p>
            </div>

            <Link
              href="/protect"
              className="px-5 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              PROTECT NEW MEDIA
            </Link>
          </div>

          {/* The 4 KPI Stats: Protected Media, Active Monitoring, Potential Matches, High-Risk Alerts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* 1. Protected Media */}
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-5 brutal-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-700">
                <span>Protected Media</span>
                <Film className="w-4 h-4 text-[#844469]" />
              </div>
              <div className="my-3">
                <span className="text-4xl font-black font-display text-[#111111]">3</span>
                <span className="text-xs font-bold text-gray-600 ml-1">masters</span>
              </div>
              <div className="text-[10px] text-[#8BCF9B] font-bold flex items-center gap-1">
                ✓ ALL MEDIA DNA REGISTERED
              </div>
            </div>

            {/* 2. Active Monitoring */}
            <div className="bg-[#F6C6D8] border-[3px] border-[#111111] p-5 brutal-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-700">
                <span>Active Monitoring</span>
                <Globe className="w-4 h-4 text-[#844469]" />
              </div>
              <div className="my-3">
                <span className="text-4xl font-black font-display text-[#111111]">5</span>
                <span className="text-xs font-bold text-gray-600 ml-1">sources</span>
              </div>
              <div className="text-[10px] text-[#844469] font-bold flex items-center gap-1">
                ● 5 REGIONS ACTIVE
              </div>
            </div>

            {/* 3. Potential Matches */}
            <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-5 brutal-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-700">
                <span>Potential Matches</span>
                <Activity className="w-4 h-4 text-[#844469]" />
              </div>
              <div className="my-3">
                <span className="text-4xl font-black font-display text-[#844469]">6</span>
                <span className="text-xs font-bold text-gray-600 ml-1">derivatives</span>
              </div>
              <div className="text-[10px] text-[#844469] font-bold">
                ACROSS 3 PLATFORMS
              </div>
            </div>

            {/* 4. High-Risk Alerts */}
            <div className="bg-[#D95D5D] text-white border-[3px] border-[#111111] p-5 brutal-shadow flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-white/90">
                <span>High-Risk Alerts</span>
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="my-3">
                <span className="text-4xl font-black font-display text-white">2</span>
                <span className="text-xs font-bold text-white/80 ml-1">critical</span>
              </div>
              <div className="text-[10px] font-bold bg-black/40 px-2 py-0.5 inline-block">
                CASE #ARG-8291
              </div>
            </div>

          </div>

          {/* Large Cards: Threat Timeline & Recent Detections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Threat Timeline */}
            <div className="lg:col-span-8 bg-white border-[3px] border-[#111111] brutal-shadow-lg p-6 min-w-0">
              <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b-[2px] border-[#111111] gap-2">
                <div>
                  <h3 className="font-black text-sm uppercase text-[#111111] flex items-center gap-2 font-display">
                    <TrendingUp className="w-4 h-4 text-[#844469]" />
                    MEDIA THREAT TIMELINE
                  </h3>
                  <div className="text-[11px] text-gray-600">Chronological derivative discovery & anomaly velocity</div>
                </div>

                <div className="flex gap-2 text-xs">
                  <span className="bg-[#F8E8E8] border border-black px-2 py-0.5 font-bold">LAST 7 DAYS</span>
                  <span className="bg-[#F4CD3F] border border-black px-2 py-0.5 font-bold">REAL-TIME</span>
                </div>
              </div>

              {/* Threat Bars */}
              <div className="h-48 flex items-end gap-2 sm:gap-4 pt-4 pb-2 border-b border-[#111111]/20">
                {[
                  { day: 'Sep 04', height: 15, threats: 0, label: 'Clean' },
                  { day: 'Sep 05', height: 25, threats: 1, label: 'Transcode' },
                  { day: 'Sep 06', height: 20, threats: 0, label: 'Clean' },
                  { day: 'Sep 07', height: 35, threats: 1, label: 'Derivative' },
                  { day: 'Sep 08', height: 50, threats: 2, label: 'Lip-Sync' },
                  { day: 'Sep 09', height: 95, threats: 4, label: 'CRITICAL: Face Swap' },
                  { day: 'Sep 10', height: 80, threats: 3, label: 'Case Escalated' },
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black text-[#F4CD3F] text-[9px] px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10 border border-white">
                      {bar.label} ({bar.threats} events)
                    </div>
                    <div
                      className={`w-full transition-all duration-300 border border-[#111111] ${
                        bar.height > 60 ? 'bg-[#D95D5D]' : bar.height > 30 ? 'bg-[#F4CD3F]' : 'bg-[#8BCF9B]'
                      }`}
                      style={{ height: `${bar.height}%` }}
                    />
                    <span className="text-[9px] font-bold text-gray-600 mt-1">{bar.day}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-[10px] text-gray-600 gap-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#8BCF9B]" /> Clean Copy</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#F4CD3F]" /> Modified Transcode</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#D95D5D]" /> Deepfake Anomaly</span>
                </div>
                <span className="font-bold text-[#844469]">CRAWLER INTERVAL: 60 SECONDS</span>
              </div>
            </div>

            {/* Right 4 Cols: Media Protection Status & Global Exposure */}
            <div className="lg:col-span-4 space-y-6 min-w-0">
              
              {/* Media Protection Status */}
              <BrutalistCard
                variant="pink"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>MEDIA PROTECTION STATUS</span>
                    <ShieldCheck className="w-4 h-4 text-[#844469]" />
                  </div>
                }
              >
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-2.5 bg-white border border-[#111111] flex justify-between">
                    <span>Active Master:</span>
                    <span className="font-bold text-[#844469]">{DEMO_ASSET.id}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#111111] flex justify-between">
                    <span>Invisible Watermark:</span>
                    <span className="text-[#8BCF9B] font-bold">100% INTACT</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#111111] flex justify-between">
                    <span>C2PA Manifest:</span>
                    <span className="text-[#8BCF9B] font-bold">VALID & SIGNED</span>
                  </div>
                  <Link
                    href={`/media/${DEMO_ASSET.id}`}
                    className="block text-center py-2 bg-[#F4CD3F] border border-black font-bold uppercase text-[11px] hover:bg-white"
                  >
                    View Asset Lifecycle →
                  </Link>
                </div>
              </BrutalistCard>

              {/* Global Exposure Card */}
              <BrutalistCard
                variant="cream"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>GLOBAL EXPOSURE</span>
                    <Globe className="w-4 h-4 text-[#844469]" />
                  </div>
                }
              >
                <div className="space-y-2 text-xs font-mono">
                  <div className="text-[11px] text-gray-700">
                    "Monitoring supported public, indexed and integrated sources."
                  </div>
                  <div className="p-2 bg-white border border-[#111111] flex justify-between">
                    <span>Indexed Mirrors:</span>
                    <span className="font-black">6 matches</span>
                  </div>
                  <div className="p-2 bg-white border border-[#111111] flex justify-between">
                    <span>Fastest Crawl Node:</span>
                    <span className="font-bold text-[#8BCF9B]">India Hub (12ms)</span>
                  </div>
                  <Link
                    href="/monitor"
                    className="block text-center py-2 bg-[#111111] text-[#F4CD3F] border border-black font-bold uppercase text-[11px] hover:bg-[#844469]"
                  >
                    Open Global Watch Map →
                  </Link>
                </div>
              </BrutalistCard>

            </div>

          </div>

          {/* Recent Detections List */}
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-[2px] border-[#111111]">
              <h3 className="font-black text-sm uppercase text-[#111111] font-display">
                RECENT DETECTIONS ACROSS MONITORED FEEDS
              </h3>
              <Link
                href="/detections"
                className="text-xs font-bold text-[#844469] hover:underline uppercase flex items-center gap-1"
              >
                ALL DETECTIONS <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {DEMO_MATCHES.map((match) => (
                <div
                  key={match.id}
                  className="p-4 bg-white border-[2px] border-[#111111] flex flex-wrap items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="min-w-0">
                    <div className="font-black text-sm text-[#111111]">{match.sourceName}</div>
                    <div className="text-xs text-[#844469] font-bold mt-0.5">{match.detectedManipulation}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Discovered {match.discoveredAt} on {match.platform}</div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      status={match.riskLevel === 'critical' ? 'danger' : 'warning'}
                      label={`${match.matchPercentage}% MATCH`}
                      pulsing={match.riskLevel === 'critical'}
                    />

                    <Link
                      href={`/detections/${match.id}`}
                      className="px-3 py-1.5 bg-[#111111] hover:bg-[#844469] text-[#F4CD3F] font-bold uppercase text-xs transition-colors"
                    >
                      Inspect Forensics →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
