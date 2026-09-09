'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Bell, Search, Filter, CheckCircle2, AlertTriangle, Eye, Flag, ExternalLink } from 'lucide-react';
import { DEMO_ALERTS } from '@/lib/data';
import { AlertItem } from '@/lib/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(DEMO_ALERTS);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const markOneAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const filtered = alerts.filter(a => {
    const matchesQuery = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterSeverity === 'critical') return matchesQuery && a.severity === 'critical';
    if (filterSeverity === 'high') return matchesQuery && a.severity === 'high';
    if (filterSeverity === 'medium') return matchesQuery && a.severity === 'medium';
    return matchesQuery;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Alerts Center" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="TELEMETRY DISPATCH"
            badgeColor="red"
            title="ALERTS & NOTIFICATIONS"
            subtitle="Real-time warning dispatches triggered when monitored public streams identify derivatives breaching threshold parameters."
            actions={
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-[#EFD99C] hover:bg-white text-black border-[2px] border-[#111111] brutal-btn text-xs font-bold uppercase"
              >
                Mark All Read ✓
              </button>
            }
          />

          {/* Search & Filter Strip */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#EFD99C] border-[3px] border-[#111111] p-4 brutal-shadow-sm font-mono text-xs">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by title or asset..."
                className="w-full bg-white border-[2px] border-[#111111] p-2 pl-8 font-bold text-xs"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[10px] uppercase text-gray-700">Filter:</span>
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase ${
                  filterSeverity === 'all' ? 'bg-[#111111] text-[#F4CD3F]' : 'bg-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity('critical')}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase ${
                  filterSeverity === 'critical' ? 'bg-[#D95D5D] text-white' : 'bg-white'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterSeverity('high')}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase ${
                  filterSeverity === 'high' ? 'bg-[#F4CD3F] text-black' : 'bg-white'
                }`}
              >
                High
              </button>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`border-[3px] border-[#111111] p-5 brutal-shadow transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !item.isRead ? 'bg-[#F6C6D8]' : 'bg-white'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {!item.isRead && (
                      <span className="w-2.5 h-2.5 bg-[#D95D5D] rounded-full led-blink" />
                    )}
                    <span className="font-black text-sm uppercase text-[#111111]">
                      {item.title}
                    </span>
                    <StatusBadge
                      status={item.severity === 'critical' ? 'danger' : item.severity === 'high' ? 'warning' : 'info'}
                      label={item.severity.toUpperCase()}
                      pulsing={item.severity === 'critical'}
                    />
                    <span className="text-[10px] text-gray-600 font-mono">
                      {item.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-[#111111] font-medium leading-relaxed max-w-2xl">
                    {item.message}
                  </p>

                  <div className="text-[11px] text-[#844469] font-bold flex flex-wrap gap-4">
                    <span>Target: <strong>{item.assetId}</strong></span>
                    <span>Source: <strong>{item.sourceLabel}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    href={`/detections/match_01`}
                    onClick={() => markOneAsRead(item.id)}
                    className="px-3.5 py-2 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Evidence
                  </Link>

                  <Link
                    href={`/incidents/ARG-8291`}
                    onClick={() => markOneAsRead(item.id)}
                    className="px-3.5 py-2 bg-[#D95D5D] hover:bg-[#eb7373] text-white border-[2px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Open Case
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
