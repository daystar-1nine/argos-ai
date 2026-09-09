'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import { Award, ShieldCheck, Printer, Download, ExternalLink, QrCode, ArrowLeft } from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_PROTECTION, DEMO_PROVENANCE } from '@/lib/data';

export default function CertificatesPage() {
  const certificates = [
    {
      id: "CERT-ARG-2026-0091",
      assetId: DEMO_ASSET.id,
      title: DEMO_ASSET.title,
      creationDate: "Sep 08, 2026 // 14:34 UTC",
      fingerprint: DEMO_DNA.sha256Hash,
      provenance: "C2PA v2.1 Sovereign Manifest urn:c2pa:8a92f1",
      protectionStatus: "Active & Sealed",
      issuer: "ARGOS Sovereign Provenance CA 2026",
      did: "did:argos:sig-7b2f901a"
    },
    {
      id: "CERT-ARG-2026-0044",
      assetId: "ARG-2026-4C19D2",
      title: "Independent Journalism Investigative Interview",
      creationDate: "Sep 05, 2026 // 12:00 UTC",
      fingerprint: "7b4190fae1201994bca1190bc99014a1f819001bca091448991200fa881902bb",
      provenance: "C2PA v2.1 Sovereign Manifest urn:c2pa:4c19d2",
      protectionStatus: "Active & Sealed",
      issuer: "ARGOS Sovereign Provenance CA 2026",
      did: "did:argos:sig-7b2f901a"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Authentic Certificates" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="SOVEREIGN REGISTRY"
            badgeColor="yellow"
            title="AUTHENTIC MEDIA CERTIFICATES"
            subtitle="Immutable digital certificates establishing original authorship and pre-protection integrity for rights holders."
          />

          {/* Certificate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-8 relative flex flex-col justify-between"
              >
                {/* Certificate Border Header */}
                <div>
                  <div className="flex justify-between items-start pb-4 mb-6 border-b-[3px] border-[#111111]">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#844469] tracking-widest block">
                        CERTIFICATE OF PROVENANCE
                      </span>
                      <h3 className="text-2xl font-black uppercase font-display text-[#111111]">
                        ARGOS AI
                      </h3>
                      <div className="text-[11px] font-bold text-gray-700">
                        AUTHENTIC MEDIA CERTIFICATE
                      </div>
                    </div>

                    {/* QR Code Graphic Representation */}
                    <div className="w-14 h-14 bg-white border-[2px] border-black p-1 flex flex-col items-center justify-center">
                      <QrCode className="w-full h-full text-black" />
                    </div>
                  </div>

                  {/* Certificate Fields */}
                  <div className="space-y-3 text-xs bg-white border-[2px] border-[#111111] p-4 mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Asset Title:</div>
                      <div className="font-black text-sm text-[#111111]">{cert.title}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Asset ID:</div>
                        <div className="font-black text-[#844469]">{cert.assetId}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Certificate Ref:</div>
                        <div className="font-black">{cert.id}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Creation Timestamp:</div>
                      <div className="font-mono text-[11px]">{cert.creationDate}</div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Root SHA-256 Fingerprint:</div>
                      <div className="text-[9px] text-gray-800 break-all bg-gray-100 p-1 border border-gray-300">
                        {cert.fingerprint}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-[10px] font-bold text-gray-500 uppercase">Provenance Manifest Claim:</div>
                      <div className="text-[10px] text-[#844469] font-bold">{cert.provenance}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Seal & Actions */}
                <div className="pt-4 border-t-[2px] border-[#111111] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
                    <span className="font-bold text-[#8BCF9B] bg-black px-2 py-0.5 text-[10px]">
                      {cert.protectionStatus.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-black font-bold uppercase border border-black text-xs flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" /> Print
                    </button>
                    <Link
                      href={`/verify?id=${cert.assetId}`}
                      className="px-3 py-1.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-black font-bold uppercase border border-black text-xs flex items-center gap-1"
                    >
                      Verify
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
