'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Eye, Activity } from 'lucide-react';

export interface AnomalyMarkerProps {
  label?: string;
  top?: string;
  left?: string;
  severity?: 'critical' | 'high' | 'medium' | 'info';
  delta?: string;
  className?: string;
}

export default function AnomalyMarker({
  label = "LIP-SYNC ANOMALY +320ms",
  top = "58%",
  left = "50%",
  severity = 'critical',
  delta = "+320ms",
  className = ''
}: AnomalyMarkerProps) {
  const isCritical = severity === 'critical' || severity === 'high';
  const colorBg = isCritical ? 'bg-[#D95D5D]' : 'bg-[#F4CD3F]';
  const textColor = isCritical ? 'text-white' : 'text-[#111111]';
  const borderColor = isCritical ? 'border-[#D95D5D]' : 'border-[#F4CD3F]';

  return (
    <div 
      className={`absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none ${className}`}
      style={{ top, left }}
    >
      {/* Radar pulse ring */}
      <div className="relative flex items-center justify-center">
        <span className={`absolute w-8 h-8 rounded-full ${colorBg} opacity-40 animate-ping`} style={{ animationDuration: '2s' }} />
        <span className={`w-3 h-3 rounded-full ${colorBg} border-2 border-[#111111] shadow-[0_0_8px_rgba(217,93,93,0.8)]`} />
      </div>

      {/* Retro HUD Label Pill */}
      <div className={`mt-1.5 flex items-center gap-1.5 px-2 py-0.5 ${colorBg} ${textColor} border border-[#111111] brutal-shadow-sm font-mono text-[9px] sm:text-[10px] font-black tracking-wider uppercase whitespace-nowrap`}>
        <AlertTriangle className="w-3 h-3 shrink-0" />
        <span>{label}</span>
      </div>
    </div>
  );
}
