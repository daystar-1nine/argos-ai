import React from 'react';
import { AlertOctagon, Skull, Lock, ShieldOff, EyeOff } from 'lucide-react';
import BrutalistCard from '@/components/ui/BrutalistCard';

export default function LandingProblem() {
  const problems = [
    {
      title: "SYNTHETIC DEEPFAKES EVERYWHERE",
      desc: "Generative AI can clone your voice in 3 seconds and swap your face in 4K resolution. Creators are left defenseless without verifiable provenance.",
      badge: "THREAT 01",
      variant: "pink" as const
    },
    {
      title: "STOLEN IDENTITY & IMPERSONATION",
      desc: "Scammers take authentic speeches and executive keynotes, retarget mouth movements, and spread falsified statements across public social streams.",
      badge: "THREAT 02",
      variant: "cream" as const
    },
    {
      title: "BURDEN OF PROOF FALLS ON YOU",
      desc: "Platforms demand legal evidence before removing derivatives. Without cryptographic Media DNA or frame-by-frame forensic reports, takedowns stall.",
      badge: "THREAT 03",
      variant: "pink" as const
    }
  ];

  return (
    <section className="section-argos bg-[#F8E8E8]">
      <div className="container-argos">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D95D5D] text-white border-[2px] border-[#111111] font-mono text-xs font-black uppercase tracking-wider mb-3">
            02 // THE CRISIS OF DIGITAL TRUST
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display break-words">
            AI CAN FAKE ANYTHING.<br />
            WHO PROVES YOU ARE REAL?
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-3 leading-relaxed">
            By 2026, 90% of online media will be synthetically generated or modified. 
            Traditional copyright is toothless when unauthorized deepfakes go viral in minutes.
          </p>
        </div>

        {/* 3 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <BrutalistCard
              key={i}
              variant={p.variant}
              header={
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-black">{p.badge}</span>
                  <AlertOctagon className="w-4 h-4 text-[#D95D5D]" />
                </div>
              }
            >
              <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] mb-3 font-display">
                {p.title}
              </h3>
              <p className="font-mono text-xs text-[#111111]/85 leading-relaxed">
                {p.desc}
              </p>
            </BrutalistCard>
          ))}
        </div>

      </div>
    </section>
  );
}
