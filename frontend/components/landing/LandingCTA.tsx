import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export default function LandingCTA() {
  return (
    <section className="section-argos bg-[#EFD99C] border-b-[4px] border-[#111111]">
      <div className="container-argos text-center max-w-4xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] font-mono text-xs font-black uppercase tracking-wider mb-6">
          15 // TAKE ACTION
        </div>

        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#111111] font-display leading-[0.95] mb-6">
          YOUR MEDIA DESERVES<br />
          A DIGITAL SHIELD.
        </h2>

        <p className="font-mono text-xs sm:text-base text-[#111111]/80 max-w-2xl mx-auto mb-8 leading-relaxed">
          Don't wait until a manipulated derivative goes viral. Establish provenance now, 
          monitor supported public and indexed feeds, and get the evidence to fight back.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/protect"
            className="px-8 py-4 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-sm font-black uppercase tracking-wider flex items-center gap-2"
          >
            PROTECT MY MEDIA NOW →
          </Link>

          <Link
            href="/dashboard"
            className="px-8 py-4 bg-[#F6C6D8] hover:bg-[#ffb3cc] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-sm font-black uppercase tracking-wider flex items-center gap-2"
          >
            ENTER OPERATOR CONSOLE
          </Link>
        </div>

      </div>
    </section>
  );
}
