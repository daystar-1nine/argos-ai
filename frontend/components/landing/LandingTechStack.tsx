import React from 'react';
import { Cpu, Database, Network, Shield, Binary } from 'lucide-react';
import BrutalistCard from '@/components/ui/BrutalistCard';

export default function LandingTechStack() {
  const technologies = [
    { title: "C2PA v2.1 PROVENANCE", desc: "Hardware-level content credentials signed with elliptic curve cryptographic seals.", icon: Shield },
    { title: "SYNCNET ENSEMBLE", desc: "Phoneme-to-viseme temporal neural models measuring audio-visual synchronization lag.", icon: Cpu },
    { title: "QDRANT VECTOR DNA", desc: "High-dimensional visual and acoustic embeddings matched across indexed millions.", icon: Database },
    { title: "SPREAD-SPECTRUM DWT", desc: "Wavelet frequency watermarking designed to survive severe re-encoding & geometric crop.", icon: Binary },
  ];

  return (
    <section className="section-argos bg-[#F8E8E8]">
      <div className="container-argos">
        
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#844469] text-[#EFD99C] border-[2px] border-[#111111] font-mono text-xs font-black uppercase tracking-wider mb-3">
            14 // DEEP TECH STACK
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display break-words">
            CRYPTOGRAPHIC FORENSIC RIGOR
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-2">
            Built on peer-reviewed forensic physics, open provenance standards, and multi-model neural consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {technologies.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div key={idx} className="p-5 bg-white border-[3px] border-[#111111] brutal-shadow flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 bg-[#EFD99C] border-[2px] border-[#111111] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#844469]" />
                  </div>
                  <h3 className="font-black text-base text-[#111111] uppercase font-display mb-2">
                    {t.title}
                  </h3>
                  <p className="font-mono text-xs text-[#111111]/80 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
