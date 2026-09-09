import React from 'react';
import Link from 'next/link';
import RetroLogo from './RetroLogo';
import { Shield, Terminal, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#111111] text-[#EFD99C] border-t-[4px] border-[#111111] pt-16 pb-12 px-4 lg:px-8 font-mono">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/20">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="p-2 bg-[#F4CD3F] border-[2px] border-black inline-block mb-4">
              <RetroLogo />
            </div>
            
            <div className="text-xl font-black text-white uppercase font-display tracking-tight mt-1 mb-2">
              Protect. Detect. Verify. Respond.
            </div>

            <p className="text-xs text-[#EFD99C]/70 leading-relaxed max-w-sm mb-4">
              Argos AI gives creators a way to establish provenance, protect authentic media, 
              detect manipulated derivatives, and respond when their content is misused.
            </p>

            <div className="text-[10px] text-[#F4CD3F] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
              SOVEREIGN MEDIA DEFENSE MATRIX // C2PA v2.1 COMPLIANT
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="flex flex-col gap-2.5">
              <span className="text-[#F4CD3F] text-[10px] pb-1 border-b border-white/10">
                PLATFORM
              </span>
              <a href="#lifecycle" className="hover:text-white hover:underline transition-colors">
                Product
              </a>
              <a href="#authenticity-gate" className="hover:text-white hover:underline transition-colors">
                How it Works
              </a>
              <a href="#forensics" className="hover:text-white hover:underline transition-colors">
                Forensics
              </a>
              <a href="#attack-lab" className="hover:text-white hover:underline transition-colors">
                Attack Lab
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[#F4CD3F] text-[10px] pb-1 border-b border-white/10">
                TRUST & DOCS
              </span>
              <Link href="/verify" className="hover:text-white hover:underline transition-colors">
                Public Verify
              </Link>
              <Link href="/dashboard" className="hover:text-white hover:underline transition-colors">
                Console Access
              </Link>
              <a href="#security" className="hover:text-white hover:underline transition-colors">
                Security
              </a>
              <a href="#docs" className="hover:text-white hover:underline transition-colors">
                Documentation
              </a>
            </div>
          </div>

          {/* Col 3: Launch Console CTA */}
          <div className="md:col-span-3 flex flex-col justify-between p-4 bg-[#844469] border-[2px] border-white/30 text-white">
            <div>
              <div className="text-xs font-black uppercase text-[#F4CD3F] mb-1">
                READY TO DEFEND YOUR MEDIA?
              </div>
              <div className="text-[11px] text-white/90 leading-tight">
                Launch the Argos Forensic Console or verify existing assets immediately.
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/dashboard"
                className="w-full py-2 bg-[#F4CD3F] text-black font-black uppercase text-xs text-center border-[2px] border-black brutal-btn"
              >
                ENTER CONSOLE →
              </Link>
              <Link
                href="/verify"
                className="w-full py-2 bg-white text-black font-bold uppercase text-xs text-center border-[2px] border-black"
              >
                PUBLIC VERIFY
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Mandatory Legal Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[10px] text-[#EFD99C]/60">
          <div className="max-w-2xl leading-relaxed">
            <span className="font-bold text-[#EFD99C]/90">DISCLAIMER: </span>
            "AI analysis is probabilistic and may produce false positives or false negatives. 
            Monitoring coverage depends on accessible, indexed and integrated sources."
          </div>

          <div className="whitespace-nowrap text-[#F4CD3F]/80">
            © 2026 ARGOS AI INC. // ALL RIGHTS RESERVED.
          </div>
        </div>

      </div>
    </footer>
  );
}
