'use client';

import React, { useEffect, useState } from 'react';
import ArgosMark from '@/components/branding/ArgosMark';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Check if user already saw the boot sequence in this tab session
    const hasBooted = sessionStorage.getItem('argos_booted');
    if (hasBooted) {
      setVisible(false);
      return;
    }

    const t1 = setTimeout(() => setStage(1), 200);
    const t2 = setTimeout(() => setStage(2), 400);
    const t3 = setTimeout(() => setStage(3), 600);
    const t4 = setTimeout(() => setStage(4), 800);
    const t5 = setTimeout(() => setStage(5), 1000);
    const tEnd = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('argos_booted', 'true');
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(tEnd);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111] text-[#EFD99C] font-mono flex flex-col items-center justify-center p-6 crt-scanlines select-none animate-in fade-in">
      <div className="max-w-md w-full border-[3px] border-[#F4CD3F] bg-[#1a141c] p-6 brutal-shadow-xl text-xs space-y-4">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <ArgosMark size={28} />
            <span className="font-black text-base text-white tracking-wider uppercase font-display">
              ARGOS<span className="text-[#F4CD3F]">.AI</span>
            </span>
          </div>
          <span className="text-[10px] text-[#F6C6D8] bg-[#844469] px-2 py-0.5 font-bold">
            BOOT v3.4
          </span>
        </div>

        {/* System Initializing Status */}
        <div className="text-[#F4CD3F] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D95D5D] led-blink-fast" />
          SYSTEM INITIALIZING...
        </div>

        {/* The 5 System Checks */}
        <div className="space-y-1.5 text-[11px] font-mono">
          <div className="flex justify-between">
            <span className="text-white/80">MEDIA PROTECTION</span>
            <span className={stage >= 1 ? "text-[#8BCF9B] font-bold" : "text-white/20"}>
              {stage >= 1 ? "........ ✓" : "........ [PENDING]"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/80">FORENSIC ENGINE</span>
            <span className={stage >= 2 ? "text-[#8BCF9B] font-bold" : "text-white/20"}>
              {stage >= 2 ? "......... ✓" : "......... [PENDING]"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/80">MEDIA DNA</span>
            <span className={stage >= 3 ? "text-[#8BCF9B] font-bold" : "text-white/20"}>
              {stage >= 3 ? "............... ✓" : "............... [PENDING]"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/80">MONITORING</span>
            <span className={stage >= 4 ? "text-[#8BCF9B] font-bold" : "text-white/20"}>
              {stage >= 4 ? ".............. ✓" : ".............. [PENDING]"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/80">AI ENGINE</span>
            <span className={stage >= 5 ? "text-[#8BCF9B] font-bold" : "text-white/20"}>
              {stage >= 5 ? "............... ✓" : "............... [PENDING]"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="w-full bg-white/10 h-2 border border-white/30 overflow-hidden">
            <div 
              className="bg-[#F4CD3F] h-full transition-all duration-200" 
              style={{ width: `${(stage / 5) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
