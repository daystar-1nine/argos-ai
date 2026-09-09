'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RetroLogo from '@/components/RetroLogo';
import AuthenticityGate from '@/components/AuthenticityGate';
import MediaDNAVisualizer from '@/components/MediaDNAVisualizer';
import AttackLab from '@/components/AttackLab';
import DeepfakeForensics from '@/components/DeepfakeForensics';
import GlobalWatch from '@/components/GlobalWatch';
import OwnerAlerts from '@/components/OwnerAlerts';
import IncidentResponse from '@/components/IncidentResponse';
import ForensicReportSection from '@/components/ForensicReportModal';
import PublicVerify from '@/components/PublicVerify';
import ProtectionWorkflow from '@/components/ProtectionWorkflow';
import { 
  LayoutDashboard, 
  Film, 
  ShieldCheck, 
  Globe, 
  Eye, 
  Bell, 
  Zap, 
  Scale, 
  FileText, 
  Search, 
  Settings, 
  LogOut, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Key, 
  Copy, 
  Plus, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_ALERTS, DEMO_MATCHES, DEMO_INCIDENT } from '@/lib/data';

type NavTab = 
  | 'overview' 
  | 'media' 
  | 'protect' 
  | 'monitor' 
  | 'detections' 
  | 'alerts' 
  | 'attack_lab' 
  | 'cases' 
  | 'reports' 
  | 'verify' 
  | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [userAssets, setUserAssets] = useState([
    {
      id: "ARG-2026-8A92F1",
      title: "CEO Keynote Speech & Product Release 2026",
      type: "4K Video (32.4s)",
      date: "2 days ago",
      dnaHash: "e3b0c442...996fb924",
      status: "Protected & Monitored",
      watermark: "Active (88%)",
      c2pa: "Valid",
      threats: 3
    },
    {
      id: "ARG-2026-4C19D2",
      title: "Independent Journalism Investigative Interview",
      type: "HD Video (45.0s)",
      date: "5 days ago",
      dnaHash: "7b4190fa...2201bc89",
      status: "Protected & Monitored",
      watermark: "Active (92%)",
      c2pa: "Valid",
      threats: 0
    },
    {
      id: "ARG-2026-9E88B0",
      title: "Cybersecurity Architecture Whiteboard Session",
      type: "High-Res Image (4K)",
      date: "1 day ago",
      dnaHash: "90da11cb...8819ff33",
      status: "Protected & Monitored",
      watermark: "Active (95%)",
      c2pa: "Valid",
      threats: 0
    }
  ]);

  const [apiKey, setApiKey] = useState('argos_live_sk_99a81f0927c3e100984');
  const [copiedKey, setCopiedKey] = useState(false);
  const [auditLogs, setAuditLogs] = useState([
    { id: "LOG-01", time: "10 mins ago", event: "Live monitoring ping across 5 regional clusters", status: "SUCCESS" },
    { id: "LOG-02", time: "3 hours ago", event: "High-Risk alert dispatched for Asset ARG-2026-8A92F1 (Source A)", status: "ALERT" },
    { id: "LOG-03", time: "4 hours ago", event: "C2PA Provenance Manifest signed for master asset", status: "VERIFIED" },
    { id: "LOG-04", time: "1 day ago", event: "Attack Lab resilience stress test completed (Resilience: 86/100)", status: "NOMINAL" },
  ]);

  const handleDeleteAsset = (id: string) => {
    if (confirm(`Are you sure you want to delete asset ${id} and cease all active monitoring?`)) {
      setUserAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'media', label: 'My Media', icon: Film },
    { id: 'protect', label: 'Protect', icon: ShieldCheck },
    { id: 'monitor', label: 'Monitor', icon: Globe },
    { id: 'detections', label: 'Detections', icon: Eye },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'attack_lab', label: 'Attack Lab', icon: Zap },
    { id: 'cases', label: 'Cases', icon: Scale },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'verify', label: 'Verify', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3E8] flex flex-col font-mono text-[#111111]">
      
      {/* Top Console Bar */}
      <header className="bg-[#111111] text-[#EFD99C] px-4 lg:px-8 py-3 border-b-[3px] border-[#111111] flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <RetroLogo size="sm" />
          </Link>
          <span className="hidden md:inline text-white/30">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-xs text-[#F4CD3F] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
            CONSOLE: SOVEREIGN OPERATOR
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="px-3 py-1 bg-[#EFD99C] text-black border border-black text-xs font-bold uppercase hover:bg-[#F4CD3F]"
          >
            Public Verify
          </Link>
          <Link
            href="/"
            className="px-3 py-1 bg-[#D95D5D] text-white border border-black text-xs font-bold uppercase hover:bg-[#eb7373] flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            Exit Console
          </Link>
        </div>
      </header>

      {/* Main Console Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 bg-[#EFD99C] border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#111111] p-4 flex flex-col justify-between shrink-0">
          <nav className="space-y-1.5">
            <div className="text-[10px] font-black uppercase text-[#111111]/70 px-2 mb-2">
              FORENSIC WORKBENCH
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 border-[2px] font-mono text-xs font-bold uppercase transition-all ${
                    isActive
                      ? 'bg-[#111111] text-[#F4CD3F] border-[#111111] shadow-[3px_3px_0px_#844469]'
                      : 'bg-white/80 text-[#111111] border-[#111111] hover:bg-[#F4CD3F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#D95D5D] text-white text-[9px] font-black px-1.5 py-0.2 rounded-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User badge */}
          <div className="mt-8 p-3 bg-white border-[2px] border-[#111111] text-[10px]">
            <div className="font-bold text-[#844469]">ORGANIZATION:</div>
            <div className="font-black text-black text-xs">Argos Sovereign Creator</div>
            <div className="text-gray-500 mt-1">C2PA CA: VALID DID</div>
          </div>
        </aside>

        {/* Viewport Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-6xl">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-[3px] border-[#111111]">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-display">
                    MEDIA THREAT RADAR
                  </h2>
                  <div className="text-xs text-gray-700 mt-1">
                    Continuous monitoring status across supported public and indexed feeds.
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('protect')}
                  className="px-4 py-2 bg-[#F4CD3F] hover:bg-[#ffe066] text-black border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  PROTECT NEW MEDIA
                </button>
              </div>

              {/* The 5 Dashboard KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* 1. Protected Assets */}
                <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
                  <div className="text-[10px] text-gray-600 uppercase font-bold">PROTECTED ASSETS</div>
                  <div className="text-3xl font-black font-display text-[#111111] mt-1">
                    {userAssets.length} <span className="text-xs font-mono font-normal">assets</span>
                  </div>
                  <div className="text-[9px] text-[#8BCF9B] font-bold mt-2 flex items-center gap-1">
                    ✓ ALL SEALS VALID
                  </div>
                </div>

                {/* 2. Active Monitoring */}
                <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
                  <div className="text-[10px] text-gray-600 uppercase font-bold">ACTIVE MONITORING</div>
                  <div className="text-3xl font-black font-display text-[#111111] mt-1">
                    5 <span className="text-xs font-mono font-normal">sources</span>
                  </div>
                  <div className="text-[9px] text-[#8BCF9B] font-bold mt-2 flex items-center gap-1">
                    ● ALL NODES ONLINE
                  </div>
                </div>

                {/* 3. New Alerts */}
                <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
                  <div className="text-[10px] text-gray-600 uppercase font-bold">NEW ALERTS</div>
                  <div className="text-3xl font-black font-display text-[#D95D5D] mt-1">
                    3 <span className="text-xs font-mono font-normal text-black">unread</span>
                  </div>
                  <div className="text-[9px] text-[#D95D5D] font-bold mt-2 flex items-center gap-1">
                    ⚠ ACTION REQUIRED
                  </div>
                </div>

                {/* 4. Potential Matches */}
                <div className="bg-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
                  <div className="text-[10px] text-gray-600 uppercase font-bold">POTENTIAL MATCHES</div>
                  <div className="text-3xl font-black font-display text-[#844469] mt-1">
                    6 <span className="text-xs font-mono font-normal text-black">derivatives</span>
                  </div>
                  <div className="text-[9px] text-[#844469] font-bold mt-2">
                    ACROSS 3 PLATFORMS
                  </div>
                </div>

                {/* 5. High-Risk Cases */}
                <div className="bg-[#D95D5D] text-white border-[3px] border-[#111111] p-4 brutal-shadow-sm">
                  <div className="text-[10px] uppercase font-bold opacity-90">HIGH-RISK CASES</div>
                  <div className="text-3xl font-black font-display mt-1">
                    2 <span className="text-xs font-mono font-normal">cases</span>
                  </div>
                  <div className="text-[9px] font-bold mt-2 bg-black/40 px-1 py-0.5 inline-block">
                    CASE #ARG-8291
                  </div>
                </div>

              </div>

              {/* Main Visual: MEDIA THREAT TIMELINE */}
              <div className="bg-white border-[4px] border-[#111111] brutal-shadow-xl p-6">
                <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b-[2px] border-[#111111] gap-2">
                  <div>
                    <span className="font-black text-sm uppercase text-[#111111] flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#844469]" />
                      MEDIA THREAT TIMELINE
                    </span>
                    <div className="text-[10px] text-gray-600">Chronological derivative discovery & anomaly spikes</div>
                  </div>

                  <div className="flex gap-2 text-xs">
                    <span className="bg-[#F7F3E8] border border-black px-2 py-0.5 font-bold">LAST 7 DAYS</span>
                    <span className="bg-[#F4CD3F] border border-black px-2 py-0.5 font-bold">REAL-TIME</span>
                  </div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="h-44 flex items-end gap-2 sm:gap-4 pt-4 pb-2 border-b border-[#111111]/20">
                  {[
                    { day: 'Sep 04', height: 15, threats: 0, label: 'Clean' },
                    { day: 'Sep 05', height: 25, threats: 1, label: 'Transcode' },
                    { day: 'Sep 06', height: 20, threats: 0, label: 'Clean' },
                    { day: 'Sep 07', height: 35, threats: 1, label: 'Derivative' },
                    { day: 'Sep 08', height: 50, threats: 2, label: 'Lip-Sync' },
                    { day: 'Sep 09', height: 95, threats: 4, label: 'CRITICAL: Face Swap' },
                    { day: 'Sep 10', height: 80, threats: 3, label: 'Case Escalated' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black text-[#F4CD3F] font-mono text-[9px] px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-10 border border-white">
                        {bar.label} ({bar.threats} events)
                      </div>
                      <div
                        className={`w-full transition-all duration-300 border border-[#111111] ${
                          bar.height > 60
                            ? 'bg-[#D95D5D]'
                            : bar.height > 30
                            ? 'bg-[#F4CD3F]'
                            : 'bg-[#8BCF9B]'
                        }`}
                        style={{ height: `${bar.height}%` }}
                      />
                      <span className="text-[9px] font-bold text-gray-600 mt-1">{bar.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#8BCF9B]" /> Normal / Clean</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#F4CD3F]" /> Modified Copy</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#D95D5D]" /> Deepfake Anomaly</span>
                  </div>
                  <span className="font-bold text-[#844469]">CRAWLER SYNC FREQUENCY: 60 SECONDS</span>
                </div>
              </div>

              {/* Recent Detections Quick Table */}
              <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-5 brutal-shadow">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#111111]">
                  <span className="font-black text-xs uppercase text-[#111111]">
                    LATEST SUSPECT MATCHES ACROSS PUBLIC SOURCES
                  </span>
                  <button
                    onClick={() => setActiveTab('monitor')}
                    className="text-xs font-bold text-[#844469] hover:underline uppercase"
                  >
                    VIEW ALL →
                  </button>
                </div>

                <div className="space-y-2">
                  {DEMO_MATCHES.map((match) => (
                    <div
                      key={match.id}
                      className="p-3 bg-white border-[2px] border-[#111111] flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-black text-[#111111]">{match.sourceName}</div>
                        <div className="text-[11px] text-[#844469] font-bold">{match.detectedManipulation}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 font-bold text-[10px] ${
                          match.riskLevel === 'critical' ? 'bg-[#D95D5D] text-white' : 'bg-[#F4CD3F] text-black'
                        }`}>
                          {match.matchPercentage}% MATCH
                        </span>
                        <button
                          onClick={() => setActiveTab('detections')}
                          className="px-2.5 py-1 bg-[#111111] text-[#F4CD3F] font-bold text-[10px] hover:bg-[#844469] transition-colors"
                        >
                          FORENSIC INSPECT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MY MEDIA (Vault) */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-[3px] border-[#111111]">
                <div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-display">
                    MY MEDIA VAULT
                  </h2>
                  <div className="text-xs text-gray-700 mt-1">
                    Your authenticated original assets protected with cryptographic Media DNA & C2PA credentials.
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('protect')}
                  className="px-4 py-2 bg-[#F4CD3F] text-black border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  PROTECT NEW MEDIA
                </button>
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="bg-white border-[3px] border-[#111111] brutal-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Asset Header */}
                      <div className="p-3 bg-[#EFD99C] border-b-[2px] border-[#111111] flex items-center justify-between text-xs font-black">
                        <span>{asset.id}</span>
                        <span className="bg-[#8BCF9B] text-black px-1.5 py-0.2 text-[9px]">
                          {asset.c2pa} C2PA
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        <h4 className="font-black text-sm text-[#111111] line-clamp-2">
                          {asset.title}
                        </h4>

                        <div className="text-xs text-gray-600 space-y-1 font-mono">
                          <div><strong>Type:</strong> {asset.type}</div>
                          <div><strong>Registered:</strong> {asset.date}</div>
                          <div className="text-[10px] break-all bg-[#F7F3E8] p-1 border border-gray-300">
                            <strong>DNA:</strong> {asset.dnaHash}
                          </div>
                          <div><strong>Watermark:</strong> <span className="text-[#8BCF9B] font-bold">{asset.watermark}</span></div>
                        </div>

                        {asset.threats > 0 && (
                          <div className="p-2 bg-[#D95D5D]/20 border border-[#D95D5D] text-[#D95D5D] text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {asset.threats} suspicious derivative match(es) detected
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-3 bg-[#F7F3E8] border-t-[2px] border-[#111111] flex items-center justify-between text-xs">
                      <Link
                        href={`/verify`}
                        className="font-bold text-[#844469] hover:underline"
                      >
                        Verify Provenance →
                      </Link>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-[#D95D5D] hover:text-black transition-colors"
                        title="Delete asset from vault (Security Deletion Control)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROTECT WORKFLOW */}
          {activeTab === 'protect' && (
            <div className="max-w-5xl">
              <ProtectionWorkflow onComplete={() => setActiveTab('monitor')} />
            </div>
          )}

          {/* TAB 4: MONITOR (Global Watch) */}
          {activeTab === 'monitor' && (
            <div className="max-w-6xl">
              <GlobalWatch onSelectMatch={() => setActiveTab('detections')} />
            </div>
          )}

          {/* TAB 5: DETECTIONS & FORENSICS */}
          {activeTab === 'detections' && (
            <div className="max-w-6xl">
              <DeepfakeForensics onOpenReport={() => setActiveTab('reports')} />
            </div>
          )}

          {/* TAB 6: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="max-w-6xl">
              <OwnerAlerts 
                onViewEvidence={() => setActiveTab('detections')}
                onOpenReport={() => setActiveTab('cases')}
              />
            </div>
          )}

          {/* TAB 7: ATTACK LAB */}
          {activeTab === 'attack_lab' && (
            <div className="max-w-6xl">
              <AttackLab />
            </div>
          )}

          {/* TAB 8: CASES & INCIDENT RESPONSE */}
          {activeTab === 'cases' && (
            <div className="max-w-6xl">
              <IncidentResponse onOpenReportModal={() => setActiveTab('reports')} />
            </div>
          )}

          {/* TAB 9: REPORTS (Forensic Dossier) */}
          {activeTab === 'reports' && (
            <div className="max-w-5xl">
              <ForensicReportSection />
            </div>
          )}

          {/* TAB 10: VERIFY */}
          {activeTab === 'verify' && (
            <div className="max-w-4xl">
              <PublicVerify />
            </div>
          )}

          {/* TAB 11: SETTINGS & SECURITY */}
          {activeTab === 'settings' && (
            <div className="space-y-8 max-w-4xl font-mono text-xs">
              <div className="pb-4 border-b-[3px] border-[#111111]">
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight font-display">
                  SECURITY & CONFIGURATION
                </h2>
                <div className="text-xs text-gray-700 mt-1">
                  Manage API keys, C2PA signing authority identities, audit logs, and account deletion.
                </div>
              </div>

              {/* API Key Management */}
              <div className="bg-white border-[3px] border-[#111111] p-6 brutal-shadow-sm space-y-4">
                <div className="font-black text-sm uppercase text-[#111111] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#844469]" />
                  ARGOS FORENSIC API ACCESS KEY
                </div>
                <div className="text-gray-600">
                  Use this secret key to integrate Argos Authenticity Gate and Media DNA generation into your CI/CD media processing pipelines.
                </div>

                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    readOnly
                    className="flex-1 bg-gray-100 border-[2px] border-[#111111] p-2 font-mono text-xs"
                  />
                  <button
                    onClick={copyApiKey}
                    className="px-4 py-2 bg-[#F4CD3F] border-[2px] border-[#111111] font-bold uppercase hover:bg-white transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedKey ? "COPIED" : "COPY KEY"}
                  </button>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="bg-white border-[3px] border-[#111111] p-6 brutal-shadow-sm space-y-3">
                <div className="font-black text-sm uppercase text-[#111111] pb-2 border-b border-[#111111]/20">
                  IMMUTABLE SECURITY AUDIT TRAIL
                </div>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 bg-[#F7F3E8] border border-gray-300 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-[#844469] mr-2">{log.id}</span>
                        <span>{log.event}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-[10px]">{log.time}</span>
                        <span className={`px-1.5 py-0.2 font-bold text-[9px] ${
                          log.status === 'ALERT' ? 'bg-[#D95D5D] text-white' : 'bg-[#8BCF9B] text-black'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Deletion Controls (Security Requirement 27) */}
              <div className="bg-[#D95D5D]/10 border-[3px] border-[#D95D5D] p-6 brutal-shadow-sm space-y-3">
                <div className="font-black text-sm uppercase text-[#D95D5D]">
                  DANGER ZONE // COMPLETE MEDIA & MONITORING DELETION
                </div>
                <div className="text-gray-700 leading-relaxed">
                  Per strict Argos security and privacy policies, you have sovereign rights to purge your registered media, 
                  erase Media DNA feature vectors, and cancel all automated crawlers across supported public indexed sources.
                </div>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to permanently purge all registered media and monitoring records? This action is irreversible.")) {
                      setUserAssets([]);
                      alert("All registered media and monitoring records have been securely purged from the Argos ledger.");
                    }
                  }}
                  className="px-4 py-2 bg-[#D95D5D] hover:bg-black text-white border-[2px] border-black font-bold uppercase text-xs"
                >
                  PURGE ALL ASSETS & MONITORING RECORDS
                </button>
              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
