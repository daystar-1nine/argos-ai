'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Eye, 
  Volume2, 
  Clock, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ZoomIn,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { DEMO_FORENSIC_ANALYSIS, DEMO_ASSET } from '@/lib/data';

export default function DeepfakeForensics({ onOpenReport }: { onOpenReport?: () => void }) {
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState(2); // 00:14 - 00:18 HIGH RISK
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(1); // Frame 480 (Desynchronized Phoneme)
  const [isPlaying, setIsPlaying] = useState(false);

  const analysis = DEMO_FORENSIC_ANALYSIS;
  const currentSegment = analysis.timelineSegments[selectedSegmentIdx];
  const currentFrame = analysis.evidenceFrames[selectedFrameIdx];

  return (
    <section id="forensics" className="w-full py-20 px-4 lg:px-8 bg-[#F7F3E8] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#844469] text-[#EFD99C] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-3">
              05 // MULTI-MODEL FORENSIC SUITE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display leading-[0.95]">
              WE DON'T JUST SAY FAKE.<br />
              WE SHOW WHY.
            </h2>
          </div>
          <p className="font-mono text-xs text-[#111111]/80 max-w-md">
            Black-box AI is useless in legal and platform takedown procedures. Argos provides 
            grounded, frame-by-frame explainable evidence verified across 4 independent neural models.
          </p>
        </div>

        {/* The Forensics Dashboard Container */}
        <div className="bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8">
          
          {/* Top Bar: Case & Asset Identifier */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-[3px] border-[#111111] gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="bg-[#111111] text-[#F4CD3F] font-black px-2.5 py-1">
                ANALYSIS ID: {analysis.id}
              </span>
              <span className="font-bold text-[#111111]">
                TARGET: {analysis.assetId} (32.4s 4K MASTER)
              </span>
            </div>

            <div className="flex items-center gap-3 font-bold">
              <span className="bg-[#D95D5D] text-white px-2.5 py-1 border border-[#111111]">
                {analysis.verdict}
              </span>
              <span className="bg-white text-black px-2.5 py-1 border border-[#111111]">
                CONSENSUS: {analysis.modelAgreement}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left 8 Cols: Video Inspection, Waveforms & The Color-Coded Timeline */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              
              {/* Dual Video / Frame Inspection Screen */}
              <div className="bg-[#0f172a] border-[3px] border-[#111111] p-3 text-white brutal-shadow-sm mb-6">
                
                {/* Visual player window */}
                <div className="relative aspect-video bg-black/80 flex items-center justify-center overflow-hidden border border-white/20">
                  
                  {/* Face with SyncNet landmarks and Anomaly Heatmap */}
                  <div className="relative w-48 h-56 border-2 border-[#D95D5D] rounded-full flex flex-col items-center justify-center">
                    
                    {/* Upper face landmarks */}
                    <div className="flex justify-between w-28 mb-4">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#8BCF9B] rounded-full" />
                        <span className="w-1.5 h-1.5 bg-[#8BCF9B] rounded-full" />
                        <span className="w-1.5 h-1.5 bg-[#8BCF9B] rounded-full" />
                      </div>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#8BCF9B] rounded-full" />
                        <span className="w-1.5 h-1.5 bg-[#8BCF9B] rounded-full" />
                        <span className="w-1.5 h-1.5 bg-[#8BCF9B] rounded-full" />
                      </div>
                    </div>

                    {/* Nose bridge */}
                    <span className="w-1 h-6 bg-[#8BCF9B]/60 mb-4" />

                    {/* Red Anomaly Lip landmarks in selected frame */}
                    <div className="relative p-2 border-2 border-[#D95D5D] bg-[#D95D5D]/20 animate-pulse">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map((pt) => (
                          <span key={pt} className="w-1.5 h-1.5 bg-[#D95D5D] rounded-full" />
                        ))}
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono bg-[#D95D5D] text-white px-1 font-black whitespace-nowrap">
                        LIP-SYNC ANOMALY +320ms
                      </div>
                    </div>

                  </div>

                  {/* Top HUD Badges */}
                  <div className="absolute top-2 left-2 flex gap-2 font-mono text-[9px]">
                    <span className="bg-black/80 text-[#8BCF9B] px-1.5 py-0.5 border border-[#8BCF9B]/40">
                      FRAME #{currentFrame.frameNumber}
                    </span>
                    <span className="bg-[#D95D5D] text-white font-bold px-1.5 py-0.5">
                      ANOMALY: {currentFrame.riskPct}%
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 font-mono text-[9px] bg-black/80 text-[#EFD99C] px-1.5 py-0.5 border border-white/20">
                    SYNC PHONEME-TO-VISEME
                  </div>

                  {/* Center HUD crosshairs */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                    <div className="w-16 h-16 border border-white/50" />
                  </div>
                </div>

                {/* Scrubber Bar & Sub-indicators */}
                <div className="mt-3 pt-2 border-t border-white/20 font-mono text-xs">
                  
                  {/* Waveform & Lip Movement Signal Graphs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    
                    {/* Audio Waveform */}
                    <div className="bg-black/60 p-2 border border-white/10">
                      <div className="flex justify-between text-[9px] text-[#F4CD3F] mb-1">
                        <span>AUDIO WAVEFORM (VOCODER):</span>
                        <span className="text-[#D95D5D] font-bold">ANOMALY 62%</span>
                      </div>
                      <div className="text-[10px] text-[#F4CD3F] tracking-tight">
                        ████████████████
                      </div>
                    </div>

                    {/* Lip Movement */}
                    <div className="bg-black/60 p-2 border border-white/10">
                      <div className="flex justify-between text-[9px] text-[#8BCF9B] mb-1">
                        <span>LIP MOVEMENT (VISEME):</span>
                        <span className="text-[#D95D5D] font-bold">DESYNC 91%</span>
                      </div>
                      <div className="text-[10px] text-[#8BCF9B] tracking-tight">
                        ██████░░████████
                      </div>
                    </div>

                  </div>

                  {/* Temporal Mismatch Metric */}
                  <div className="flex items-center justify-between text-[11px] bg-black/60 p-2 border border-white/10 mb-3">
                    <span className="text-white/80">TEMPORAL MISMATCH:</span>
                    <span className="font-black text-[#D95D5D] text-sm">
                      +{analysis.temporalMismatchMs}ms (HIGH RISK)
                    </span>
                  </div>

                  {/* The Required Timeline: 00:00 ───── 00:07 ───── 00:14 ───── 00:18 ───── 00:32 */}
                  <div>
                    <div className="text-[10px] text-white/70 mb-1.5 flex justify-between">
                      <span>FORENSIC TIMELINE (CLICK SEGMENT TO INSPECT):</span>
                      <span className="text-[#F4CD3F] font-bold">CURRENT: {currentSegment.start} – {currentSegment.end}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1 text-center font-bold text-[9px]">
                      {analysis.timelineSegments.map((seg, idx) => {
                        const isSelected = selectedSegmentIdx === idx;
                        const bgColor = seg.status === 'normal' 
                          ? 'bg-[#8BCF9B]/30 border-[#8BCF9B] text-[#8BCF9B]' 
                          : seg.status === 'suspicious' 
                          ? 'bg-[#F4CD3F]/40 border-[#F4CD3F] text-[#F4CD3F]' 
                          : 'bg-[#D95D5D]/60 border-[#D95D5D] text-white';
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedSegmentIdx(idx)}
                            className={`p-1.5 border-2 transition-all ${bgColor} ${
                              isSelected ? 'ring-2 ring-white scale-[1.02]' : 'opacity-80 hover:opacity-100'
                            }`}
                          >
                            <div>{seg.start} – {seg.end}</div>
                            <div className="text-[8px] uppercase mt-0.5">
                              {seg.status === 'high_risk' ? 'HIGH RISK' : seg.status.toUpperCase()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Segment Forensic Note */}
              <div className="p-3 bg-white border-[2px] border-[#111111] font-mono text-xs">
                <span className="font-black text-[#844469]">SEGMENT NOTE: </span>
                <span className="text-[#111111]/80">{currentSegment.note}</span>
              </div>

            </div>

            {/* Right 4 Cols: Detection Scores & Explainable AI Grounded Panel */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              
              {/* Detection Scores Box */}
              <div className="bg-[#F7F3E8] border-[3px] border-[#111111] p-5 brutal-shadow mb-6 font-mono">
                <div className="font-black text-xs uppercase text-[#111111] pb-2 border-b-[2px] border-[#111111] flex items-center justify-between mb-3">
                  <span>DETECTION SCORES</span>
                  <span className="text-[#844469] font-black">4 MODELS</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Lip-sync anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.lipSyncAnomaly}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.lipSyncAnomaly}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Visual anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.visualAnomaly}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.visualAnomaly}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Audio anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.audioAnomaly}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.audioAnomaly}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Temporal anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.temporalAnomaly}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.temporalAnomaly}%` }} />
                    </div>
                  </div>

                  <div className="pt-3 border-t-[2px] border-[#111111] flex justify-between items-baseline">
                    <span className="font-bold uppercase text-[11px]">Model agreement:</span>
                    <span className="font-black text-[#8BCF9B] bg-black px-2 py-0.5 text-xs">
                      {analysis.modelAgreement}
                    </span>
                  </div>

                  <div className="p-3 bg-[#D95D5D] text-white border-[2px] border-[#111111] brutal-shadow-sm flex items-center justify-between">
                    <span className="font-black text-xs uppercase">Final manipulation risk:</span>
                    <span className="text-2xl font-black font-display">{analysis.overallManipulationRisk}%</span>
                  </div>
                </div>
              </div>

              {/* Explainable AI Panel: WHY ARGOS THINKS THIS IS SUSPICIOUS */}
              <div className="bg-white border-[3px] border-[#111111] p-5 brutal-shadow font-mono flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-black text-xs uppercase text-[#844469] pb-2 border-b-[2px] border-[#111111] flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-4 h-4 text-[#D95D5D]" />
                    WHY ARGOS THINKS THIS IS SUSPICIOUS
                  </div>

                  <p className="text-xs text-[#111111]/90 leading-relaxed mb-4">
                    "{analysis.explanation}"
                  </p>

                  {/* Evidence Frames Selector */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-[#111111]/70 uppercase">
                      EVIDENCE FRAMES ANNEX ({analysis.evidenceFrames.length} VERIFIED EXHIBITS):
                    </div>
                    {analysis.evidenceFrames.map((frame, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFrameIdx(idx)}
                        className={`w-full text-left p-2 border-[2px] border-[#111111] transition-all text-[11px] ${
                          selectedFrameIdx === idx
                            ? 'bg-[#F4CD3F] font-bold shadow-[2px_2px_0px_#111111]'
                            : 'bg-[#F7F3E8] hover:bg-[#EFD99C]'
                        }`}
                      >
                        <div className="flex justify-between font-bold">
                          <span>FRAME #{frame.frameNumber} [{frame.timestamp}]</span>
                          <span className="text-[#D95D5D]">{frame.riskPct}% RISK</span>
                        </div>
                        <div className="text-[10px] text-gray-700 mt-0.5 line-clamp-1">
                          {frame.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#111111]/20 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-mono">
                    NO FABRICATED EVIDENCE
                  </span>
                  <a
                    href="#incident-response"
                    className="text-xs font-black text-[#844469] flex items-center hover:underline uppercase"
                  >
                    TAKE ACTION →
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
