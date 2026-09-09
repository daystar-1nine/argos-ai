'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import BrutalistCard from '@/components/ui/BrutalistCard';
import { Key, Copy, Shield, Bell, Trash2, Check, ExternalLink, Zap, Eye, Activity } from 'lucide-react';
import ArgosLoader from '@/components/ui/ArgosLoader';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('argos_live_sk_99a81f0927c3e100984');
  const [copiedKey, setCopiedKey] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://api.creator-network.io/webhooks/argos');
  const [purged, setPurged] = useState(false);
  const [showBootLoader, setShowBootLoader] = useState(false);
  const [showAnalysisDemo, setShowAnalysisDemo] = useState(false);


  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePurgeAll = () => {
    if (confirm("WARNING: Are you sure you want to permanently delete all registered media assets, Media DNA signatures, and monitoring records? This action is irreversible.")) {
      setPurged(true);
      alert("All registered assets and monitoring records have been permanently purged from the Argos ledger.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="User Settings" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="CONFIGURATION"
            badgeColor="dark"
            title="SETTINGS & SECURITY"
            subtitle="Manage your operator profile, C2PA cryptographic identity, notification webhooks, API access tokens, and sovereign data deletion controls."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: Profile, API & Webhooks */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Profile Card */}
              <BrutalistCard
                variant="cream"
                header={<span>OPERATOR PROFILE</span>}
              >
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">Organization / Creator Identity:</label>
                    <input
                      type="text"
                      defaultValue="Argos Sovereign Creator Network"
                      className="w-full bg-white border-[2px] border-[#111111] p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">Contact Email for Forensic Dispatches:</label>
                    <input
                      type="email"
                      defaultValue="security@creator-network.io"
                      className="w-full bg-white border-[2px] border-[#111111] p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">C2PA Sovereign Issuer DID:</label>
                    <div className="p-2 bg-white border border-[#111111] text-[11px] text-[#844469] font-bold">
                      did:argos:sig-7b2f901a
                    </div>
                  </div>
                </div>
              </BrutalistCard>

              {/* API Access Card */}
              <BrutalistCard
                variant="pink"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>API ACCESS TOKEN</span>
                    <Key className="w-4 h-4 text-[#844469]" />
                  </div>
                }
              >
                <div className="space-y-3 font-mono text-xs">
                  <p className="text-gray-700">
                    Use this secret key to authenticate programmatically with the Argos REST API for automated Media DNA hashing and watermark encoding.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      readOnly
                      className="flex-1 bg-white border-[2px] border-[#111111] p-2 font-mono text-xs"
                    />
                    <button
                      onClick={copyApiKey}
                      className="px-4 py-2 bg-[#F4CD3F] hover:bg-[#ffe066] border-[2px] border-[#111111] brutal-btn font-bold text-xs flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? "COPIED" : "COPY"}
                    </button>
                  </div>
                </div>
              </BrutalistCard>

              {/* Webhook Dispatch Card */}
              <BrutalistCard
                variant="cream"
                header={<span>DISPATCH NOTIFICATIONS & WEBHOOKS</span>}
              >
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white border border-[#111111]">
                    <span>Email alerts on Critical Detections (&gt;85% risk):</span>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#844469]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-600 block mb-1">Webhook Endpoint URL:</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full bg-white border-[2px] border-[#111111] p-2 text-xs"
                    />
                  </div>
                </div>
              </BrutalistCard>

            </div>

            {/* Right 5 Cols: Security & Data Deletion */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Security Audit Trail */}
              <div className="bg-white border-[3px] border-[#111111] brutal-shadow p-5 font-mono text-xs">
                <div className="font-black uppercase text-[#111111] pb-2 border-b border-[#111111]/20 mb-3">
                  SECURITY AUDIT TRAIL
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 bg-[#F8E8E8] border border-gray-300">
                    <div className="font-bold text-[#844469]">C2PA Root Authority Verified</div>
                    <div className="text-gray-500 text-[9px]">10 mins ago • Nominal</div>
                  </div>
                  <div className="p-2 bg-[#F8E8E8] border border-gray-300">
                    <div className="font-bold text-[#D95D5D]">High-Risk Match Flagged</div>
                    <div className="text-gray-500 text-[9px]">3 hours ago • Case #ARG-8291</div>
                  </div>
                  <div className="p-2 bg-[#F8E8E8] border border-gray-300">
                    <div className="font-bold text-[#8BCF9B]">Media DNA Entropy Computed</div>
                    <div className="text-gray-500 text-[9px]">2 days ago • Entropy: 0.962</div>
                  </div>
                </div>
              </div>

              {/* Forensic Boot & Engine Experience Card */}
              <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-5 font-mono text-xs space-y-3">
                <div className="font-black uppercase text-[#111111] flex items-center justify-between pb-2 border-b border-[#111111]/20">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#844469]" />
                    FORENSIC ENGINE EXPERIENCE
                  </span>
                  <span className="text-[9px] bg-[#111111] text-[#F4CD3F] px-1.5 py-0.5 font-bold">
                    INTERACTIVE
                  </span>
                </div>
                <p className="text-[#111111]/80 text-[11px] leading-relaxed">
                  Trigger the cinematic Y2K boot sequence or launch the deep multi-model forensic analysis visualizer directly.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => setShowBootLoader(true)}
                    className="w-full py-2.5 bg-[#F4CD3F] hover:bg-white text-[#111111] border-[2px] border-[#111111] brutal-btn font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    REPLAY CINEMATIC SYSTEM BOOT (2.2s)
                  </button>
                  <button
                    onClick={() => setShowAnalysisDemo(true)}
                    className="w-full py-2.5 bg-[#844469] hover:bg-[#111111] text-[#EFD99C] border-[2px] border-[#111111] brutal-btn font-bold uppercase text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    LAUNCH FORENSIC SCANNER DEMO
                  </button>
                </div>
              </div>

              {/* Data Deletion Controls (Requirement 27) */}
              <div className="bg-[#D95D5D]/15 border-[3px] border-[#D95D5D] p-5 brutal-shadow font-mono text-xs space-y-3">
                <div className="font-black uppercase text-[#D95D5D] flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  PERMANENT MEDIA & MONITORING DELETION
                </div>
                <p className="text-gray-700 leading-relaxed text-[11px]">
                  Under Argos sovereign privacy protocols, rights holders maintain permanent control. 
                  Purging your account permanently erases your registered Media DNA signatures and terminates 
                  all automated crawlers across supported public feeds.
                </p>

                <button
                  onClick={handlePurgeAll}
                  className="w-full py-2.5 bg-[#D95D5D] hover:bg-black text-white border-[2px] border-black brutal-btn font-bold uppercase text-xs"
                >
                  {purged ? "ASSETS PURGED ✓" : "PURGE ALL MEDIA & MONITORING RECORDS"}
                </button>
              </div>

            </div>

          </div>

          {/* Conditional Loaders */}
          {showBootLoader && (
            <ArgosLoader 
              variant="initial" 
              forceShow={true} 
              onComplete={() => setShowBootLoader(false)} 
            />
          )}

          {showAnalysisDemo && (
            <ArgosLoader 
              variant="analysis" 
              targetName="sony_fx6_camera_sensor_stream.raw" 
              duration={2500} 
              onClose={() => setShowAnalysisDemo(false)} 
              onComplete={() => setShowAnalysisDemo(false)} 
            />
          )}


        </div>
      </div>
    </div>
  );
}
