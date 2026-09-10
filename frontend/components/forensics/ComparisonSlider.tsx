'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import ForensicOverlay from './ForensicOverlay';

export interface ComparisonSliderProps {
  originalSrc: string;
  manipulatedSrc: string;
  showOverlay?: boolean;
  isAnomaly?: boolean;
  timestamp?: string | number;
  frameNumber?: number;
  anomalyLabel?: string;
  riskPct?: number;
  className?: string;
}

export default function ComparisonSlider({
  originalSrc,
  manipulatedSrc,
  showOverlay = true,
  isAnomaly = false,
  timestamp = "00:14.00",
  frameNumber = 420,
  anomalyLabel = "LIP-SYNC ANOMALY +320ms",
  riskPct = 93,
  className = ''
}: ComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className={`flex flex-col bg-[#0f141c] border-[3px] border-[#111111] overflow-hidden brutal-shadow font-mono ${className}`}>
      
      {/* Slider Top Header */}
      <div className="p-2 sm:p-2.5 bg-[#151c27] text-white border-b border-white/20 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F4CD3F] led-blink-fast" />
          <span className="uppercase text-[#EFD99C]">INTERACTIVE COMPARE SLIDER</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-[#8BCF9B] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> LEFT: ORIGINAL
          </span>
          <span className="text-white/30">|</span>
          <span className="text-[#D95D5D] flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3" /> RIGHT: MANIPULATED
          </span>
        </div>
      </div>

      {/* Main Interactive Slider Viewport */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        className="relative aspect-video w-full bg-black overflow-hidden select-none cursor-ew-resize touch-none"
      >
        {/* Underlayer: MANIPULATED IMAGE (Full Width) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={manipulatedSrc}
            alt="Manipulated Derivative"
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
          {/* Manipulated Forensic Overlay */}
          <ForensicOverlay
            showOverlay={showOverlay}
            isManipulated={true}
            isAnomaly={isAnomaly}
            timestamp={timestamp}
            frameNumber={frameNumber}
            anomalyLabel={anomalyLabel}
            riskPct={riskPct}
          />
          {/* Right Corner Badge */}
          <div className="absolute top-3 right-3 z-30 bg-[#D95D5D] text-white font-mono text-[9px] sm:text-[10px] font-black px-2 py-0.5 border border-[#111111] brutal-shadow-sm">
            MANIPULATED [DETECTED]
          </div>
        </div>

        {/* Overlayer: ORIGINAL IMAGE (Clipped by sliderPos) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <div 
            className="relative h-full"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100vw' }}
          >
            <img
              src={originalSrc}
              alt="Original Master"
              className="w-full h-full object-cover select-none"
              draggable={false}
            />
            {/* Original Forensic Overlay */}
            <ForensicOverlay
              showOverlay={showOverlay}
              isManipulated={false}
              isAnomaly={false}
              timestamp={timestamp}
              frameNumber={frameNumber}
            />
            {/* Left Corner Badge */}
            <div className="absolute top-3 left-3 z-30 bg-[#8BCF9B] text-[#111111] font-mono text-[9px] sm:text-[10px] font-black px-2 py-0.5 border border-[#111111] brutal-shadow-sm">
              ORIGINAL [VERIFIED]
            </div>
          </div>
        </div>

        {/* Divider Handle */}
        <div 
          className="absolute top-0 bottom-0 z-40 w-1 bg-[#F4CD3F] shadow-[0_0_12px_rgba(244,205,63,0.8)] cursor-ew-resize"
          style={{ left: `${sliderPos}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-none bg-[#F4CD3F] text-[#111111] border-2 border-[#111111] brutal-shadow-sm flex items-center justify-center font-bold text-[10px] transition-transform active:scale-110 hover:scale-105">
            <ChevronsLeftRight className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom Helper Instruction */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 bg-black/80 px-2 py-0.5 border border-white/20 text-[9px] text-white/80 font-mono pointer-events-none">
          DRAG DIVIDER TO REVEAL FORENSIC DEVIATION
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-2 sm:p-2.5 bg-[#141a24] border-t border-white/15 flex flex-wrap items-center justify-between text-[10px] text-white/80 gap-2">
        <span className="flex items-center gap-1.5 text-[#8BCF9B] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#8BCF9B]" />
          PIXEL-PERFECT DERIVATIVE ALIGNMENT
        </span>
        <span className="font-mono text-white/60">
          DIVIDER AT: <span className="text-[#F4CD3F] font-bold">{Math.round(sliderPos)}%</span>
        </span>
      </div>

    </div>
  );
}
