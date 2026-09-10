'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import ProtectionWorkflow from '@/components/ProtectionWorkflow';
import ProFeatureGate from '@/components/ui/ProFeatureGate';
import { useProfile } from '@/lib/useProfile';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ProtectPage() {
  const { profile, isLoading } = useProfile();
  const isPro = profile?.subscription.plan === 'pro';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Protect Media" />
        <div className="p-6 lg:p-8 flex-1 max-w-[1440px] w-full mx-auto space-y-6">
          
          {/* Flow Separation Notice */}
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-4 brutal-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#844469] text-white text-[10px] font-black uppercase border border-[#111111]">
                  FLOW SEPARATION
                </span>
                <span className="text-xs font-black uppercase text-[#111111]">
                  Looking to test Audio-Visual Temporal Lip-Sync & Deepfake Detection?
                </span>
              </div>
              <p className="text-[11px] text-gray-700 mt-1 max-w-3xl">
                This page is <strong>FLOW B (Media Protection & Provenance)</strong>. To test the core <strong>PS4 Multimodal ML Detection Engine</strong> without Media DNA, C2PA, or watermarking, open the <strong>Free ML Test Lab</strong>.
              </p>
            </div>
            <Link
              href="/test-lab"
              className="px-4 py-2 bg-[#111111] text-[#F8E8E8] text-xs font-black uppercase border-[2px] border-[#111111] hover:bg-[#844469] transition-colors shrink-0 brutal-btn flex items-center gap-2 shadow-[2px_2px_0px_#111111]"
            >
              <span>OPEN TEST LAB (ML)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!isLoading && !isPro ? (
            <ProFeatureGate
              featureTitle="MEDIA PROTECTION & ORIGIN SEALING LOCKED"
              featureDescription="Protect your original master media with ARGOS Media DNA cryptographic fingerprints, invisible spread-spectrum watermarks, and C2PA Content Credentials before publishing online."
              bullets={[
                "Multi-Modal Media DNA (SHA-256, Luminance pHash, Spectral Audio, Kinematic Visual)",
                "Hardware-Grade C2PA Provenance Manifest & Hardware Signing Key",
                "Spread-Spectrum Invisible Watermark Imperceptible to Human Eyes",
                "Verifiable Sovereign Protection Certificate with QR Verification Hash",
                "Automated Derivative Registration Across Monitoring Grid",
                "Automated Platform Takedown Package Generator"
              ]}
            />
          ) : (
            <ProtectionWorkflow />
          )}
        </div>
      </div>
    </div>
  );
}
