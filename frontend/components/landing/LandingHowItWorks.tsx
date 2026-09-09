import React from 'react';
import Link from 'next/link';
import { Shield, FileCheck2, Globe, Eye, MessageSquare, Bell, Scale, Search, ArrowRight } from 'lucide-react';
import BrutalistCard from '@/components/ui/BrutalistCard';

export default function LandingHowItWorks() {
  const steps = [
    { num: '01', title: 'PROTECT', desc: 'Verify pre-protection authenticity & inject invisible spread-spectrum watermark.', icon: Shield, color: 'bg-[#EFD99C]' },
    { num: '02', title: 'PROVE', desc: 'Compute SHA-256 and multi-dimensional Media DNA rooted in C2PA v2.1 ledger.', icon: FileCheck2, color: 'bg-[#F6C6D8]' },
    { num: '03', title: 'MONITOR', desc: 'Scan supported public and indexed feeds across global sensor clusters.', icon: Globe, color: 'bg-[#EFD99C]' },
    { num: '04', title: 'DETECT', desc: 'Multi-model neural ensemble analyzes phoneme-viseme sync and vocoder artifacts.', icon: Eye, color: 'bg-[#F6C6D8]' },
    { num: '05', title: 'EXPLAIN', desc: 'Generate human-readable explanations and timestamped frame exhibits.', icon: MessageSquare, color: 'bg-[#EFD99C]' },
    { num: '06', title: 'ALERT', desc: 'Dispatch instant high-priority warnings directly to the verified rights owner.', icon: Bell, color: 'bg-[#F6C6D8]' },
    { num: '07', title: 'RESPOND', desc: 'Package legal evidence dossiers and automated DMCA/DSA platform notices.', icon: Scale, color: 'bg-[#EFD99C]' },
    { num: '08', title: 'VERIFY', desc: 'Provide open zero-login public verification for journalists and platforms.', icon: Search, color: 'bg-[#F4CD3F]' },
  ];

  return (
    <section id="product" className="section-argos bg-[#F8E8E8]">
      <div className="container-argos">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#844469] text-[#EFD99C] border-[2px] border-[#111111] font-mono text-xs font-black uppercase tracking-wider mb-3">
              03 // THE COMPLETE LIFECYCLE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display break-words">
              HOW ARGOS WORKS
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-2">
              Argos is not a simple detector. We defend original assets from creation to takedown.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5"
          >
            Launch Console →
          </Link>
        </div>

        {/* 8-Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`p-5 border-[3px] border-[#111111] brutal-shadow flex flex-col justify-between ${step.color} hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 font-mono">
                    <span className="text-xs font-black text-black/60">{step.num}</span>
                    <div className="w-8 h-8 bg-white border-[2px] border-[#111111] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#111111]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#111111] mb-2 font-display">
                    {step.title}
                  </h3>
                  <p className="font-mono text-xs text-[#111111]/80 leading-relaxed">
                    {step.desc}
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
