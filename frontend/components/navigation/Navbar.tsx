'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { Menu, X, Shield, Terminal, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8E8E8] border-b-[3px] border-[#111111]">
      {/* Centered Constrained Container */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-18 flex items-center justify-between">
        
        {/* LEFT: Argos logo + ARGOS AI */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <ArgosLogo />
          </Link>
        </div>

        {/* CENTER: Product, Protection, Detection, Monitoring, Forensics */}
        <nav className="hidden lg:flex items-center gap-7 font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
          <Link href="/#product" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            Product
          </Link>
          <Link href="/protect" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            Protection
          </Link>
          <Link href="/detections" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            Detection
          </Link>
          <Link href="/monitor" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            Monitoring
          </Link>
          <Link href="/detections" className="hover:text-[#844469] hover:underline underline-offset-4 transition-colors">
            Forensics
          </Link>
        </nav>

        {/* RIGHT: Verify, Dashboard, Get Started */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <Link
            href="/verify"
            className="px-3.5 py-2 bg-[#EFD99C] hover:bg-[#F4CD3F] text-[#111111] border-[2.5px] border-[#111111] brutal-shadow-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5" />
            Verify
          </Link>

          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-[#F6C6D8] hover:bg-[#ffb3cc] text-[#111111] border-[2.5px] border-[#111111] brutal-shadow-sm font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            Dashboard
          </Link>

          <Link
            href="/protect"
            className="px-4 py-2 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/dashboard"
            className="px-2.5 py-1.5 bg-[#F4CD3F] border-[2px] border-[#111111] font-mono text-[10px] font-black uppercase"
          >
            Console
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 border-[2px] border-[#111111] bg-[#EFD99C] flex items-center justify-center"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t-[3px] border-[#111111] bg-[#EFD99C] p-5 font-mono text-xs font-bold uppercase space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <Link 
            href="/#product" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 border-b border-[#111111]/20"
          >
            Product
          </Link>
          <Link 
            href="/protect" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 border-b border-[#111111]/20"
          >
            Protection
          </Link>
          <Link 
            href="/detections" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 border-b border-[#111111]/20"
          >
            Detection
          </Link>
          <Link 
            href="/monitor" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 border-b border-[#111111]/20"
          >
            Monitoring
          </Link>
          <Link 
            href="/detections" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 border-b border-[#111111]/20"
          >
            Forensics
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center bg-[#F8E8E8] border-[2px] border-[#111111] font-bold"
            >
              Public Verify
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center bg-[#F6C6D8] border-[2px] border-[#111111] font-black"
            >
              Enter Dashboard
            </Link>
            <Link
              href="/protect"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center bg-[#F4CD3F] border-[2px] border-[#111111] font-black"
            >
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
