'use client';

import React from 'react';
import AnomalyMarker from './AnomalyMarker';

export interface ForensicOverlayProps {
  showOverlay?: boolean;
  isManipulated?: boolean;
  isAnomaly?: boolean;
  timestamp?: string | number;
  frameNumber?: number;
  anomalyLabel?: string;
  riskPct?: number;
}

export default function ForensicOverlay({
  showOverlay = true,
  isManipulated = false,
  isAnomaly = false,
  timestamp = "00:14.00",
  frameNumber = 420,
  anomalyLabel = "LIP-SYNC ANOMALY +320ms",
  riskPct = 93
}: ForensicOverlayProps) {
  if (!showOverlay) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      
      {/* Top HUD Metadata Badges */}
      <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 font-mono text-[9px] z-30">
        <span className="bg-black/85 text-white px-1.5 py-0.5 border border-white/20">
          FRAME #{frameNumber}
        </span>
        <span className="bg-black/85 text-[#EFD99C] px-1.5 py-0.5 border border-white/20">
          {typeof timestamp === 'number' ? `00:${timestamp < 10 ? '0' : ''}${Math.floor(timestamp)}` : timestamp}
        </span>

        {isManipulated ? (
          isAnomaly ? (
            <span className="bg-[#D95D5D] text-white font-black px-1.5 py-0.5 border border-[#111111] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white led-blink-fast" />
              ANOMALY: {riskPct}% RISK
            </span>
          ) : (
            <span className="bg-[#F4CD3F] text-[#111111] font-bold px-1.5 py-0.5 border border-[#111111]">
              INDEX STREAM
            </span>
          )
        ) : (
          <span className="bg-[#8BCF9B] text-[#111111] font-black px-1.5 py-0.5 border border-[#111111]">
            ✓ VERIFIED MASTER
          </span>
        )}
      </div>

      {/* Top-Right HUD Badge */}
      <div className="absolute top-2 right-2 font-mono text-[9px] bg-black/85 px-2 py-0.5 border border-white/20 hidden sm:block">
        {isManipulated ? (
          <span className={isAnomaly ? "text-[#D95D5D] font-black" : "text-[#EFD99C]"}>
            {isAnomaly ? "SYNCNET: DESYNCHRONIZED" : "SYNCNET: MONITORING"}
          </span>
        ) : (
          <span className="text-[#8BCF9B] font-bold">
            PRNU SENSOR: NOMINAL
          </span>
        )}
      </div>

      {/* ============================================================== */}
      {/* FACE BOUNDING BOX (Percentage coordinates based on media)     */}
      {/* ============================================================== */}
      <div 
        className={`absolute border-2 transition-all duration-200 ${
          isManipulated 
            ? isAnomaly 
              ? 'border-[#D95D5D] bg-[#D95D5D]/5' 
              : 'border-[#F4CD3F]/80' 
            : 'border-[#8BCF9B] bg-[#8BCF9B]/5'
        }`}
        style={{
          left: '41.5%',
          top: '10.5%',
          width: '31%',
          height: '67%',
        }}
      >
        {/* Corner Reticles */}
        <div className={`absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 ${isManipulated && isAnomaly ? 'border-[#D95D5D]' : isManipulated ? 'border-[#F4CD3F]' : 'border-[#8BCF9B]'}`} />
        <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 ${isManipulated && isAnomaly ? 'border-[#D95D5D]' : isManipulated ? 'border-[#F4CD3F]' : 'border-[#8BCF9B]'}`} />
        <div className={`absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 ${isManipulated && isAnomaly ? 'border-[#D95D5D]' : isManipulated ? 'border-[#F4CD3F]' : 'border-[#8BCF9B]'}`} />
        <div className={`absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 ${isManipulated && isAnomaly ? 'border-[#D95D5D]' : isManipulated ? 'border-[#F4CD3F]' : 'border-[#8BCF9B]'}`} />

        {/* Bounding Box Label */}
        <div 
          className={`absolute -top-4.5 left-0 px-1 py-0.2 font-mono text-[8px] sm:text-[9px] font-black uppercase whitespace-nowrap border ${
            isManipulated 
              ? isAnomaly
                ? 'bg-[#D95D5D] text-white border-[#111111]' 
                : 'bg-[#F4CD3F] text-[#111111] border-[#111111]'
              : 'bg-[#8BCF9B] text-[#111111] border-[#111111]'
          }`}
        >
          {isManipulated 
            ? isAnomaly ? "FACE_01: WARP CONF 0.942" : "FACE_01: TRACKED"
            : "FACE_01: PRNU NOISE 98.4%"}
        </div>

        {/* Eye level landmarks */}
        <div className="absolute top-[32%] left-[16%] flex justify-between w-[68%] opacity-85">
          <div className="flex gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isManipulated ? (isAnomaly ? 'bg-[#D95D5D]' : 'bg-[#F4CD3F]') : 'bg-[#8BCF9B]'}`} />
            <span className={`w-1 h-1 rounded-full ${isManipulated ? (isAnomaly ? 'bg-[#D95D5D]' : 'bg-[#F4CD3F]') : 'bg-[#8BCF9B]'}`} />
          </div>
          <div className="flex gap-1">
            <span className={`w-1 h-1 rounded-full ${isManipulated ? (isAnomaly ? 'bg-[#D95D5D]' : 'bg-[#F4CD3F]') : 'bg-[#8BCF9B]'}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${isManipulated ? (isAnomaly ? 'bg-[#D95D5D]' : 'bg-[#F4CD3F]') : 'bg-[#8BCF9B]'}`} />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOUTH REGION HIGHLIGHT & VISEME MESH                          */}
      {/* ============================================================== */}
      {isManipulated && isAnomaly ? (
        <>
          {/* Pulsing red mouth detection bounding box */}
          <div 
            className="absolute border-2 border-dashed border-[#D95D5D] bg-[#D95D5D]/20 animate-pulse"
            style={{
              left: '45.0%',
              top: '53.5%',
              width: '14.0%',
              height: '19.0%',
            }}
          >
            {/* Mouth wireframe landmarks */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((pt) => (
                  <span key={pt} className="w-1 h-1 rounded-full bg-[#D95D5D]" />
                ))}
              </div>
            </div>

            {/* Micro Anomaly Tag */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#D95D5D] text-white px-1.5 py-0.5 font-mono text-[8px] font-black uppercase whitespace-nowrap border border-black brutal-shadow-sm">
              {anomalyLabel}
            </div>
          </div>

          {/* Anomaly Marker with ripple ping */}
          <AnomalyMarker
            top="63%"
            left="52%"
            severity="critical"
            label={anomalyLabel}
          />

          {/* Jawline boundary neural seam indicator */}
          <div 
            className="absolute border-b-2 border-dashed border-[#F4CD3F]"
            style={{
              left: '43.0%',
              top: '73.0%',
              width: '18.0%',
              height: '4.0%',
            }}
          >
            <span className="absolute -bottom-3.5 right-0 text-[7px] font-mono font-bold bg-black/90 text-[#F4CD3F] px-1">
              NEURAL BLEND SEAM
            </span>
          </div>
        </>
      ) : (
        /* Authentic Mouth Baseline Box */
        <div 
          className="absolute border border-dotted border-[#8BCF9B]/60"
          style={{
            left: '45.0%',
            top: '53.5%',
            width: '14.0%',
            height: '19.0%',
          }}
        >
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[7px] font-mono text-[#8BCF9B] bg-black/70 px-1 whitespace-nowrap">
            VISEME SYNC 0.0ms
          </div>
        </div>
      )}

      {/* Subtle CRT Scanline overlay effect */}
      <div className="absolute inset-0 crt-scanlines opacity-40 pointer-events-none" />
    </div>
  );
}
