'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Fingerprint,
  Radio,
  Eye,
  Bell,
  Scale,
  FileCheck
} from 'lucide-react';

interface ProFeatureGateProps {
  featureTitle?: string;
  featureDescription?: string;
  bullets?: string[];
  compact?: boolean;
}

export default function ProFeatureGate({
  featureTitle = 'PROTECTION & SOVEREIGN TELEMETRY LOCKED',
  featureDescription = 'Protect your original media with ARGOS Media DNA, invisible watermarks, C2PA Content Credentials, active telemetry monitoring, and automated takedown assistance.',
  bullets = [
    'Media DNA Cryptographic Fingerprinting (pHash, Visual/Audio/Temporal)',
    'Hardware-Grade C2PA Content Credentials & Provable Ledger Signatures',
    'Imperceptible Spread-Spectrum Watermarking',
    'Continuous Telemetry Across Supported Public & Indexed Sources',
    'Automated Incident Response & Platform Takedown Packages',
    'Cryptographically Sealed PDF Forensic Dossiers'
  ],
  compact = false,
}: ProFeatureGateProps) {
  return (
    <div className={`w-full font-mono ${compact ? 'p-4' : 'p-8'} bg-[#F8E8E8] border-[3px] border-[#111111] brutal-shadow relative overflow-hidden my-6`}>
      {/* Decorative Matrix Watermark Pattern */}
      <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none select-none">
        <ShieldCheck className="w-64 h-64 text-[#111111]" />
      </div>

      {/* Top Banner Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b-[2.5px] border-[#111111] mb-6">
        <div className="inline-flex items-center gap-2 bg-[#D95D5D] text-white px-3 py-1 text-xs font-black uppercase tracking-wider border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
          <Lock className="w-3.5 h-3.5" />
          <span>PRO FEATURE REQUIRED</span>
        </div>
        <div className="text-[11px] font-black text-[#844469] uppercase tracking-wider">
          ARGOS DEFENSE SUITE // TIER 02
        </div>
      </div>

      {/* Main Pitch Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase font-display tracking-tight text-[#111111]">
              {featureTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
              {featureDescription}
            </p>
          </div>

          {/* Value Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/70 p-2 border-[1.5px] border-[#111111] text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                <span className="text-[#111111] font-bold text-[11px]">{b}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#EFD99C]/60 border-[1.5px] border-[#111111] text-[11px] text-gray-700">
            <span className="font-bold text-[#111111]">NOTE: </span>
            Core AI deepfake detection (Problem Statement 4) remains <strong className="text-black uppercase">100% free</strong>.
            Upgrading to ARGOS PRO enables sovereign media protection, origin sealing, and automated monitoring.
          </div>
        </div>

        {/* Upgrade Box / Pricing Callout */}
        <div className="lg:col-span-5 bg-[#EFD99C] border-[3px] border-[#111111] p-6 shadow-[5px_5px_0px_#844469] text-center flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="inline-block bg-[#111111] text-[#F4CD3F] text-[10px] font-black uppercase px-3 py-0.5 tracking-wider">
              SOVEREIGN PROTECTION PLAN
            </div>
            <div className="text-xl font-black uppercase text-[#111111]">
              ARGOS PRO
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl sm:text-5xl font-black font-display text-[#111111]">₹199</span>
              <span className="text-xs font-bold text-gray-700">/ month</span>
            </div>
            <div className="text-[10px] text-gray-600 font-bold uppercase">
              CANCEL ANYTIME • NO CONTRACTS
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/pricing"
              className="w-full py-3.5 px-4 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#111111]"
            >
              <Sparkles className="w-4 h-4 text-[#844469]" />
              <span>UPGRADE TO PRO</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/profile"
              className="block text-[10px] font-bold text-gray-700 hover:text-[#111111] underline uppercase tracking-wider"
            >
              VIEW MY PROFILE & USAGE LIMITS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
