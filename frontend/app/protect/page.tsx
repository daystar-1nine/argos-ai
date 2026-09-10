'use client';

import React from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import ProtectionWorkflow from '@/components/ProtectionWorkflow';
import ProFeatureGate from '@/components/ui/ProFeatureGate';
import { useProfile } from '@/lib/useProfile';

export default function ProtectPage() {
  const { profile, isLoading } = useProfile();
  const isPro = profile?.subscription.plan === 'pro';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Protect Media" />
        <div className="p-6 lg:p-8 flex-1 max-w-[1440px] w-full mx-auto">
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
