'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ForensicReportSection from '@/components/ForensicReportModal';
import { FileText, Download, Eye, Printer, ShieldCheck } from 'lucide-react';
import { DEMO_ASSET } from '@/lib/data';

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState('REP-ARG-2026-9904');

  const reportCatalog = [
    {
      id: "REP-ARG-2026-9904",
      caseId: "ARG-8291",
      assetId: DEMO_ASSET.id,
      title: "DIGITAL MEDIA FORENSIC & PROVENANCE DOSSIER",
      generatedAt: "Sep 09, 2026 // 21:14 UTC",
      risk: "93.0% (High Risk)",
      status: "SIGNATURE SEALED",
      classification: "CONFIDENTIAL FORENSIC DOSSIER"
    },
    {
      id: "REP-ARG-2026-8812",
      caseId: "ARG-8285",
      assetId: "ARG-2026-4C19D2",
      title: "CLEAN MASTER PROVENANCE AUDIT",
      generatedAt: "Sep 05, 2026 // 15:00 UTC",
      risk: "1.2% (Authentic)",
      status: "AUTHENTIC VERIFIED",
      classification: "ORIGINAL PROVENANCE"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Forensic Reports" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="OFFICIAL DOSSIERS"
            badgeColor="mauve"
            title="FORENSIC REPORTS"
            subtitle="Download and print cryptographically sealed forensic documents, complete with SHA-256 signatures, C2PA manifest claims, and frame exhibit annexes."
          />

          {/* Catalog List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportCatalog.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReportId(rep.id)}
                className={`p-5 border-[3px] border-[#111111] brutal-shadow cursor-pointer transition-all ${
                  selectedReportId === rep.id
                    ? 'bg-[#EFD99C] shadow-[5px_5px_0px_#111111] translate-x-[-2px]'
                    : 'bg-white hover:bg-[#F6C6D8]/30'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-[#111111] text-[#F4CD3F] px-2 py-0.5 text-xs font-black">
                    {rep.id}
                  </span>
                  <StatusBadge
                    status={rep.risk.includes('High') ? 'danger' : 'valid'}
                    label={rep.status}
                  />
                </div>
                <h3 className="font-black text-sm text-[#111111] mb-1 font-display uppercase">
                  {rep.title}
                </h3>
                <div className="text-[11px] text-gray-600 space-y-0.5">
                  <div>Case Ref: <strong>#{rep.caseId}</strong> • Asset: <strong>{rep.assetId}</strong></div>
                  <div>Generated: {rep.generatedAt}</div>
                  <div>Classification: <strong className="text-[#844469]">{rep.classification}</strong></div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Forensic Dossier Preview */}
          <div className="pt-6 border-t-[3px] border-[#111111]">
            <ForensicReportSection />
          </div>

        </div>
      </div>
    </div>
  );
}
