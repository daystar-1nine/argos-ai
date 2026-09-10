'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import { useProfile } from '@/lib/useProfile';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Lock, 
  Info,
  AlertCircle
} from 'lucide-react';

export default function PricingPage() {
  const { profile, refetch } = useProfile();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<{ type: 'info' | 'error' | 'success'; title: string; message: string } | null>(null);

  const isPro = profile?.subscription.plan === 'pro';

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    setCheckoutNotice(null);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: 'pro' }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error?.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED') {
          setCheckoutNotice({
            type: 'info',
            title: 'PAYMENT GATEWAY CONFIGURATION REQUIRED',
            message: 'In accordance with system specifications, fake payments are strictly forbidden. Live payment processing requires Razorpay (for INR ₹199/mo) or Stripe credentials configured in backend environment. Core detection remains free.'
          });
          return;
        }
        throw new Error(data.error?.message || 'Upgrade checkout failed.');
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setCheckoutNotice({
          type: 'success',
          title: 'CHECKOUT INTENT CREATED',
          message: 'Subscription session initialized with gateway provider.'
        });
        await refetch();
      }
    } catch (err: any) {
      setCheckoutNotice({
        type: 'error',
        title: 'CHECKOUT ERROR',
        message: err.message || 'An error occurred while communicating with the subscription engine.'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleDowngrade = async () => {
    if (!confirm('Are you sure you want to cancel your ARGOS PRO subscription? Your access will remain active until the end of the billing period.')) {
      return;
    }
    setIsCheckingOut(true);
    setCheckoutNotice(null);
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to cancel subscription.');
      }
      setCheckoutNotice({
        type: 'info',
        title: 'SUBSCRIPTION UPDATED',
        message: data.message || 'Subscription cancelled. Access preserved until billing expiration.'
      });
      await refetch();
    } catch (err: any) {
      setCheckoutNotice({
        type: 'error',
        title: 'CANCELLATION ERROR',
        message: err.message || 'Failed to process cancellation.'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Subscription Plans & Tiers" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1280px] w-full mx-auto">
          
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-block bg-[#111111] text-[#F4CD3F] text-xs font-black uppercase px-3 py-1 border-[2px] border-[#111111]">
              SOVEREIGN FORENSICS PRICING
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase font-display tracking-tight">
              Detect for Free. Protect with Pro.
            </h1>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              ARGOS AI delivers state-of-the-art audio-visual deepfake detection to everyone for free, while empowering content creators and studios with hardware-grade origin sealing, continuous telemetry, and automated takedown response.
            </p>
          </div>

          {/* Alert Notice if Triggered */}
          {checkoutNotice && (
            <div className={`p-4 border-[3px] border-[#111111] brutal-shadow space-y-1 ${
              checkoutNotice.type === 'error' ? 'bg-[#D95D5D]/20 text-red-950' : 'bg-[#EFD99C] text-black'
            }`}>
              <div className="flex items-center gap-2 font-black text-xs uppercase">
                <AlertCircle className="w-4 h-4 text-[#844469]" />
                <span>{checkoutNotice.title}</span>
              </div>
              <p className="text-xs">{checkoutNotice.message}</p>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-4">
            
            {/* PLAN 1: ARGOS FREE */}
            <div className={`border-[3px] border-[#111111] p-6 sm:p-8 flex flex-col justify-between ${
              !isPro ? 'bg-[#EFD99C] brutal-shadow' : 'bg-white/80'
            }`}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase bg-[#111111] text-[#F4CD3F] px-2.5 py-1">
                    TIER 01
                  </span>
                  {!isPro && (
                    <span className="text-[10px] font-black uppercase bg-[#8BCF9B] px-2 py-0.5 border-[1.5px] border-[#111111]">
                      YOUR CURRENT PLAN
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-3xl font-black uppercase font-display">ARGOS FREE</h2>
                  <div className="text-xs font-black text-[#844469] uppercase mt-1 tracking-wider">
                    PURPOSE: DETECT
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black font-display text-[#111111]">₹0</span>
                    <span className="text-xs font-bold text-gray-700">/ forever</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Unlimited basic deepfake forensics and origin verification.
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t-[2px] border-[#111111] space-y-3 text-xs">
                  <div className="font-black uppercase text-gray-800 text-[11px]">INCLUDED CAPABILITIES:</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>Video & Audio File Ingestion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>Full 11-Stage Audio-Visual ML Detection Engine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>96x96 Face & Lip ROI Temporal Tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>80-Band Mel-Spectrogram & MFCC Acoustic Analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>SyncNet 3D-CNN Cross-Modal Cosine Alignment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>Calibrated Real vs Fake Classification & Confidence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>Forensic Evidence Keyframe Extraction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#8BCF9B] shrink-0 mt-0.5" />
                      <span>Public Hash Verification & Inspection History</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                {!isPro ? (
                  <div className="py-3 px-4 bg-white/70 border-[2px] border-[#111111] text-xs font-black uppercase text-center text-gray-800">
                    CURRENT PLAN ACTIVE
                  </div>
                ) : (
                  <button
                    onClick={handleDowngrade}
                    disabled={isCheckingOut}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-100 border-[2px] border-[#111111] text-xs font-black uppercase brutal-btn"
                  >
                    DOWNGRADE TO FREE
                  </button>
                )}
              </div>
            </div>

            {/* PLAN 2: ARGOS PRO */}
            <div className={`border-[3px] border-[#111111] p-6 sm:p-8 flex flex-col justify-between relative ${
              isPro ? 'bg-[#EFD99C] shadow-[6px_6px_0px_#844469]' : 'bg-[#F6C6D8] shadow-[6px_6px_0px_#111111]'
            }`}>
              {/* Popular Badge */}
              <div className="absolute -top-3.5 right-6 bg-[#844469] text-white text-[10px] font-black uppercase px-3 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_#111111]">
                SOVEREIGN PROTECTION SUITE
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase bg-[#844469] text-white px-2.5 py-1">
                    TIER 02 // PRO
                  </span>
                  {isPro && (
                    <span className="text-[10px] font-black uppercase bg-[#8BCF9B] px-2 py-0.5 border-[1.5px] border-[#111111]">
                      YOUR CURRENT PLAN
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-3xl font-black uppercase font-display">ARGOS PRO</h2>
                  <div className="text-xs font-black text-[#844469] uppercase mt-1 tracking-wider">
                    PURPOSE: PROTECT + MONITOR + RESPOND
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black font-display text-[#111111]">₹199</span>
                    <span className="text-xs font-bold text-gray-800">/ month</span>
                  </div>
                  <p className="text-xs text-gray-700">
                    Complete digital origin protection, active telemetry, and incident takedowns.
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t-[2px] border-[#111111] space-y-3 text-xs">
                  <div className="font-black uppercase text-[#844469] text-[11px]">
                    EVERYTHING IN FREE PLUS:
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Media DNA Cryptographic Fingerprinting</span>
                    </li>
                    <li className="flex items-start gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Hardware C2PA Provenance Signing & Content Credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Spread-Spectrum Invisible Watermark Embedding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Verifiable Sovereign Protection Certificates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Continuous Telemetry on Supported Public/Indexed Sources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Automated Derivative Match Detection & Alerting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>One-Click Legal & DMCA Takedown Package Generator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Cryptographically Sealed PDF Forensic Dossiers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
                      <span>Extended Quota: 1,000 Forensic Analyses / Month</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                {isPro ? (
                  <div className="py-3 px-4 bg-[#111111] text-[#F4CD3F] border-[2px] border-[#111111] text-xs font-black uppercase text-center">
                    ✓ ACTIVE SUBSCRIBER
                  </div>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={isCheckingOut}
                    className="w-full py-3.5 px-4 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] font-mono text-xs font-black uppercase brutal-btn flex items-center justify-center gap-2 shadow-[3px_3px_0px_#111111]"
                  >
                    <Sparkles className="w-4 h-4 text-[#844469]" />
                    <span>{isCheckingOut ? 'INITIALIZING CHECKOUT...' : 'UPGRADE TO PRO (₹199/MO)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Bottom Transparency Notice */}
          <div className="bg-[#EFD99C]/60 border-[2px] border-[#111111] p-4 text-xs text-gray-800 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#844469] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-black">FORENSIC TELEMETRY DISCLOSURE: </span>
              ARGOS AI monitors supported public, indexed, and integrated source relays. We do not claim universal or exhaustive scraping of every private website. All fees support continuous neural compute, cryptographic ledger consensus, and research into temporal deepfake countermeasures.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
