'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import BrutalistCard from '@/components/ui/BrutalistCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { ShieldCheck, Dna, FileCheck2, Globe, ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_PROTECTION, DEMO_PROVENANCE } from '@/lib/data';

export default function AssetProtectDetailPage() {
  const params = useParams();
  const assetId = (params.assetId as string) || DEMO_ASSET.id;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={`Protection // ${assetId}`} />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <div className="flex items-center gap-2 text-xs font-bold text-[#844469] mb-2">
            <Link href="/media" className="flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to My Media
            </Link>
          </div>

          <PageHeader
            badge="PROTECTION RECORD"
            badgeColor="yellow"
            title={`SHIELD STATUS: ${assetId}`}
            subtitle="Detailed cryptographic protection telemetry, spread-spectrum watermark strength, and sovereign C2PA credentials."
            actions={
              <Link
                href={`/media/${assetId}`}
                className="px-4 py-2 bg-[#F6C6D8] hover:bg-[#ffb3cc] text-[#111111] border-[2px] border-[#111111] brutal-btn text-xs font-black uppercase"
              >
                View Full Lifecycle →
              </Link>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Cols: Protection Parameters */}
            <div className="lg:col-span-7 space-y-6">
              <BrutalistCard
                variant="cream"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>DIGITAL SHIELD METRICS</span>
                    <StatusBadge status="valid" label="PROTECTION ACTIVE" />
                  </div>
                }
              >
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-white border border-[#111111] flex justify-between">
                    <span className="font-bold">Cryptographic Status:</span>
                    <span className="text-[#8BCF9B] font-black">ACTIVE & SEALED</span>
                  </div>

                  <div className="p-3 bg-white border border-[#111111] flex justify-between">
                    <span className="font-bold">Watermark Algorithm:</span>
                    <span>Spread-Spectrum DWT+DCT (PSNR &gt; 46 dB)</span>
                  </div>

                  <div className="p-3 bg-white border border-[#111111] flex justify-between">
                    <span className="font-bold">Watermark Embedding Strength:</span>
                    <span className="font-black text-[#844469]">88%</span>
                  </div>

                  <div className="p-3 bg-white border border-[#111111] flex justify-between">
                    <span className="font-bold">C2PA Claim Manifest:</span>
                    <span className="font-bold text-[#844469]">{DEMO_PROVENANCE.c2paManifestId}</span>
                  </div>

                  <div className="p-3 bg-white border border-[#111111] flex justify-between">
                    <span className="font-bold">Protected At:</span>
                    <span>{DEMO_PROTECTION.protectedAt}</span>
                  </div>
                </div>
              </BrutalistCard>

              {/* Cryptographic Seal */}
              <div className="p-4 bg-white border-[3px] border-[#111111] brutal-shadow font-mono text-xs">
                <div className="text-[10px] font-black uppercase text-gray-600 mb-1">
                  SOVEREIGN CRYPTOGRAPHIC SEAL:
                </div>
                <div className="text-[11px] text-gray-800 break-all bg-[#F8E8E8] p-2 border border-gray-300">
                  {DEMO_PROTECTION.cryptographicSeal}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Quick Actions & Verification */}
            <div className="lg:col-span-5 space-y-6">
              <BrutalistCard
                variant="pink"
                header={
                  <div className="flex items-center justify-between w-full">
                    <span>VERIFY THIS ASSET</span>
                    <ShieldCheck className="w-4 h-4 text-[#844469]" />
                  </div>
                }
              >
                <div className="space-y-3 font-mono text-xs">
                  <p className="text-gray-700">
                    Verify this asset against the public provenance ledger to ensure no post-protection tampering has occurred.
                  </p>
                  <Link
                    href={`/verify?id=${assetId}`}
                    className="block text-center py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-black font-black uppercase border-[2px] border-black brutal-btn"
                  >
                    Run Public Verification →
                  </Link>
                  <Link
                    href={`/certificates`}
                    className="block text-center py-2 bg-white hover:bg-gray-100 text-black font-bold uppercase border-[2px] border-black"
                  >
                    View Authenticity Certificate
                  </Link>
                </div>
              </BrutalistCard>

              <BrutalistCard
                variant="mauve"
                header={
                  <div className="flex items-center justify-between w-full text-white">
                    <span>MONITORING STREAM</span>
                    <Globe className="w-4 h-4 text-[#F4CD3F]" />
                  </div>
                }
              >
                <div className="space-y-3 font-mono text-xs text-[#EFD99C]">
                  <div>Supported indexed sources are actively polling for unauthorized derivatives.</div>
                  <div className="p-2 bg-black/40 border border-white/20 flex justify-between">
                    <span>Status:</span>
                    <span className="text-[#8BCF9B] font-bold">● CONTINUOUS WATCH</span>
                  </div>
                  <Link
                    href="/monitor"
                    className="block text-center py-2 bg-[#F4CD3F] text-black font-bold uppercase hover:bg-white"
                  >
                    View Global Watch Feed
                  </Link>
                </div>
              </BrutalistCard>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
