'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  ShieldCheck, 
  Dna, 
  FileCheck2, 
  Radio, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_PROTECTION } from '@/lib/data';

export default function ProtectionWorkflow({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [assetName, setAssetName] = useState('executive_briefing_q3_raw.mp4');
  const [watermarkStrength, setWatermarkStrength] = useState<number>(88);

  const nextStep = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }, 800);
  };

  const steps = [
    { num: '01', title: 'UPLOAD', desc: 'Secure asset ingest & hashing' },
    { num: '02', title: 'VERIFY', desc: 'Authenticity Gate validation' },
    { num: '03', title: 'PROTECT', desc: 'Invisible watermark encoding' },
    { num: '04', title: 'REGISTER', desc: 'C2PA sovereign provenance seal' },
    { num: '05', title: 'MONITOR', desc: 'Supported source indexing' },
  ];

  return (
    <section id="protect-workflow" className="w-full py-20 px-4 lg:px-8 bg-[#F7F3E8] border-b-[3px] border-[#111111]">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4CD3F] text-[#111111] border-[2px] border-[#111111] font-mono text-xs font-black uppercase tracking-wider mb-3">
            01 → 05 // FIVE-STAGE MEDIA SHIELD
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
            PROTECT MY MEDIA
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-2">
            Establish legal provenance, imprint spread-spectrum watermarks, and register 
            your digital DNA before publishing to public channels.
          </p>
        </div>

        {/* 5-Step Neo-Brutalist Stepper Header */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-8 font-mono">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={step.num}
                className={`p-3 border-[2.5px] border-[#111111] transition-all ${
                  isCurrent
                    ? 'bg-[#F4CD3F] brutal-shadow scale-[1.02]'
                    : isCompleted
                    ? 'bg-[#8BCF9B] opacity-90'
                    : 'bg-[#EFD99C]/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs sm:text-sm text-[#111111]">
                    {step.num}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  )}
                </div>
                <div className="font-black text-[10px] sm:text-xs text-[#111111] uppercase tracking-tight">
                  {step.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content Container */}
        <div className="bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-10 font-mono">
          
          {/* STEP 01: UPLOAD */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#111111]">
                <span className="font-black text-sm uppercase">STAGE 01: INGEST ORIGINAL ASSET</span>
                <span className="text-xs text-[#844469] font-bold">4K / MASTER READY</span>
              </div>

              <div className="border-[3px] border-dashed border-[#111111] bg-white p-8 text-center flex flex-col items-center justify-center">
                <Upload className="w-10 h-10 text-[#844469] mb-3" />
                <div className="font-black text-sm uppercase text-[#111111]">
                  DRAG & DROP MASTER PHOTO OR VIDEO
                </div>
                <div className="text-xs text-gray-500 mt-1 mb-4">
                  Supports MP4, MOV, ProRes, PNG, RAW, TIFF (Up to 2GB per asset)
                </div>

                <div className="bg-[#F7F3E8] border-[2px] border-[#111111] px-4 py-2 text-xs font-bold flex items-center gap-2">
                  <span>PRELOADED MASTER:</span>
                  <span className="text-[#844469] font-black">{assetName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#111111]/20">
                <span className="text-xs text-gray-700">AES-256 ZERO-KNOWLEDGE INGEST ENCRYPTION</span>
                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
                >
                  {isProcessing ? "INGESTING..." : "PROCEED TO AUTHENTICITY GATE →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 02: VERIFY */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#111111]">
                <span className="font-black text-sm uppercase">STAGE 02: PRE-PROTECTION AUTHENTICITY GATE</span>
                <span className="text-xs text-[#8BCF9B] bg-black px-2 py-0.5 font-bold">GATE AUDIT ACTIVE</span>
              </div>

              <div className="bg-white border-[3px] border-[#111111] p-6 space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#8BCF9B]/20 border border-[#8BCF9B]">
                  <span className="font-bold">Hardware Sensor Noise Profile:</span>
                  <span className="font-black text-[#8BCF9B]">PRNU OPTICAL MATCH (99.1%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#8BCF9B]/20 border border-[#8BCF9B]">
                  <span className="font-bold">Diffusion Grid Artifacts:</span>
                  <span className="font-black text-[#8BCF9B]">NONE DETECTED (&lt;2.4%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#8BCF9B]/20 border border-[#8BCF9B]">
                  <span className="font-bold">Continuous Temporal Kinematics:</span>
                  <span className="font-black text-[#8BCF9B]">BIOLOGICALLY CONSISTENT</span>
                </div>
              </div>

              <div className="p-3 bg-[#8BCF9B] border-[2px] border-[#111111] text-black font-black text-center text-sm uppercase">
                AUTHENTICITY ESTABLISHED // ASSET IS ELIGIBLE FOR DIGITAL SHIELD
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#111111]/20">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-gray-700 underline font-bold uppercase"
                >
                  ← BACK
                </button>
                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
                >
                  {isProcessing ? "ISSUING CLEARANCE..." : "GENERATE DNA & WATERMARK →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 03: PROTECT */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#111111]">
                <span className="font-black text-sm uppercase">STAGE 03: ENCODE INVISIBLE WATERMARK</span>
                <span className="text-xs text-[#844469] font-bold">SPREAD-SPECTRUM DWT-DCT</span>
              </div>

              <div className="bg-white border-[3px] border-[#111111] p-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span>WATERMARK EMBEDDING STRENGTH:</span>
                    <span className="text-[#844469] font-black">{watermarkStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={watermarkStrength}
                    onChange={(e) => setWatermarkStrength(Number(e.target.value))}
                    className="w-full accent-[#844469]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>Higher Transparency</span>
                    <span>Higher Compression Survivability</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F7F3E8] border border-[#111111] text-xs space-y-1">
                  <div><strong>ALGORITHM:</strong> Redundant Frequency-Domain Spread Spectrum (DWT+DCT)</div>
                  <div><strong>SURVIVABILITY:</strong> Resilient to 70% resizing, re-compression, and 20% peripheral cropping.</div>
                  <div><strong>PERCEPTIBILITY:</strong> 100% Invisible to human vision (PSNR &gt; 46 dB).</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#111111]/20">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-gray-700 underline font-bold uppercase"
                >
                  ← BACK
                </button>
                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
                >
                  {isProcessing ? "EMBEDDING WATERMARK..." : "REGISTER C2PA PROVENANCE →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 04: REGISTER */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-[2px] border-[#111111]">
                <span className="font-black text-sm uppercase">STAGE 04: C2PA MANIFEST REGISTRATION</span>
                <span className="text-xs text-[#8BCF9B] bg-black px-2 py-0.5 font-bold">SOVEREIGN CA</span>
              </div>

              <div className="bg-white border-[3px] border-[#111111] p-6 space-y-3 text-xs">
                <div className="p-2 bg-[#F7F3E8] border border-[#111111]">
                  <strong>CLAIM GENERATOR:</strong> ARGOS Media Defender / C2PA v2.1
                </div>
                <div className="p-2 bg-[#F7F3E8] border border-[#111111]">
                  <strong>SIGNING AUTHORITY:</strong> ARGOS Sovereign Provenance CA 2026
                </div>
                <div className="p-2 bg-[#F7F3E8] border border-[#111111]">
                  <strong>ISSUER DID:</strong> did:argos:sig-7b2f901a
                </div>
                <div className="p-2 bg-[#F7F3E8] border border-[#111111] text-[10px] break-all">
                  <strong>ROOT CRYPTOGRAPHIC SEAL:</strong> {DEMO_PROTECTION.cryptographicSeal}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#111111]/20">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-gray-700 underline font-bold uppercase"
                >
                  ← BACK
                </button>
                <button
                  onClick={nextStep}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center gap-2"
                >
                  {isProcessing ? "STAMPING SEAL..." : "FINALIZE & INITIATE MONITORING →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 05: MONITOR / ACTIVE CONFIRMATION */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Grand Active Banner */}
              <div className="p-6 bg-[#8BCF9B] border-[3px] border-[#111111] brutal-shadow text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#F4CD3F] font-black text-xs uppercase mb-3">
                  SHIELD DEPLOYMENT COMPLETE
                </div>
                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#111111] font-display">
                  ARGOS PROTECTION ACTIVE
                </h3>
                <div className="text-xs font-mono font-bold text-black/80 mt-1">
                  ASSET ID: {DEMO_ASSET.id} // SECURED IN SOVEREIGN VAULT
                </div>
              </div>

              {/* The 5 Required Checkmarks */}
              <div className="bg-white border-[3px] border-[#111111] p-6 space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3 p-2.5 bg-[#F7F3E8] border border-[#111111] font-bold">
                  <span className="text-[#8BCF9B] font-black text-base">✓</span>
                  <span>Authenticity verified</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#F7F3E8] border border-[#111111] font-bold">
                  <span className="text-[#8BCF9B] font-black text-base">✓</span>
                  <span>Media DNA generated</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#F7F3E8] border border-[#111111] font-bold">
                  <span className="text-[#8BCF9B] font-black text-base">✓</span>
                  <span>Provenance registered</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#F7F3E8] border border-[#111111] font-bold">
                  <span className="text-[#8BCF9B] font-black text-base">✓</span>
                  <span>Invisible watermark applied</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-[#F7F3E8] border border-[#111111] font-bold">
                  <span className="text-[#8BCF9B] font-black text-base">✓</span>
                  <span>Integrity fingerprint created</span>
                </div>
              </div>

              {/* Button: START MONITORING */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-gray-700">
                  MONITORING DISPATCH ACTIVE ACROSS 5 REGIONAL HUBS
                </span>
                <a
                  href="#global-watch"
                  onClick={onComplete}
                  className="w-full sm:w-auto px-8 py-4 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-sm font-black uppercase text-center"
                >
                  [ START MONITORING ]
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
