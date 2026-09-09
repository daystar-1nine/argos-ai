'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import BrutalistCard from '@/components/ui/BrutalistCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Film, ShieldCheck, Globe, AlertTriangle, Plus, ChevronRight, Search, Filter } from 'lucide-react';
import { DEMO_ASSET } from '@/lib/data';

export default function MyMediaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const assets = [
    {
      id: "ARG-2026-8A92F1",
      title: "CEO Keynote Speech & Product Release 2026",
      mediaType: "4K Video (32.4s)",
      date: "Sep 08, 2026",
      protectionStatus: "Active",
      monitoringStatus: "Online (5 sources)",
      lastScan: "Just now",
      riskStatus: "critical",
      riskLabel: "HIGH RISK (93%)",
      thumbnail: "🎬",
      threats: 3
    },
    {
      id: "ARG-2026-4C19D2",
      title: "Independent Journalism Investigative Interview",
      mediaType: "HD Video (45.0s)",
      date: "Sep 05, 2026",
      protectionStatus: "Active",
      monitoringStatus: "Online (5 sources)",
      lastScan: "4 mins ago",
      riskStatus: "valid",
      riskLabel: "CLEAN (0 Threats)",
      thumbnail: "🎙",
      threats: 0
    },
    {
      id: "ARG-2026-9E88B0",
      title: "Cybersecurity Architecture Whiteboard Session",
      mediaType: "High-Res Image (4K)",
      date: "Sep 09, 2026",
      protectionStatus: "Active",
      monitoringStatus: "Online (5 sources)",
      lastScan: "12 mins ago",
      riskStatus: "valid",
      riskLabel: "CLEAN (0 Threats)",
      thumbnail: "📐",
      threats: 0
    }
  ];

  const filtered = assets.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'threats') return matchesSearch && a.threats > 0;
    if (filterType === 'clean') return matchesSearch && a.threats === 0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="My Media Vault" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="SOVEREIGN VAULT"
            badgeColor="mauve"
            title="MY PROTECTED MEDIA"
            subtitle="Secure registry of original assets equipped with Media DNA fingerprints, invisible watermarks, and continuous public source surveillance."
            actions={
              <Link
                href="/protect"
                className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                PROTECT NEW MEDIA
              </Link>
            }
          />

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#EFD99C] border-[3px] border-[#111111] p-4 brutal-shadow-sm font-mono text-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Title or Asset ID..."
                className="w-full bg-white border-[2px] border-[#111111] p-2 pl-8 font-bold text-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] uppercase text-gray-700">Filter:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase ${
                  filterType === 'all' ? 'bg-[#111111] text-[#F4CD3F]' : 'bg-white'
                }`}
              >
                All ({assets.length})
              </button>
              <button
                onClick={() => setFilterType('threats')}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase ${
                  filterType === 'threats' ? 'bg-[#D95D5D] text-white' : 'bg-white'
                }`}
              >
                Threats Flagged (1)
              </button>
              <button
                onClick={() => setFilterType('clean')}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase ${
                  filterType === 'clean' ? 'bg-[#8BCF9B] text-black' : 'bg-white'
                }`}
              >
                Clean (2)
              </button>
            </div>
          </div>

          {/* Media Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((asset) => (
              <Link
                key={asset.id}
                href={`/media/${asset.id}`}
                className="group block"
              >
                <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_#111111] transition-all flex flex-col justify-between h-full">
                  
                  {/* Card Top / Thumbnail Header */}
                  <div>
                    <div className="p-3.5 bg-white border-b-[2px] border-[#111111] flex items-center justify-between text-xs font-black">
                      <span className="bg-[#111111] text-[#F4CD3F] px-2 py-0.5 font-mono">
                        {asset.id}
                      </span>
                      <StatusBadge
                        status={asset.riskStatus === 'critical' ? 'danger' : 'valid'}
                        label={asset.riskLabel}
                        pulsing={asset.riskStatus === 'critical'}
                      />
                    </div>

                    {/* Visual Media Graphic Placeholder */}
                    <div className="aspect-[16/9] bg-[#1c1822] border-b-[2px] border-[#111111] flex items-center justify-center text-4xl p-4 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 retro-grid" />
                      <span className="relative z-10">{asset.thumbnail}</span>
                      <div className="absolute bottom-2 left-2 bg-black/80 text-[#EFD99C] text-[9px] font-mono px-2 py-0.5 border border-white/20">
                        {asset.mediaType}
                      </div>
                    </div>

                    {/* Metadata Body */}
                    <div className="p-4 space-y-2.5 font-mono text-xs">
                      <h3 className="font-black text-sm text-[#111111] line-clamp-2 font-display">
                        {asset.title}
                      </h3>

                      <div className="space-y-1 text-gray-700 text-[11px] pt-1 border-t border-[#111111]/20">
                        <div className="flex justify-between">
                          <span>Protection:</span>
                          <span className="font-bold text-[#8BCF9B]">✓ {asset.protectionStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monitoring:</span>
                          <span className="font-bold text-[#844469]">{asset.monitoringStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Scan:</span>
                          <span className="text-gray-600">{asset.lastScan}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-3 bg-white border-t-[2px] border-[#111111] flex items-center justify-between text-xs font-bold text-[#844469] group-hover:text-black">
                    <span>INSPECT LIFECYCLE</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>

                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
