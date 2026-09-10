'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, AlertTriangle, CheckCircle2, Fingerprint, Lock, Eye, AlertCircle } from 'lucide-react';
import ForensicOverlay from './ForensicOverlay';

export interface ComparisonMediaProps {
  variant: 'original' | 'manipulated';
  src: string;
  fallbackSrc?: string;
  title?: string;
  badge?: string;
  isAnomaly?: boolean;
  showOverlay?: boolean;
  timestamp?: string | number;
  frameNumber?: number;
  anomalyLabel?: string;
  riskPct?: number;
  className?: string;
  compact?: boolean;
}

export default function ComparisonMedia({
  variant,
  src,
  fallbackSrc,
  title,
  badge,
  isAnomaly = false,
  showOverlay = true,
  timestamp = "00:14.00",
  frameNumber = 420,
  anomalyLabel = "LIP-SYNC ANOMALY +320ms",
  riskPct = 93,
  className = '',
  compact = false
}: ComparisonMediaProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const isOriginal = variant === 'original';
  const defaultTitle = isOriginal ? "ORIGINAL [VERIFIED]" : "MANIPULATED [DETECTED]";
  const defaultBadge = isOriginal ? "✓ PROVENANCE VALID" : (isAnomaly ? "⚠ ANOMALY DETECTED" : "INDEXED DERIVATIVE");

  const displayTitle = title || defaultTitle;
  const displayBadge = badge || defaultBadge;

  const borderColor = isOriginal 
    ? "border-[#8BCF9B]" 
    : (isAnomaly ? "border-[#D95D5D]" : "border-[#F4CD3F]");

  const badgeColor = isOriginal 
    ? "bg-[#8BCF9B] text-[#111111]" 
    : (isAnomaly ? "bg-[#D95D5D] text-white" : "bg-[#F4CD3F] text-[#111111]");

  const headerBg = isOriginal
    ? "bg-[#16271c] text-[#8BCF9B] border-b border-[#8BCF9B]/40"
    : (isAnomaly 
        ? "bg-[#291316] text-[#D95D5D] border-b border-[#D95D5D]/40"
        : "bg-[#221c16] text-[#F4CD3F] border-b border-[#F4CD3F]/40");

  return (
    <div className={`flex flex-col bg-[#0f141c] border-[3px] border-[#111111] overflow-hidden brutal-shadow-sm font-mono ${className}`}>
      
      {/* Top Header Bar */}
      <div className={`p-2 sm:p-2.5 flex items-center justify-between font-mono text-[10px] sm:text-xs font-black uppercase ${headerBg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isOriginal ? 'bg-[#8BCF9B]' : (isAnomaly ? 'bg-[#D95D5D] led-blink-fast' : 'bg-[#F4CD3F]')}`} />
          <span className="tracking-wider">{displayTitle}</span>
        </div>
        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border border-[#111111] ${badgeColor}`}>
          {displayBadge}
        </span>
      </div>

      {/* Media Viewport Container */}
      <div className="relative aspect-video w-full bg-[#05080c] overflow-hidden group">
        
        {/* Real Image Visual */}
        <img
          src={imgSrc}
          alt={displayTitle}
          onError={() => {
            if (!hasError && fallbackSrc) {
              setHasError(true);
              setImgSrc(fallbackSrc);
            }
          }}
          className="w-full h-full object-cover object-center select-none"
          loading="eager"
        />

        {/* Forensic Overlay (Face bounding box, mouth landmarks, anomaly marker) */}
        <ForensicOverlay
          showOverlay={showOverlay}
          isManipulated={!isOriginal}
          isAnomaly={isAnomaly}
          timestamp={timestamp}
          frameNumber={frameNumber}
          anomalyLabel={anomalyLabel}
          riskPct={riskPct}
        />

        {/* Floating Provenance Watermark Pill */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-xs px-2 py-0.5 border border-white/20 text-[9px] font-mono">
          {isOriginal ? (
            <>
              <ShieldCheck className="w-3 h-3 text-[#8BCF9B]" />
              <span className="text-[#8BCF9B] font-bold">MEDIA DNA: MATCHED</span>
              <span className="text-white/40">|</span>
              <span className="text-white/80">SHA-256: VALID</span>
            </>
          ) : (
            <>
              <AlertTriangle className={`w-3 h-3 ${isAnomaly ? 'text-[#D95D5D]' : 'text-[#F4CD3F]'}`} />
              <span className={isAnomaly ? "text-[#D95D5D] font-black" : "text-[#F4CD3F] font-bold"}>
                {isAnomaly ? "TAMPER HEAT: 92.4%" : "DERIVATIVE AUDITED"}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white/80">SRC: PUBLIC INDEX</span>
            </>
          )}
        </div>

      </div>

      {/* Visual Information Footer (Requirement 9) */}
      {!compact && (
        <div className="p-2 sm:p-2.5 bg-[#141a24] border-t border-white/15 grid grid-cols-3 gap-2 text-[10px] font-mono">
          {isOriginal ? (
            <>
              <div className="border border-white/10 p-1.5 bg-black/40">
                <div className="text-white/60 text-[9px] uppercase font-semibold">PROVENANCE</div>
                <div className="text-[#8BCF9B] font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </div>
              </div>
              <div className="border border-white/10 p-1.5 bg-black/40">
                <div className="text-white/60 text-[9px] uppercase font-semibold">MEDIA DNA</div>
                <div className="text-[#8BCF9B] font-bold flex items-center gap-1 mt-0.5">
                  <Fingerprint className="w-3 h-3" /> MATCHED
                </div>
              </div>
              <div className="border border-white/10 p-1.5 bg-black/40">
                <div className="text-white/60 text-[9px] uppercase font-semibold">INTEGRITY</div>
                <div className="text-[#8BCF9B] font-bold flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3" /> VALID
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border border-white/10 p-1.5 bg-black/40">
                <div className="text-white/60 text-[9px] uppercase font-semibold">PROVENANCE</div>
                <div className="text-[#F4CD3F] font-bold flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3" /> MODIFIED
                </div>
              </div>
              <div className="border border-white/10 p-1.5 bg-black/40">
                <div className="text-white/60 text-[9px] uppercase font-semibold">MEDIA DNA</div>
                <div className="text-[#8BCF9B] font-bold flex items-center gap-1 mt-0.5">
                  <Fingerprint className="w-3 h-3" /> RELATED
                </div>
              </div>
              <div className="border border-white/10 p-1.5 bg-black/40">
                <div className="text-white/60 text-[9px] uppercase font-semibold">MANIPULATION</div>
                <div className={`font-bold flex items-center gap-1 mt-0.5 ${isAnomaly ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                  <span className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-[#D95D5D] led-blink-fast' : 'bg-[#8BCF9B]'}`} />
                  {isAnomaly ? "DETECTED" : "CLEAN"}
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
