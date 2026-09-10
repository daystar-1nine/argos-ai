'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ArgosGlobalGlobeProps } from './ArgosGlobalGlobe';
import { Globe, Radio, Shield } from 'lucide-react';

const DynamicArgosGlobalGlobe = dynamic(
  () => import('./ArgosGlobalGlobe'),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[540px] lg:h-[620px] bg-[#090d14] border-[3px] border-[#111111] brutal-shadow-lg flex flex-col items-center justify-center p-8 font-mono select-none overflow-hidden">
        {/* Retro Grid & Scanline Background */}
        <div className="absolute inset-0 retro-grid opacity-25" />
        <div className="absolute inset-0 scanline-overlay opacity-30" />

        {/* Center Loading Hologram Ring */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="relative w-28 h-28 border-2 border-dashed border-[#EFD99C] rounded-full flex items-center justify-center animate-[spin_12s_linear_infinite]">
            <div className="w-20 h-20 border-2 border-[#844469] rounded-full animate-ping opacity-40" />
            <Globe className="w-10 h-10 text-[#F4CD3F] absolute animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-black text-[#EFD99C] uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink-fast" />
              <span>INITIALIZING 3D WEBGL SENSOR GRID</span>
            </div>
            <p className="text-[10px] text-white/60">
              SYNCHRONIZING TOPOLOGICAL POLYGONS & TELEMETRY ARCS...
            </p>
          </div>

          <div className="px-3 py-1 bg-black/80 border border-white/20 text-[9px] text-[#F4CD3F]">
            THREE.JS ACCELERATED // NO EXTERNAL API REQUIRED
          </div>
        </div>

        {/* Corner Reticles */}
        <div className="absolute top-4 left-4 text-[9px] text-white/40">ARGOS_GLOBE_CORE_v3.4</div>
        <div className="absolute bottom-4 right-4 text-[9px] text-[#8BCF9B]">5 SENSOR NODES READY</div>
      </div>
    )
  }
);

export default function ArgosGlobeWrapper(props: ArgosGlobalGlobeProps) {
  return <DynamicArgosGlobalGlobe {...props} />;
}
