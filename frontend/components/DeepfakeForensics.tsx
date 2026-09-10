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
import ForensicComparison from '@/components/forensics/ForensicComparison';

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
            
            {/* Left 8 Cols: Real Media Forensic Comparison Suite */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              
              <ForensicComparison
                initialTime={15.4}
                initialViewMode="split"
              />

              {/* Segment Forensic Note */}
              <div className="p-3 bg-white border-[2px] border-[#111111] font-mono text-xs brutal-shadow-sm">
                <span className="font-black text-[#844469]">EXPLAINABLE FORENSIC SUMMARY: </span>
                <span className="text-[#111111]/80 leading-relaxed">{analysis.explanation}</span>
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
