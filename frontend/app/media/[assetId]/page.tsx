'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import BrutalistCard from '@/components/ui/BrutalistCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Dna, 
  Fingerprint, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_PROTECTION, DEMO_PROVENANCE, DEMO_MATCHES } from '@/lib/data';

export default function MediaDetailPage() {
  const params = useParams();
  const assetId = (params.assetId as string) || DEMO_ASSET.id;

  const lifecycleStages = [
    {
      title: "ORIGINAL",
      time: "Sep 08, 2026 // 14:32 UTC",
      desc: "Authentic camera master recorded on Sony FX6 (XAVC-I 4K 60fps). Optical PRNU noise validated.",
      badge: "AUTHENTICITY VERIFIED",
      status: "valid" as const,
    },
    {
      title: "PROTECTED",
      time: "Sep 08, 2026 // 14:34 UTC",
      desc: "Invisible spread-spectrum watermark embedded (88% strength). Cryptographic SHA-256 and Media DNA anchored.",
      badge: "C2PA SEAL APPLIED",
      status: "valid" as const,
    },
    {
      title: "MODIFIED",
      time: "Sep 09, 2026 // 18:14 UTC",
      desc: "Unauthorized derivative detected on public microblogging stream. Facial re-synthesis and voice clone audio.",
      badge: "SYNTHETIC ANOMALY",
      status: "danger" as const,
    },
    {
      title: "DETECTED",
      time: "Sep 09, 2026 // 21:14 UTC",
      desc: "Argos Multi-Model ensemble flagged 93% manipulation risk. +320ms phoneme-viseme desync verified in Case #ARG-8291.",
      badge: "ALERT DISPATCHED",
      status: "danger" as const,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={`Asset // ${assetId}`} />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <div className="flex items-center gap-2 text-xs font-bold text-[#844469]">
            <Link href="/media" className="flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Media
            </Link>
          </div>

          <PageHeader
            badge="MEDIA DOSSIER"
            badgeColor="mauve"
            title={DEMO_ASSET.title}
            subtitle={`Asset ID: ${assetId} • 4K Master • C2PA Claim Manifest urn:c2pa:8a92f1`}
            actions={
              <div className="flex gap-2">
                <Link
                  href={`/verify?id=${assetId}`}
                  className="px-4 py-2 bg-[#F6C6D8] hover:bg-[#ffb3cc] text-black border-[2px] border-[#111111] brutal-btn text-xs font-bold uppercase"
                >
                  Verify
                </Link>
                <Link
                  href={`/detections/match_01`}
                  className="px-4 py-2 bg-[#D95D5D] hover:bg-[#eb7373] text-white border-[2px] border-[#111111] brutal-btn text-xs font-black uppercase"
                >
                  Inspect Detection →
                </Link>
              </div>
            }
          />

          {/* THE LIFECYCLE TIMELINE: ORIGINAL -> PROTECTED -> MODIFIED -> DETECTED */}
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow-lg p-6">
            <div className="flex items-center justify-between pb-3 mb-6 border-b-[2px] border-[#111111]">
              <h3 className="font-black text-sm uppercase text-[#111111] font-display">
                LIFECYCLE PROVENANCE & ANOMALY CHAIN
              </h3>
              <span className="text-xs font-bold text-[#844469]">
                ORIGINAL ↓ PROTECTED ↓ MODIFIED ↓ DETECTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {lifecycleStages.map((stage, idx) => (
                <div
                  key={idx}
                  className={`p-4 border-[2px] border-[#111111] flex flex-col justify-between ${
                    stage.status === 'danger' ? 'bg-[#F6C6D8]' : 'bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs font-display uppercase">{stage.title}</span>
                      <StatusBadge status={stage.status} label={stage.badge} />
                    </div>
                    <div className="text-[10px] text-gray-500 mb-2 font-mono">{stage.time}</div>
                    <p className="text-xs text-[#111111]/85 leading-relaxed font-mono">
                      {stage.desc}
                    </p>
                  </div>

                  {idx < 3 && (
                    <div className="md:hidden flex justify-center my-2 text-black font-black">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Details: Left Video & DNA, Right Provenance & Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 6 Cols: Video View & Media DNA */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Media Preview Box */}
              <div className="bg-white border-[3px] border-[#111111] brutal-shadow overflow-hidden">
                <div className="p-3 bg-[#111111] text-[#EFD99C] flex justify-between items-center text-xs font-bold uppercase">
                  <span>MASTER FOOTAGE PREVIEW</span>
                  <span className="text-[#8BCF9B]">3840x2160 @ 60fps</span>
                </div>
                <div className="relative aspect-video bg-[#05080c] overflow-hidden">
                  <img
                    src="/demo/original/original-01.jpg"
                    alt="Master Protected Footage"
                    className="w-full h-full object-cover object-center select-none"
                  />
                  <div className="absolute top-2 right-2 font-mono text-[10px] bg-[#8BCF9B] text-[#111111] px-2 py-0.5 font-bold border border-[#111111]">
                    ✓ C2PA VERIFIED
                  </div>
                  <div className="absolute bottom-2 left-2 font-mono text-[10px] bg-black/80 px-2 py-0.5 text-[#F4CD3F] border border-white/20">
                    INTRINSIC WATERMARK: ACTIVE [PROVENANCE VALID]
                  </div>
                </div>
              </div>

              {/* Media DNA Details */}
              <BrutalistCard
                variant="cream"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>MEDIA DNA FINGERPRINTS</span>
                    <Dna className="w-4 h-4 text-[#844469]" />
                  </div>
                }
              >
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-600">SHA-256 Hash:</div>
                    <div className="p-1.5 bg-white border border-[#111111] text-[10px] break-all">
                      {DEMO_DNA.sha256Hash}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-600">Visual DNA:</div>
                    <div className="p-1.5 bg-white border border-[#111111] text-[10px]">
                      {DEMO_DNA.visualDnaSignature}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-600">Audio DNA:</div>
                    <div className="p-1.5 bg-white border border-[#111111] text-[10px]">
                      {DEMO_DNA.audioDnaSignature}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-600">Temporal DNA:</div>
                    <div className="p-1.5 bg-white border border-[#111111] text-[10px]">
                      {DEMO_DNA.temporalDnaSignature}
                    </div>
                  </div>
                </div>
              </BrutalistCard>

            </div>

            {/* Right 6 Cols: Protection, Watermark & Detections */}
            <div className="lg:col-span-6 space-y-6">
              
              <BrutalistCard
                variant="pink"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>PROTECTION & PROVENANCE SPEC</span>
                    <ShieldCheck className="w-4 h-4 text-[#844469]" />
                  </div>
                }
              >
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-2 bg-white border border-[#111111] flex justify-between">
                    <span>C2PA Manifest:</span>
                    <span className="font-bold text-[#8BCF9B]">SIGNED & VALID ✓</span>
                  </div>
                  <div className="p-2 bg-white border border-[#111111] flex justify-between">
                    <span>Signing Authority:</span>
                    <span>{DEMO_PROVENANCE.signingAuthority}</span>
                  </div>
                  <div className="p-2 bg-white border border-[#111111] flex justify-between">
                    <span>Watermark Embedding:</span>
                    <span className="font-bold text-[#844469]">DWT-DCT (88% strength)</span>
                  </div>
                  <div className="p-2 bg-white border border-[#111111] flex justify-between">
                    <span>Integrity Check:</span>
                    <span className="font-bold text-[#8BCF9B]">PASS</span>
                  </div>
                </div>
              </BrutalistCard>

              {/* Detected Derivative Matches */}
              <div className="bg-white border-[3px] border-[#111111] brutal-shadow p-5 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#111111]">
                  <span className="font-black uppercase text-[#D95D5D]">DETECTED DERIVATIVES (3)</span>
                  <Link href="/monitor" className="text-[#844469] font-bold hover:underline">
                    Global Watch →
                  </Link>
                </div>

                <div className="space-y-2">
                  {DEMO_MATCHES.map((m) => (
                    <div key={m.id} className="p-2.5 bg-[#F8E8E8] border border-[#111111] flex justify-between items-center">
                      <div>
                        <div className="font-bold">{m.sourceName}</div>
                        <div className="text-[10px] text-[#844469]">{m.detectedManipulation}</div>
                      </div>
                      <Link
                        href={`/detections/${m.id}`}
                        className="px-2 py-1 bg-[#F4CD3F] border border-black font-bold text-[10px] hover:bg-white"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
