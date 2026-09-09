'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Dna, 
  Globe, 
  Eye, 
  Bell, 
  FileText, 
  Scale, 
  Search, 
  ArrowUpRight,
  CheckCircle,
  AlertOctagon,
  Sparkles,
  Smartphone,
  ExternalLink
} from 'lucide-react';

export default function BentoGrid({ onSelectCard }: { onSelectCard?: (id: string) => void }) {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <section id="lifecycle" className="w-full py-20 px-4 lg:px-8 bg-[#F7F3E8] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#844469] text-[#EFD99C] border-[2px] border-[#111111] font-mono text-[11px] font-bold uppercase tracking-wider mb-3">
              01 // SOVEREIGN LIFECYCLE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
              PROTECT. PROVE. MONITOR.<br />
              DETECT. EXPLAIN. ALERT. RESPOND. VERIFY.
            </h2>
          </div>
          <p className="max-w-md font-mono text-xs text-[#111111]/80 leading-relaxed">
            Argos provides an end-to-end defense matrix for authentic creator and enterprise assets. 
            Explore the 8 pillars of media sovereignty below.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* CARD 1: PROTECT (Span 2 cols on md/lg) */}
          <div className="lg:col-span-2 brutal-card bg-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-[#111111]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#111111] text-[#F4CD3F] px-2 py-0.5">
                  PILLAR 01
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 font-display">
                🛡 PROTECT
              </h3>
              <p className="text-sm font-semibold text-[#111111]/80 mb-6">
                "Protect your authentic media before it gets copied."
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#8BCF9B]" />
                  Authenticity Gate
                </div>
                <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#8BCF9B]" />
                  Invisible Watermark
                </div>
                <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#8BCF9B]" />
                  Media DNA Generation
                </div>
                <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-[#8BCF9B]" />
                  Cryptographic Fingerprint
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-[2px] border-[#111111]/20 flex items-center justify-between font-mono text-xs">
              <span className="text-[#844469] font-bold">PROVENANCE SEAL: C2PA v2.1</span>
              <a href="#authenticity-gate" className="font-black text-[#111111] flex items-center gap-1 hover:underline">
                OPEN GATE →
              </a>
            </div>
          </div>

          {/* CARD 2: MEDIA DNA (Span 2 cols on md/lg) */}
          <div className="lg:col-span-2 brutal-card bg-[#844469] text-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Dna className="w-5 h-5 text-[#111111]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#F4CD3F] text-[#111111] px-2 py-0.5">
                  PILLAR 02
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white font-display">
                🧬 MEDIA DNA
              </h3>
              <p className="text-sm font-semibold text-[#EFD99C]/90 mb-4">
                "Give every protected asset a unique digital identity."
              </p>

              {/* DNA Code Bars */}
              <div className="bg-[#111111] border-[2px] border-[#EFD99C] p-3 font-mono text-[11px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#F4CD3F] font-bold">SHA-256</span>
                  <span className="text-white/80 font-mono tracking-widest text-[10px]">
                    e3b0c442...996fb924
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#EFD99C]">VISUAL DNA</span>
                  <div className="w-32 bg-white/20 h-2 rounded-none overflow-hidden">
                    <div className="bg-[#F4CD3F] h-full w-[88%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#EFD99C]">AUDIO DNA</span>
                  <div className="w-32 bg-white/20 h-2 rounded-none overflow-hidden">
                    <div className="bg-[#8BCF9B] h-full w-[74%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#EFD99C]">TEMPORAL DNA</span>
                  <div className="w-32 bg-white/20 h-2 rounded-none overflow-hidden">
                    <div className="bg-[#D95D5D] h-full w-[92%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/20">
                  <span className="text-[#8BCF9B] font-bold">PROVENANCE</span>
                  <span className="text-[#8BCF9B] font-bold">✓ VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-[#EFD99C]">
              <span>SAMPLE ASSET: ARG-2026-8A92F1</span>
              <a href="#media-dna" className="font-bold text-[#F4CD3F] flex items-center gap-1 hover:underline">
                VISUALIZE DNA →
              </a>
            </div>
          </div>

          {/* CARD 3: MONITOR */}
          <div className="brutal-card bg-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5 text-[#111111]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#111111] text-[#F4CD3F] px-2 py-0.5">
                  PILLAR 03
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 font-display">
                🌍 MONITOR
              </h3>
              <p className="text-xs font-semibold text-[#111111]/80 mb-4">
                "Find possible derivatives across supported public and indexed sources."
              </p>

              {/* World Map with small alert markers */}
              <div className="relative bg-[#111111] border-[2px] border-[#111111] p-3 text-white aspect-[16/9] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 retro-grid" />
                {/* SVG Mini World Coordinates */}
                <svg className="w-full h-full text-white/30" viewBox="0 0 100 50">
                  <circle cx="20" cy="20" r="8" fill="currentColor" />
                  <circle cx="50" cy="18" r="7" fill="currentColor" />
                  <circle cx="75" cy="22" r="9" fill="currentColor" />
                  <circle cx="85" cy="38" r="5" fill="currentColor" />
                </svg>
                {/* Small alert markers */}
                <span className="absolute top-3 left-6 w-2.5 h-2.5 bg-[#D95D5D] border border-white led-blink" title="USA Alert" />
                <span className="absolute top-4 left-[46%] w-2 h-2 bg-[#F4CD3F] border border-white led-blink" title="UK Alert" />
                <span className="absolute top-5 left-[68%] w-2.5 h-2.5 bg-[#D95D5D] border border-white led-blink" title="India Alert" />
                <span className="absolute bottom-3 right-4 w-2 h-2 bg-[#8BCF9B] border border-white" title="Australia" />

                <div className="absolute bottom-1 left-2 font-mono text-[9px] bg-black/80 px-1 text-[#F4CD3F]">
                  INDEXED SOURCES: 5 ACTIVE
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#111111]/20 font-mono text-[11px] font-bold">
              <a href="#global-watch" className="flex items-center justify-between text-[#844469] hover:underline">
                <span>VIEW GLOBAL WATCH</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CARD 4: DETECT */}
          <div className="brutal-card bg-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5 text-[#111111]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#111111] text-[#F4CD3F] px-2 py-0.5">
                  PILLAR 04
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 font-display">
                🎭 DETECT
              </h3>
              <p className="text-xs font-semibold text-[#111111]/80 mb-4">
                "Detect deepfake and audio-visual manipulation."
              </p>

              {/* Visual Detection Sub-indicators */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
                  <span>Face Tracking</span>
                  <span className="text-[#D95D5D] font-bold">WARP 94%</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
                  <span>Lip-Sync</span>
                  <span className="text-[#D95D5D] font-bold">+320ms</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
                  <span>Audio Analysis</span>
                  <span className="text-[#D95D5D] font-bold">VOCODER</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-white border border-[#111111]">
                  <span>Temporal Anomaly</span>
                  <span className="text-[#D95D5D] font-bold">DISCONTINUITY</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#111111]/20 font-mono text-[11px] font-bold">
              <a href="#forensics" className="flex items-center justify-between text-[#844469] hover:underline">
                <span>INSPECT MODELS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CARD 5: ALERT */}
          <div className="brutal-card bg-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#D95D5D] text-white border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#D95D5D] text-white px-2 py-0.5">
                  PILLAR 05
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 font-display">
                🚨 ALERT
              </h3>
              <p className="text-xs font-semibold text-[#111111]/80 mb-4">
                "Get notified when suspicious derivatives are discovered."
              </p>

              {/* Realistic Phone Push Notification Mockup */}
              <div className="bg-[#111111] border-[2.5px] border-[#111111] p-3 rounded-none text-white font-mono shadow-[3px_3px_0px_#111111]">
                <div className="flex items-center justify-between text-[9px] text-[#F4CD3F] mb-1">
                  <span className="flex items-center gap-1 font-bold">
                    <Smartphone className="w-3 h-3" />
                    ARGOS SHIELD // PUSH
                  </span>
                  <span>JUST NOW</span>
                </div>
                <div className="font-bold text-xs text-white mb-0.5">
                  CRITICAL: Tampered Derivative Found
                </div>
                <div className="text-[10px] text-white/70 leading-tight">
                  Asset ARG-8A92F1 matched at 94.2% on public feed with facial re-synthesis.
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#111111]/20 font-mono text-[11px] font-bold">
              <a href="#alerts" className="flex items-center justify-between text-[#844469] hover:underline">
                <span>VIEW ALERTS FEED</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CARD 6: FORENSICS */}
          <div className="brutal-card bg-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5 text-[#111111]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#111111] text-[#F4CD3F] px-2 py-0.5">
                  PILLAR 06
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 font-display">
                📑 FORENSICS
              </h3>
              <p className="text-xs font-semibold text-[#111111]/80 mb-4">
                "Turn detection into evidence."
              </p>

              {/* Forensic Report Preview Box */}
              <div className="bg-white border-[2px] border-[#111111] p-3 font-mono text-[10px] leading-tight space-y-1">
                <div className="font-black text-black border-b border-black pb-1 flex justify-between">
                  <span>ARGOS FORENSIC REPORT</span>
                  <span className="text-[#844469]">#9904</span>
                </div>
                <div className="text-gray-700">CASE: #ARG-8291</div>
                <div className="text-gray-700">ANOMALY: 00:14–00:18 (+320ms)</div>
                <div className="text-[#D95D5D] font-bold">VERDICT: MANIPULATION DETECTED</div>
                <div className="text-gray-500 text-[9px] pt-1 border-t border-gray-200">
                  SHA-256 SIGNED EVIDENCE DOSSIER
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#111111]/20 font-mono text-[11px] font-bold">
              <a href="#forensics" className="flex items-center justify-between text-[#844469] hover:underline">
                <span>VIEW FORENSIC DOSSIER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CARD 7: RESPOND */}
          <div className="brutal-card bg-[#EFD99C] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5 text-[#111111]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#111111] text-[#F4CD3F] px-2 py-0.5">
                  PILLAR 07
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 font-display">
                ⚖ RESPOND
              </h3>
              <p className="text-xs font-semibold text-[#111111]/80 mb-4">
                "Generate evidence and assist with platform reporting."
              </p>

              {/* Takedown Actions list */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="p-2 bg-white border border-[#111111] flex items-center justify-between font-bold">
                  <span>Evidence Pack ZIP</span>
                  <span className="text-[#8BCF9B]">READY</span>
                </div>
                <div className="p-2 bg-white border border-[#111111] flex items-center justify-between font-bold">
                  <span>DMCA 512(c) Notice</span>
                  <span className="text-[#8BCF9B]">GENERATED</span>
                </div>
                <div className="p-2 bg-white border border-[#111111] flex items-center justify-between font-bold">
                  <span>EU DSA Art. 16</span>
                  <span className="text-[#8BCF9B]">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#111111]/20 font-mono text-[11px] font-bold">
              <a href="#incident-response" className="flex items-center justify-between text-[#844469] hover:underline">
                <span>TAKEDOWN CENTER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* CARD 8: VERIFY */}
          <div className="brutal-card bg-[#F4CD3F] p-6 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#111111] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-[#111111] text-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center font-bold">
                  <Search className="w-5 h-5 text-[#F4CD3F]" />
                </div>
                <span className="font-mono text-[10px] font-black uppercase bg-[#111111] text-[#EFD99C] px-2 py-0.5">
                  PILLAR 08
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-[#111111] font-display">
                🔎 VERIFY
              </h3>
              <p className="text-xs font-semibold text-[#111111]/90 mb-4">
                "Verify the provenance and integrity of protected media."
              </p>

              {/* Public verification lookup box */}
              <div className="bg-white border-[2px] border-[#111111] p-3 font-mono text-xs space-y-2">
                <div className="text-[10px] text-[#111111]/70 font-bold uppercase">
                  ENTER ASSET ID OR HASH
                </div>
                <div className="p-1.5 bg-[#F7F3E8] border border-[#111111] text-[11px] font-bold text-[#111111]">
                  ARG-2026-8A92F1
                </div>
                <div className="text-[9px] text-[#844469] font-bold">
                  PUBLIC VERIFICATION LEDGER ONLINE
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-[2px] border-[#111111]/20 font-mono text-[11px] font-bold">
              <Link href="/verify" className="flex items-center justify-between text-[#111111] hover:underline font-black">
                <span>PUBLIC VERIFIER →</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
