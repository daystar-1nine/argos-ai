import React from 'react';
import Link from 'next/link';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { Shield, Terminal, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#111111] text-[#EFD99C] border-t-[4px] border-[#111111] pt-16 pb-12 px-6 lg:px-8 font-mono">
      <div className="max-w-[1440px] mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/20">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="p-2.5 bg-[#F4CD3F] border-[2.5px] border-black inline-block mb-4 shadow-[3px_3px_0px_#F6C6D8]">
              <ArgosLogo />
            </div>
            
            <div className="text-xl font-black text-white uppercase font-display tracking-tight mt-1 mb-2">
              Protect. Detect. Verify. Respond.
            </div>

            <p className="text-xs text-[#EFD99C]/70 leading-relaxed max-w-sm mb-4">
              Argos AI provides sovereign digital provenance, protects authentic media, 
              detects synthetic manipulation, and assists creators with legal reporting workflows.
            </p>

            <div className="text-[10px] text-[#F4CD3F] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
              SOVEREIGN MEDIA DEFENSE MATRIX // C2PA v2.1 COMPLIANT
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6 text-xs font-bold uppercase tracking-wider">
            <div className="flex flex-col gap-2.5">
              <span className="text-[#F4CD3F] text-[10px] pb-1 border-b border-white/10 font-black">
                PLATFORM
              </span>
              <Link href="/#product" className="hover:text-white hover:underline transition-colors">
                Product
              </Link>
              <Link href="/protect" className="hover:text-white hover:underline transition-colors">
                Protection
              </Link>
              <Link href="/detections" className="hover:text-white hover:underline transition-colors">
                Detection
              </Link>
              <Link href="/monitor" className="hover:text-white hover:underline transition-colors">
                Monitoring
              </Link>
              <Link href="/detections" className="hover:text-white hover:underline transition-colors">
                Forensics
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <span className="text-[#F6C6D8] text-[10px] pb-1 border-b border-white/10 font-black">
                LEGAL & TRUST
              </span>
              <Link href="/help" className="hover:text-white hover:underline transition-colors">
                Privacy
              </Link>
              <Link href="/settings" className="hover:text-white hover:underline transition-colors">
                Security
              </Link>
              <Link href="/help" className="hover:text-white hover:underline transition-colors">
                Terms
              </Link>
              <Link href="/help" className="hover:text-white hover:underline transition-colors">
                Contact
              </Link>
              <Link href="/verify" className="hover:text-white hover:underline transition-colors">
                Verify Portal
              </Link>
            </div>
          </div>

          {/* Col 3: Launch Console CTA Box */}
          <div className="md:col-span-3 flex flex-col justify-between p-5 bg-[#844469] border-[2.5px] border-white/30 text-white shadow-[4px_4px_0px_#F4CD3F]">
            <div>
              <div className="text-xs font-black uppercase text-[#F4CD3F] mb-1">
                DEFEND YOUR MEDIA
              </div>
              <div className="text-[11px] text-white/90 leading-tight">
                Audit an existing asset or launch the full Argos Forensics console immediately.
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                className="w-full py-2.5 bg-[#F4CD3F] text-black font-black uppercase text-xs text-center border-[2px] border-black brutal-btn"
              >
                Launch Console →
              </Link>
              <Link
                href="/verify"
                className="w-full py-2 bg-[#F6C6D8] text-black font-bold uppercase text-xs text-center border-[2px] border-black brutal-btn"
              >
                Public Verify
              </Link>
            </div>
          </div>

        </div>

        {/* Mandatory Footer Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[10px] text-[#EFD99C]/60">
          <div className="max-w-2xl leading-relaxed">
            <span className="font-bold text-[#EFD99C]/90">DISCLAIMER: </span>
            "AI analysis is probabilistic and may produce false positives or false negatives. 
            Monitoring coverage depends on accessible, indexed and integrated sources."
          </div>

          <div className="whitespace-nowrap text-[#F4CD3F]/80 font-bold">
            © 2026 ARGOS AI INC. // ALL RIGHTS RESERVED.
          </div>
        </div>

      </div>
    </footer>
  );
}
