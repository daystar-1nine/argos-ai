'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShieldCheck, ArrowRight } from 'lucide-react';
import BrutalistCard from '@/components/ui/BrutalistCard';

export default function LandingVerification() {
  return (
    <section className="section-argos bg-[#F8E8E8]">
      <div className="container-argos">
        
        <div className="bg-[#F6C6D8] border-[4px] border-[#111111] brutal-shadow-xl p-8 sm:p-12 text-[#111111] min-w-0">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] font-mono text-xs font-black uppercase tracking-wider mb-4">
              13 // ZERO-LOGIN GATEWAY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-display break-words">
              PUBLIC MEDIA VERIFICATION
            </h2>
            <p className="font-mono text-xs sm:text-sm text-[#111111]/85 mt-3 leading-relaxed">
              Anyone can audit media integrity. Journalists, platforms, or legal teams can enter an 
              Argos Asset ID or upload a file to instantly verify whether it is the untouched original or a modified derivative.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 font-mono text-xs">
              <Link
                href="/verify"
                className="px-6 py-3.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-black uppercase tracking-wider flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                OPEN PUBLIC VERIFIER →
              </Link>
              <Link
                href="/certificates"
                className="px-6 py-3.5 bg-[#EFD99C] hover:bg-white text-[#111111] border-[3px] border-[#111111] brutal-btn font-bold uppercase tracking-wider flex items-center gap-2"
              >
                VIEW CERTIFICATES
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
