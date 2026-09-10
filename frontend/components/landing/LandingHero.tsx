'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { Play, Pause, RotateCcw, Volume2, Activity, ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import ComparisonMedia from '@/components/forensics/ComparisonMedia';

export default function LandingHero() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(15.4); // zone 00:14 - 00:18
  const [crtFlicker, setCrtFlicker] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);


  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          return next > 32 ? 0 : parseFloat(next.toFixed(1));
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const isAnomaly = currentTime >= 14 && currentTime <= 18;
  const syncScore = isAnomaly ? 41 : 98;
  const riskScore = isAnomaly ? 93 : 8;
  const formattedTime = `00:${currentTime < 10 ? '0' : ''}${Math.floor(currentTime)}`;

  return (
    <section className="section-argos bg-[#F8E8E8] relative overflow-hidden">
      {/* Retro decorative dot grid */}
      <div className="absolute inset-0 retro-grid opacity-20 pointer-events-none" />

      <div className="container-argos">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Bold Copy & Actions */}
          <div className="lg:col-span-6 flex flex-col items-start min-w-0">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F6C6D8] border-[2px] border-[#111111] brutal-shadow-sm font-mono text-xs font-black uppercase tracking-wider mb-6">
              <span className="w-2.5 h-2.5 bg-[#D95D5D] border border-[#111111] led-blink" />
              CYBER FORENSICS // MEDIA DNA GUARDIAN
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-[#111111] mb-6 font-display break-words">
              YOUR MEDIA.<br />
              <span className="bg-[#F4CD3F] px-2 py-0.5 border-[3px] border-[#111111] brutal-shadow-sm inline-block transform -rotate-1 mt-1">
                STAYS YOURS.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg font-medium text-[#111111]/85 leading-relaxed max-w-xl mb-8 font-display">
              Protect authentic media. Detect manipulation. Track suspicious derivatives. Take action.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                href="/protect"
                className="w-full sm:w-auto px-7 py-4 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                PROTECT MY MEDIA →
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-7 py-4 bg-[#F6C6D8] hover:bg-[#ffb3cc] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                EXPLORE ARGOS
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t-[2px] border-[#111111]/20 w-full flex flex-wrap gap-4 text-xs font-mono font-bold text-[#111111]/70">
              <span className="flex items-center gap-1.5">
                <span className="text-[#8BCF9B]">✓</span> C2PA v2.1 STANDARD
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#8BCF9B]">✓</span> SPREAD-SPECTRUM WATERMARK
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#8BCF9B]">✓</span> SYNCNET MULTI-MODEL
              </span>
            </div>

          </div>

          {/* Right Column: Premium Y2K CRT Monitor */}
          <div className="lg:col-span-6 min-w-0">
            <div className="bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-4 sm:p-6 rounded-none min-w-0">
              
              {/* Bezel Label */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b-[3px] border-[#111111] font-mono text-xs font-black uppercase">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#D95D5D] border border-black" />
                  <div className="w-2.5 h-2.5 bg-[#F4CD3F] border border-black" />
                  <div className="w-2.5 h-2.5 bg-[#8BCF9B] border border-black" />
                  <span className="ml-1 tracking-wider text-[#111111]">Y2K CRT FORENSIC MONITOR</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#844469]">
                  <span>REC // {formattedTime} / 00:32</span>
                </div>
              </div>

              {/* CRT Screen with Scanlines */}
              <div className={`bg-[#0e1218] border-[3px] border-[#111111] text-white p-3 sm:p-4 overflow-hidden ${crtFlicker ? 'crt-scanlines' : ''}`}>
                
                {/* Status Bar */}
                <div className="flex items-center justify-between font-mono text-[10px] text-[#EFD99C] pb-2 border-b border-white/20">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-[#D95D5D] led-blink-fast' : 'bg-[#8BCF9B]'}`} />
                    FORENSIC COMPARISON FEED
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase ${
                    isAnomaly ? 'bg-[#D95D5D] text-white led-blink-fast' : 'bg-[#8BCF9B] text-black'
                  }`}>
                    {isAnomaly ? 'MANIPULATION DETECTED' : 'SYNCHRONIZED'}
                  </span>
                </div>

                {/* Real Media Dual Screen Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                  <ComparisonMedia
                    variant="original"
                    src="/demo/original/original-01.jpg"
                    title="ORIGINAL [VERIFIED]"
                    badge="✓ PROVENANCE VALID"
                    isAnomaly={false}
                    showOverlay={showOverlay}
                    timestamp={currentTime}
                    frameNumber={Math.floor(currentTime * 30)}
                    compact={true}
                  />
                  <ComparisonMedia
                    variant="manipulated"
                    src={isAnomaly ? "/demo/manipulated/manipulated-01.jpg" : "/demo/manipulated/manipulated-01-normal.jpg"}
                    title="MANIPULATED [DETECTED]"
                    badge={isAnomaly ? "⚠ ANOMALY DETECTED" : "INDEXED DERIVATIVE"}
                    isAnomaly={isAnomaly}
                    showOverlay={showOverlay}
                    timestamp={currentTime}
                    frameNumber={Math.floor(currentTime * 30)}
                    anomalyLabel="LIP-SYNC ANOMALY +320ms"
                    riskPct={riskScore}
                    compact={true}
                  />
                </div>


                {/* Waveform Visualizer */}
                <div className="bg-black/70 p-2 border border-white/20 font-mono text-[9px] space-y-1">
                  <div className="flex justify-between text-white/70">
                    <span className="text-[#F4CD3F] flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> AUDIO SPECTRAL & LIP SYNCHRONIZATION
                    </span>
                    <span className={isAnomaly ? 'text-[#D95D5D] font-bold' : 'text-[#8BCF9B]'}>
                      {isAnomaly ? 'LAG: +320ms' : '0.0ms'}
                    </span>
                  </div>
                  <div className="flex items-end gap-0.5 h-6 bg-black p-0.5">
                    {[30, 45, 60, 50, 40, 70, 85, 90, 80, 50, 40, 95, 90, 85, 92, 70, 60, 45, 50, 65, 30, 20].map((h, idx) => (
                      <div
                        key={idx}
                        className="flex-1"
                        style={{
                          height: `${h}%`,
                          backgroundColor: idx >= 11 && idx <= 15 ? '#D95D5D' : '#F4CD3F'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Telemetry Bar: SYNC SCORE, RISK SCORE, MEDIA DNA, PROVENANCE */}
                <div className="grid grid-cols-4 gap-1 mt-2 text-[9px] font-mono text-center">
                  <div className="bg-black/80 p-1.5 border border-white/20">
                    <div className="text-white/60 text-[8px]">SYNC SCORE</div>
                    <div className={`font-black ${syncScore < 60 ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                      {syncScore}%
                    </div>
                  </div>
                  <div className="bg-black/80 p-1.5 border border-white/20">
                    <div className="text-white/60 text-[8px]">RISK SCORE</div>
                    <div className={`font-black ${riskScore > 70 ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                      {riskScore}%
                    </div>
                  </div>
                  <div className="bg-black/80 p-1.5 border border-white/20">
                    <div className="text-white/60 text-[8px]">MEDIA DNA</div>
                    <div className="font-black text-[#F4CD3F]">MATCHED ✓</div>
                  </div>
                  <div className="bg-black/80 p-1.5 border border-white/20">
                    <div className="text-white/60 text-[8px]">PROVENANCE</div>
                    <div className="font-black text-[#8BCF9B]">C2PA v2.1</div>
                  </div>
                </div>

                {/* Scrubber Controls */}
                <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-2 py-1 bg-[#EFD99C] hover:bg-[#F4CD3F] text-black font-bold text-[10px] cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setCurrentTime(15.4)}
                      className="px-2.5 py-1 bg-[#D95D5D] hover:bg-[#ff7373] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                      title="Seek to high risk anomaly"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      JUMP TO ANOMALY
                    </button>
                    <button
                      onClick={() => setShowOverlay(!showOverlay)}
                      className={`px-2 py-1 border border-white/40 text-[9px] font-bold cursor-pointer ${
                        showOverlay ? 'bg-[#8BCF9B] text-[#111111]' : 'bg-black text-white/60'
                      }`}
                    >
                      OVERLAY: {showOverlay ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <button
                    onClick={() => setCrtFlicker(!crtFlicker)}
                    className={`px-2 py-0.5 border border-white/40 text-[9px] font-bold ${
                      crtFlicker ? 'bg-[#844469] text-white' : 'bg-black text-white/50'
                    }`}
                  >
                    SCANLINES: {crtFlicker ? 'ON' : 'OFF'}
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
