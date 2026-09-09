'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Volume2, 
  Activity,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HeroCRT({ onProtectClick }: { onProtectClick?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(15.4); // right in the high risk anomaly zone 00:14 - 00:18
  const [activeView, setActiveView] = useState<'split' | 'heatmap' | 'landmarks'>('split');
  const [crtFlicker, setCrtFlicker] = useState(true);

  // Playback loop simulator
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          return next > 32 ? 0 : parseFloat(next.toFixed(1));
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const isAnomalyZone = currentTime >= 14 && currentTime <= 18;
  const isSuspiciousZone = currentTime >= 7 && currentTime < 14;
  const syncPct = isAnomalyZone ? 41 : isSuspiciousZone ? 68 : 98;
  const riskPct = isAnomalyZone ? 93 : isSuspiciousZone ? 42 : 8;

  // Format time as mm:ss
  const formattedTime = `00:${currentTime < 10 ? '0' : ''}${Math.floor(currentTime)}`;

  return (
    <section className="relative w-full pt-10 pb-16 px-4 lg:px-8 bg-[#F7F3E8] overflow-hidden border-b-[3px] border-[#111111]">
      {/* Retro background decorative elements */}
      <div className="absolute inset-0 retro-grid opacity-30 pointer-events-none" />
      
      {/* Decorative top-right badge */}
      <div className="hidden md:flex absolute top-6 right-8 bg-[#EFD99C] border-[2px] border-[#111111] px-3 py-1 brutal-shadow-sm font-mono text-[11px] font-bold text-[#111111] items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#D95D5D] led-blink" />
        LIVE THREAT DEFENSE V3.4 // ACTIVE
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        
        {/* Left Column: Bold Neo-Brutalist Copy & CTAs */}
        <div className="lg:col-span-5 flex flex-col items-start">
          
          {/* Subtle mascot chip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#844469] text-[#F4CD3F] border-[2.5px] border-[#111111] brutal-shadow-sm font-mono text-xs font-black uppercase tracking-wider mb-6">
            <span className="w-2.5 h-2.5 bg-[#F4CD3F] border border-[#111111] inline-block" />
            ARGOS GUARDIAN SHIELD ONLINE
          </div>

          {/* Huge Neo-brutalist Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black uppercase tracking-tighter leading-[0.92] text-[#111111] mb-6 font-display">
            YOUR MEDIA.<br />
            <span className="bg-[#F4CD3F] px-2 py-0.5 border-[3px] border-[#111111] brutal-shadow-sm inline-block transform -rotate-1 mt-1">
              STAYS YOURS.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg font-medium text-[#111111]/85 leading-relaxed max-w-xl mb-8">
            Argos AI protects authentic photos and videos, detects unauthorized manipulation, 
            tracks suspicious derivatives, and gives creators the evidence to fight back.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onProtectClick || (() => {
                const el = document.getElementById('protect-workflow');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/dashboard/protect';
              })}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-sm font-black flex items-center justify-center gap-2"
            >
              PROTECT MY MEDIA →
            </button>

            <a
              href="#forensics"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#EFD99C] hover:bg-[#f7e6b8] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-sm font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              WATCH DEMO
            </a>
          </div>

          {/* Trust points */}
          <div className="mt-8 pt-6 border-t-[2px] border-[#111111]/20 w-full flex flex-wrap gap-4 text-xs font-mono font-bold text-[#111111]/70">
            <span className="flex items-center gap-1.5">
              <span className="text-[#8BCF9B]">✓</span> C2PA v2.1 PROVENANCE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#8BCF9B]">✓</span> INVISIBLE DNA WATERMARK
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#8BCF9B]">✓</span> SYNCNET MULTI-MODEL FORENSICS
            </span>
          </div>
        </div>

        {/* Right Column: Retro CRT Monitor Display */}
        <div className="lg:col-span-7">
          <div className="relative bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-4 sm:p-6 rounded-none">
            
            {/* CRT Monitor Header / Bezel Label */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b-[3px] border-[#111111] font-mono text-xs font-black uppercase">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D95D5D] border border-[#111111] rounded-none" />
                <div className="w-3 h-3 bg-[#F4CD3F] border border-[#111111] rounded-none" />
                <div className="w-3 h-3 bg-[#8BCF9B] border border-[#111111] rounded-none" />
                <span className="ml-2 tracking-wider text-[#111111]">ARGOS CRT-MONITOR // SCAN-CH.01</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline bg-[#111111] text-[#F4CD3F] px-2 py-0.5 text-[10px]">
                  REC // 3840x2160
                </span>
                <span className="text-[#844469] font-black">{formattedTime} / 00:32</span>
              </div>
            </div>

            {/* CRT Display Tube Screen with Scanlines */}
            <div className={`relative bg-[#0d1117] border-[3px] border-[#111111] text-white p-3 sm:p-4 overflow-hidden ${crtFlicker ? 'crt-scanlines' : ''}`}>
              
              {/* Screen Top Status Banner */}
              <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs tracking-widest text-[#EFD99C] pb-2 border-b border-white/20 z-20 relative">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 ${isAnomalyZone ? 'bg-[#D95D5D] led-blink-fast' : 'bg-[#8BCF9B]'}`} />
                  <span className="font-bold">FORENSIC COMPARISON FEED</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAnomalyZone ? (
                    <span className="bg-[#D95D5D] text-black px-2 py-0.5 font-black uppercase tracking-wider text-[9px] sm:text-[10px] led-blink-fast">
                      ⚠ MANIPULATION DETECTED
                    </span>
                  ) : (
                    <span className="bg-[#8BCF9B] text-black px-2 py-0.5 font-black uppercase text-[9px]">
                      BASELINE SYNCHRONIZED
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Visual Pane: ORIGINAL vs MANIPULATED */}
              <div className="grid grid-cols-2 gap-2 my-3 relative z-20">
                
                {/* Original Authentic Pane */}
                <div className="relative aspect-[4/3] bg-[#1a202c] border-[2px] border-white/30 overflow-hidden group">
                  {/* Simulated Frame graphic */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#243042] to-[#121822]">
                    {/* Retro Face wireframe for authentic */}
                    <div className="relative w-20 h-24 sm:w-28 sm:h-32 border-2 border-[#8BCF9B]/80 rounded-full flex flex-col items-center justify-center">
                      {/* Eyes */}
                      <div className="flex justify-between w-12 sm:w-16 mb-2">
                        <span className="w-2.5 h-1.5 bg-[#8BCF9B]" />
                        <span className="w-2.5 h-1.5 bg-[#8BCF9B]" />
                      </div>
                      {/* Nose */}
                      <span className="w-1 h-3 bg-[#8BCF9B]/60 mb-2" />
                      {/* Natural Mouth */}
                      <span className="w-6 sm:w-8 h-1.5 bg-[#8BCF9B] rounded-sm" />
                      {/* Face alignment crosshairs */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#8BCF9B]" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#8BCF9B]" />
                    </div>
                  </div>

                  {/* Corner Label */}
                  <div className="absolute top-1.5 left-1.5 bg-[#8BCF9B] text-black text-[9px] sm:text-[10px] font-mono font-black px-1.5 py-0.5">
                    ORIGINAL [AUTHENTIC]
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-[#8BCF9B] bg-black/80 px-1">
                    C2PA SEAL: VALID ✓
                  </div>
                </div>

                {/* Manipulated Derivative Pane */}
                <div className="relative aspect-[4/3] bg-[#1a202c] border-[2px] border-[#D95D5D] overflow-hidden">
                  {/* Simulated Frame graphic with synthetic warp */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#2d1b26] to-[#170e14]">
                    {/* Retro Face wireframe with glitch anomaly */}
                    <div className={`relative w-20 h-24 sm:w-28 sm:h-32 border-2 ${isAnomalyZone ? 'border-[#D95D5D] border-dashed' : 'border-white/40'} rounded-full flex flex-col items-center justify-center`}>
                      {/* Eyes */}
                      <div className="flex justify-between w-12 sm:w-16 mb-2">
                        <span className="w-2.5 h-1.5 bg-white/70" />
                        <span className="w-2.5 h-1.5 bg-white/70" />
                      </div>
                      {/* Nose */}
                      <span className="w-1 h-3 bg-white/40 mb-2" />
                      {/* Anomaly Mouth & Neural Warp */}
                      <div className="relative flex flex-col items-center">
                        <span className={`w-8 sm:w-10 h-3 ${isAnomalyZone ? 'bg-[#D95D5D] animate-pulse' : 'bg-white/60'} rounded-md`} />
                        {isAnomalyZone && (
                          <div className="absolute -top-3 text-[8px] font-mono bg-[#D95D5D] text-black font-black px-1 whitespace-nowrap">
                            PHONEME LAG +320ms
                          </div>
                        )}
                      </div>

                      {/* Anomaly Bounding Box */}
                      {isAnomalyZone && (
                        <div className="absolute inset-x-2 bottom-2 h-10 border-2 border-[#D95D5D] bg-[#D95D5D]/20 flex items-center justify-center">
                          <span className="text-[7px] sm:text-[8px] font-mono text-white font-bold bg-black/80 px-1">
                            WARP HEAT: 94.2%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Corner Label */}
                  <div className="absolute top-1.5 left-1.5 bg-[#D95D5D] text-white text-[9px] sm:text-[10px] font-mono font-black px-1.5 py-0.5 flex items-center gap-1">
                    <span>MANIPULATED</span>
                    {isAnomalyZone && <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                  </div>
                  <div className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-[#D95D5D] bg-black/80 px-1">
                    SRC: PUBLIC INDEX A
                  </div>
                </div>
              </div>

              {/* Audio Waveform & Lip Movement Real-time Visualizer */}
              <div className="bg-[#111111]/90 border border-white/20 p-2.5 rounded-none font-mono z-20 relative">
                
                {/* Waveform Bar Track */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[9px] text-white/70 mb-1">
                    <span className="flex items-center gap-1 text-[#F4CD3F]">
                      <Volume2 className="w-3 h-3" />
                      AUDIO SPECTRAL WAVEFORM (VOCODER DISPERSION)
                    </span>
                    <span className={isAnomalyZone ? 'text-[#D95D5D] font-bold' : 'text-[#8BCF9B]'}>
                      {isAnomalyZone ? 'AI SYNTHETIC CLONE FREQUENCIES' : 'NATURAL ACOUSTIC ENVELOPE'}
                    </span>
                  </div>

                  {/* Audio Bars */}
                  <div className="flex items-end gap-1 h-8 bg-black/60 p-1 border border-white/10">
                    {[
                      24, 38, 45, 60, 52, 41, 65, 80, 75, 45, 
                      85, 95, 90, 88, 92, 70, 60, 48, 55, 62, 
                      35, 40, 28, 45, 50, 72, 84, 91, 65, 40,
                      30, 22
                    ].map((height, idx) => {
                      const inZone = idx >= 14 && idx <= 18;
                      const isCurrent = Math.floor(currentTime) === idx;
                      return (
                        <div
                          key={idx}
                          className="flex-1 transition-all duration-150"
                          style={{
                            height: `${height}%`,
                            backgroundColor: isCurrent 
                              ? '#FFFFFF' 
                              : inZone 
                              ? '#D95D5D' 
                              : '#F4CD3F',
                            opacity: isCurrent ? 1 : 0.75
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Lip-sync and Temporal timeline markers */}
                <div>
                  <div className="flex items-center justify-between text-[9px] text-white/70 mb-1">
                    <span className="flex items-center gap-1 text-[#8BCF9B]">
                      <Activity className="w-3 h-3" />
                      LIP MOVEMENT & TEMPORAL VISUAL TIMELINE
                    </span>
                    <span className="text-[#EFD99C]">
                      ALIGNMENT DELTA: <strong className={isAnomalyZone ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}>
                        {isAnomalyZone ? '+320ms LAG' : '0.0ms'}
                      </strong>
                    </span>
                  </div>

                  {/* Visual timeline segments */}
                  <div className="grid grid-cols-5 gap-1 text-[8px] text-center font-bold">
                    <div className="bg-[#8BCF9B]/30 border border-[#8BCF9B] py-1 text-[#8BCF9B]">
                      00:00 - 00:07 [NORM]
                    </div>
                    <div className="bg-[#F4CD3F]/30 border border-[#F4CD3F] py-1 text-[#F4CD3F]">
                      00:07 - 00:14 [SUSP]
                    </div>
                    <div className="bg-[#D95D5D]/50 border border-[#D95D5D] py-1 text-[#D95D5D] animate-pulse">
                      00:14 - 00:18 [HIGH RISK]
                    </div>
                    <div className="bg-[#D95D5D]/40 border border-[#D95D5D] py-1 text-[#D95D5D]">
                      00:18 - 00:26 [HIGH RISK]
                    </div>
                    <div className="bg-[#8BCF9B]/30 border border-[#8BCF9B] py-1 text-[#8BCF9B]">
                      00:26 - 00:32 [NORM]
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="mt-3 pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 font-mono text-xs z-20 relative">
                <div className="flex items-center gap-4">
                  <div className="bg-black/60 px-2.5 py-1 border border-white/20">
                    <span className="text-white/60 text-[10px]">SYNC: </span>
                    <span className={`font-black ${syncPct < 60 ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                      {syncPct}%
                    </span>
                  </div>
                  <div className="bg-black/60 px-2.5 py-1 border border-white/20">
                    <span className="text-white/60 text-[10px]">RISK: </span>
                    <span className={`font-black ${riskPct > 70 ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                      {riskPct}%
                    </span>
                  </div>
                </div>

                {/* Scrubber Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 bg-[#EFD99C] text-black hover:bg-[#F4CD3F] border border-black font-bold"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setCurrentTime(15.4)}
                    className="p-1.5 bg-[#EFD99C] text-black hover:bg-[#F4CD3F] border border-black font-bold text-[10px] flex items-center gap-1"
                    title="Jump to Anomaly"
                  >
                    <RotateCcw className="w-3 h-3" />
                    JUMP 00:15
                  </button>
                  <button
                    onClick={() => setCrtFlicker(!crtFlicker)}
                    className={`px-2 py-1 border border-black text-[9px] font-bold ${crtFlicker ? 'bg-[#844469] text-white' : 'bg-black text-white/50'}`}
                  >
                    CRT: {crtFlicker ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* CRT Physical Bezel Dials & Controls */}
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[#111111] pt-1">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-black bg-[#111111]" />
                  CONTRAST 80
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-black bg-[#111111]" />
                  DECODER AUTO
                </span>
              </div>
              <div className="font-bold flex items-center gap-2">
                <span>MODEL CONSENSUS: 4/4 ENGINES</span>
                <span className="w-2 h-2 bg-[#8BCF9B] rounded-full led-blink" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
