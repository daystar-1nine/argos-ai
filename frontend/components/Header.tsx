'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RetroLogo from './RetroLogo';
import { Shield, Radio, Terminal, ExternalLink, Menu, X, ArrowRight } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F3E8] border-b-[3px] border-[#111111] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <RetroLogo />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
          <a href="#lifecycle" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            01 Lifecycle
          </a>
          <a href="#authenticity-gate" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            02 Auth Gate
          </a>
          <a href="#media-dna" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            03 Media DNA
          </a>
          <a href="#attack-lab" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            04 Attack Lab
          </a>
          <a href="#forensics" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            05 Forensics
          </a>
          <a href="#global-watch" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            06 Global Watch
          </a>
        </nav>

        {/* Header Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/verify"
            className="px-3 py-1.5 bg-[#EFD99C] border-[2.5px] border-[#111111] brutal-shadow-sm font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#F4CD3F] transition-all flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Verify Media
          </Link>

          <Link
            href="/dashboard"
            className="px-4 py-1.5 bg-[#F4CD3F] border-[2.5px] border-[#111111] brutal-shadow-sm font-mono text-xs font-black uppercase tracking-wider hover:bg-[#EFD99C] transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            Launch Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="px-2.5 py-1 bg-[#F4CD3F] border-[2px] border-[#111111] font-mono text-[10px] font-black uppercase"
          >
            Console
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 border-[2px] border-[#111111] bg-[#EFD99C]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t-[2px] border-[#111111] flex flex-col gap-2 font-mono text-xs font-bold uppercase bg-[#EFD99C] p-4 border-[2px] border-[#111111] brutal-shadow">
          <a 
            href="#lifecycle" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 border-b border-[#111111]/20"
          >
            01 Lifecycle Bento
          </a>
          <a 
            href="#authenticity-gate" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 border-b border-[#111111]/20"
          >
            02 Authenticity Gate
          </a>
          <a 
            href="#media-dna" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 border-b border-[#111111]/20"
          >
            03 Media DNA
          </a>
          <a 
            href="#attack-lab" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 border-b border-[#111111]/20"
          >
            04 Attack Lab
          </a>
          <a 
            href="#forensics" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 border-b border-[#111111]/20"
          >
            05 Forensics & Explainable AI
          </a>
          <a 
            href="#global-watch" 
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 border-b border-[#111111]/20"
          >
            06 Argos Global Watch
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/verify"
              className="w-full py-2 text-center bg-[#F7F3E8] border-[2px] border-[#111111] font-bold"
            >
              Public Verify
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-2 text-center bg-[#F4CD3F] border-[2px] border-[#111111] font-black"
            >
              Enter Forensic Console →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
