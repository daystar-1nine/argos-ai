'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Activity, Cpu } from 'lucide-react';

export default function LiveStatusStrip() {
  const [tickerTime, setTickerTime] = useState('');
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTickerTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    update();
    const timer = setInterval(update, 1000);
    const latTimer = setInterval(() => {
      setLatency(prev => 12 + Math.floor(Math.random() * 5));
    }, 4000);
    return () => {
      clearInterval(timer);
      clearInterval(latTimer);
    };
  }, []);

  return (
    <div className="w-full bg-[#111111] text-[#EFD99C] border-y-[3px] border-[#111111] py-2 px-4 select-none overflow-x-auto font-mono text-[11px] font-bold uppercase tracking-wider">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Strip Title & Terminal Prompt */}
        <div className="flex items-center gap-2 text-[#F4CD3F]">
          <Terminal className="w-3.5 h-3.5" />
          <span className="tracking-widest">ARGOS NETWORK STATUS</span>
          <span className="text-white/40">|</span>
          <span className="text-white/70 text-[10px] font-mono lowercase">sys_uptime: 99.98%</span>
        </div>

        {/* 5 Online Status Nodes */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
            <span className="text-white/90">AI ENGINE ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
            <span className="text-white/90">PROVENANCE ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
            <span className="text-white/90">MEDIA DNA ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
            <span className="text-white/90">MONITORING ONLINE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
            <span className="text-white/90">FORENSICS ONLINE</span>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="hidden xl:flex items-center gap-3 text-[10px] text-[#F4CD3F]/80">
          <span>LATENCY: {latency}ms</span>
          <span className="text-white/30">•</span>
          <span>CLOCK: {tickerTime || '00:00:00 UTC'}</span>
          <span className="text-white/30">•</span>
          <span className="text-[#8BCF9B]">SOVEREIGN C2PA v2.1</span>
        </div>
      </div>
    </div>
  );
}
