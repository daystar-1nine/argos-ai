'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Scale, ChevronRight, FileCheck, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DEMO_INCIDENT } from '@/lib/data';
import ProFeatureGate from '@/components/ui/ProFeatureGate';
import { useProfile } from '@/lib/useProfile';

export default function IncidentsPage() {
  const { profile, isLoading } = useProfile();
  const isPro = profile?.subscription.plan === 'pro';

  const cases = [
    {
      id: "ARG-8291",
      assetId: "ARG-2026-8A92F1",
      threat: "Deepfake Impersonation & Speech Replacement",
      source: "X (Public Relay)",
      risk: "93.0% (Critical)",
      evidence: "12 frames, 1 waveform, 3 graphs",
      status: "EVIDENCE READY",
      openedAt: "3 hours ago",
      platform: "X / Social Stream"
    },
    {
      id: "ARG-8290",
      assetId: "ARG-2026-8A92F1",
      threat: "Temporal Lip-Sync Retargeting",
      source: "TikTok (Indexed Mirror)",
      risk: "87.5% (High)",
      evidence: "8 frames, 1 graph",
      status: "INVESTIGATING",
      openedAt: "8 hours ago",
      platform: "Short-Form Mirror"
    },
    {
      id: "ARG-8285",
      assetId: "ARG-2026-4C19D2",
      threat: "Unauthorized Content Re-encoding",
      source: "YouTube (Public Index)",
      risk: "42.0% (Low)",
      evidence: "C2PA Claim Valid",
      status: "RESOLVED",
      openedAt: "2 days ago",
      platform: "Video Portal"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Incident Response" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="LEGAL REMEDIATION"
            badgeColor="mauve"
            title="INCIDENT RESPONSE CASES"
            subtitle="Active forensic dossiers assembled for copyright takedowns under 17 U.S.C. § 512(c) and EU Digital Services Act (DSA) Article 16."
            actions={
              <div className="p-2.5 bg-white border-[2px] border-[#111111] text-xs font-bold text-[#844469]">
                DISCLAIMER: Assisted platform reporting workflows.
              </div>
            }
          />

          {!isLoading && !isPro ? (
            <ProFeatureGate
              featureTitle="LEGAL INCIDENT WORKFLOWS & TAKEDOWNS LOCKED"
              featureDescription="Automated legal takedown notice assembly under DMCA 17 U.S.C. § 512(c) and EU DSA Article 16 is an ARGOS PRO capability. Upgrade to generate certified takedown dossiers, sign Cease & Desist exhibits, and monitor resolution timelines."
              bullets={[
                "One-Click Automated DMCA Notice Generator with C2PA Claims",
                "EU DSA Article 16 Trusted Flagger Complaint Packages",
                "Exportable Certified Evidence Dossier with Audio-Visual Keyframes",
                "Cross-Platform Host ISP & CDN Target Resolver",
                "Automated Resolution Tracking & Escalation History",
                "Hardware Cryptographic Hash Verification Seals"
              ]}
            />
          ) : (
            <div className="space-y-4">
              {cases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white border-[3px] border-[#111111] brutal-shadow p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:translate-x-[-2px] transition-all"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-sm text-white bg-[#844469] px-2.5 py-0.5">
                        CASE #{c.id}
                      </span>
                      <span className="text-xs text-gray-700 font-bold">
                        ASSET: {c.assetId}
                      </span>
                      <StatusBadge
                        status={c.status === 'RESOLVED' ? 'valid' : c.status === 'EVIDENCE READY' ? 'warning' : 'danger'}
                        label={c.status}
                      />
                      <span className="text-[10px] text-gray-500 font-mono">
                        Opened {c.openedAt}
                      </span>
                    </div>

                    <h3 className="text-lg font-black font-display uppercase tracking-tight text-[#111111]">
                      {c.threat}
                    </h3>

                    <div className="text-xs text-gray-600 flex flex-wrap gap-4 font-mono">
                      <span>Target: <strong>{c.platform}</strong></span>
                      <span>Risk: <strong className="text-[#D95D5D]">{c.risk}</strong></span>
                      <span>Evidence: <strong>{c.evidence}</strong></span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link
                      href={`/incidents/${c.id}`}
                      className="px-5 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-black border-[2.5px] border-[#111111] brutal-btn text-xs font-black uppercase flex items-center gap-2"
                    >
                      Open Case File →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
