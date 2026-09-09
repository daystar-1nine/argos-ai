import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Camera } from 'lucide-react';
import BrutalistCard from '@/components/ui/BrutalistCard';

export default function LandingProtection() {
  return (
    <section className="section-argos bg-[#F8E8E8]">
      <div className="container-argos">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-6 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F6C6D8] border-[2px] border-[#111111] font-mono text-xs font-black uppercase tracking-wider mb-4">
              04 // SOVEREIGN EMBEDDING
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display break-words">
              BEFORE WE PROTECT IT,<br />
              WE VERIFY IT.
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-3 leading-relaxed">
              Argos prevents counterfeit registrations. Every media asset uploaded must pass optical 
              PRNU sensor checks and diffusion anomaly gates before receiving a sovereign C2PA seal.
            </p>

            <div className="mt-6 space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#EFD99C] border-[2px] border-[#111111] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8BCF9B] shrink-0" />
                <span>Spread-spectrum watermark remains resilient through 70% resizing and transcode.</span>
              </div>
              <div className="p-3 bg-[#F6C6D8] border-[2px] border-[#111111] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8BCF9B] shrink-0" />
                <span>100% Invisible to human eyes (Peak Signal-to-Noise Ratio &gt; 46 dB).</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/protect"
                className="px-6 py-3.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase tracking-wider inline-flex items-center gap-2"
              >
                OPEN PROTECTION WIZARD →
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Gate Card Preview */}
          <div className="lg:col-span-6 min-w-0">
            <BrutalistCard
              variant="cream"
              header={
                <div className="flex items-center justify-between w-full">
                  <span>AUTHENTICITY GATE AUDIT</span>
                  <span className="bg-[#8BCF9B] text-black px-2 py-0.5 text-[9px] font-bold">PASSED</span>
                </div>
              }
            >
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center p-2.5 bg-white border border-[#111111]">
                  <span className="font-bold">Hardware Sensor Noise:</span>
                  <span className="text-[#8BCF9B] font-black">VALID PRNU</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white border border-[#111111]">
                  <span className="font-bold">Synthetic Diffusion Noise:</span>
                  <span className="text-[#8BCF9B] font-black">&lt;2.1% RESIDUE</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white border border-[#111111]">
                  <span className="font-bold">Temporal Kinematics:</span>
                  <span className="text-[#8BCF9B] font-black">CONTINUOUS</span>
                </div>

                <div className="p-4 bg-[#8BCF9B] border-[2px] border-[#111111] text-black text-center font-black uppercase font-display text-sm mt-4">
                  AUTHENTICITY ESTABLISHED // PROTECTION CERTIFICATE ISSUED
                </div>
              </div>
            </BrutalistCard>
          </div>

        </div>

      </div>
    </section>
  );
}
