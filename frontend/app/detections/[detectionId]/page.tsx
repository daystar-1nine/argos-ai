'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import BrutalistCard from '@/components/ui/BrutalistCard';
import { 
  ArrowLeft, 
  Eye, 
  Volume2, 
  Activity, 
  ShieldAlert, 
  AlertCircle, 
  FileText, 
  Play, 
  Pause,
  ExternalLink
} from 'lucide-react';
import { DEMO_FORENSIC_ANALYSIS, DEMO_ASSET } from '@/lib/data';

export default function ForensicDetectionDetailPage() {
  const params = useParams();
  const detectionId = (params.detectionId as string) || 'match_01';

  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState(2); // 00:14 - 00:18 HIGH RISK
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(1); // Frame 480
  const [isPlaying, setIsPlaying] = useState(false);

  const analysis = DEMO_FORENSIC_ANALYSIS;
  const currentSegment = analysis.timelineSegments[selectedSegmentIdx];
  const currentFrame = analysis.evidenceFrames[selectedFrameIdx];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={`Forensics // ${detectionId}`} />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <div className="flex items-center gap-2 text-xs font-bold text-[#844469]">
            <Link href="/detections" className="flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Detections Feed
            </Link>
          </div>

          <PageHeader
            badge="SYNCNET FORENSIC STUDIO"
            badgeColor="red"
            title={`DETECTION CASE: ${detectionId.toUpperCase()}`}
            subtitle={`Target: ${analysis.assetId} • Multi-Model Consensus: 4/4 Models • Overall Risk: ${analysis.overallManipulationRisk}%`}
            actions={
              <Link
                href="/incidents/ARG-8291"
                className="px-4 py-2 bg-[#D95D5D] hover:bg-[#eb7373] text-white border-[2px] border-[#111111] brutal-btn text-xs font-black uppercase"
              >
                Open Incident Case #ARG-8291 →
              </Link>
            }
          />

          {/* Main Dual Player & Scrubber */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Video Scrubber, Waveform, Lip graph & Timeline */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Dual Frame Comparison Box */}
              <div className="bg-[#0f172a] border-[3px] border-[#111111] p-4 text-white brutal-shadow">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {/* Original Authentic Video */}
                  <div className="aspect-video bg-black/60 border border-white/20 relative flex items-center justify-center p-2">
                    <div className="w-20 h-24 border-2 border-[#8BCF9B] rounded-full flex flex-col items-center justify-center">
                      <div className="flex justify-between w-12 mb-2">
                        <span className="w-2 h-1 bg-[#8BCF9B]" />
                        <span className="w-2 h-1 bg-[#8BCF9B]" />
                      </div>
                      <span className="w-6 h-1 bg-[#8BCF9B] rounded-sm" />
                    </div>
                    <div className="absolute top-2 left-2 bg-[#8BCF9B] text-black font-black text-[9px] px-1.5 py-0.5">
                      ORIGINAL MASTER
                    </div>
                    <div className="absolute bottom-2 left-2 text-[8px] text-[#8BCF9B] font-bold">
                      C2PA: VALID
                    </div>
                  </div>

                  {/* Suspected Manipulated Video */}
                  <div className="aspect-video bg-black/60 border border-[#D95D5D] relative flex items-center justify-center p-2">
                    <div className="w-20 h-24 border-2 border-dashed border-[#D95D5D] rounded-full flex flex-col items-center justify-center bg-[#D95D5D]/10">
                      <div className="flex justify-between w-12 mb-2">
                        <span className="w-2 h-1 bg-[#D95D5D]" />
                        <span className="w-2 h-1 bg-[#D95D5D]" />
                      </div>
                      <span className="w-8 h-2.5 bg-[#D95D5D] rounded-sm animate-pulse" />
                    </div>
                    <div className="absolute top-2 left-2 bg-[#D95D5D] text-white font-black text-[9px] px-1.5 py-0.5">
                      SUSPECT DERIVATIVE
                    </div>
                    <div className="absolute bottom-2 right-2 text-[8px] text-[#D95D5D] font-bold">
                      VISEME LAG +320ms
                    </div>
                  </div>
                </div>

                {/* Waveform & Lip Movement Real-time Signals */}
                <div className="bg-black/70 p-3 border border-white/20 space-y-3">
                  
                  {/* Audio Waveform */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[#F4CD3F] mb-1">
                      <span>AUDIO SPECTRAL WAVEFORM (VOCODER SYNTHESIS):</span>
                      <span className="text-[#D95D5D] font-bold">ANOMALY 62%</span>
                    </div>
                    <div className="text-xs text-[#F4CD3F]">
                      ████████████████
                    </div>
                  </div>

                  {/* Lip Movement */}
                  <div>
                    <div className="flex justify-between text-[10px] text-[#8BCF9B] mb-1">
                      <span>LIP MOVEMENT (VISEME ALIGNMENT):</span>
                      <span className="text-[#D95D5D] font-bold">DESYNC 91%</span>
                    </div>
                    <div className="text-xs text-[#8BCF9B]">
                      ██████░░████████
                    </div>
                  </div>

                  {/* Temporal Alignment Graph */}
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-white/20">
                    <span className="text-white/70">TEMPORAL MISMATCH LAG:</span>
                    <span className="font-black text-[#D95D5D]">
                      +{analysis.temporalMismatchMs}ms (HIGH RISK)
                    </span>
                  </div>

                </div>

                {/* Timeline: 00:00 ───── 00:07 ───── 00:14 ───── 00:18 ───── 00:32 */}
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="text-[11px] text-white/70 mb-2 flex justify-between">
                    <span>FORENSIC TIMELINE (CLICK TO SCRUB):</span>
                    <span className="text-[#F4CD3F] font-bold">{currentSegment.start} – {currentSegment.end}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center text-[9px] font-bold">
                    {analysis.timelineSegments.map((seg, idx) => {
                      const isSelected = selectedSegmentIdx === idx;
                      const style = seg.status === 'normal' 
                        ? 'bg-[#8BCF9B]/30 border-[#8BCF9B] text-[#8BCF9B]' 
                        : seg.status === 'suspicious' 
                        ? 'bg-[#F4CD3F]/40 border-[#F4CD3F] text-[#F4CD3F]' 
                        : 'bg-[#D95D5D]/60 border-[#D95D5D] text-white';

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedSegmentIdx(idx)}
                          className={`p-2 border-2 transition-all ${style} ${
                            isSelected ? 'ring-2 ring-white scale-[1.02]' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div>{seg.start} – {seg.end}</div>
                          <div className="mt-0.5 uppercase text-[8px]">
                            {seg.status === 'high_risk' ? 'HIGH RISK' : seg.status}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Segment Analysis Explanatory Callout */}
              <div className="p-4 bg-white border-[2.5px] border-[#111111] brutal-shadow font-mono text-xs">
                <span className="font-black text-[#844469] uppercase">CURRENT INTERVAL FINDING: </span>
                <span className="text-[#111111]">{currentSegment.note}</span>
              </div>

            </div>

            {/* Right 4 Cols: Scores & Grounded Explainable AI */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Detection Scores */}
              <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-5 font-mono text-xs">
                <div className="font-black uppercase text-[#111111] pb-2 border-b-[2px] border-[#111111] flex justify-between mb-4">
                  <span>DETECTION SCORES</span>
                  <span className="text-[#844469]">4 MODELS</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Lip-sync anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.lipSyncAnomaly}%</span>
                    </div>
                    <div className="w-full bg-white h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.lipSyncAnomaly}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Visual anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.visualAnomaly}%</span>
                    </div>
                    <div className="w-full bg-white h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.visualAnomaly}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Audio anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.audioAnomaly}%</span>
                    </div>
                    <div className="w-full bg-white h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.audioAnomaly}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold">Temporal anomaly:</span>
                      <span className="font-black text-[#D95D5D]">{analysis.temporalAnomaly}%</span>
                    </div>
                    <div className="w-full bg-white h-2 border border-[#111111]">
                      <div className="bg-[#D95D5D] h-full" style={{ width: `${analysis.temporalAnomaly}%` }} />
                    </div>
                  </div>

                  <div className="p-3 bg-[#D95D5D] text-white border-[2px] border-black text-center mt-4">
                    <div className="text-[10px] font-bold uppercase opacity-90">FINAL MANIPULATION RISK</div>
                    <div className="text-3xl font-black font-display">{analysis.overallManipulationRisk}%</div>
                  </div>
                </div>
              </div>

              {/* Explainable AI Panel */}
              <div className="bg-white border-[3px] border-[#111111] brutal-shadow p-5 font-mono text-xs">
                <div className="font-black uppercase text-[#844469] pb-2 border-b-[2px] border-[#111111] flex items-center gap-1.5 mb-3">
                  <AlertCircle className="w-4 h-4 text-[#D95D5D]" />
                  WHY ARGOS THINKS THIS IS SUSPICIOUS
                </div>

                <p className="text-[#111111]/90 leading-relaxed mb-4">
                  "{analysis.explanation}"
                </p>

                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-gray-600">
                    CLICK EXHIBIT FRAME:
                  </div>
                  {analysis.evidenceFrames.map((frame, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedFrameIdx(idx)}
                      className={`w-full text-left p-2 border-[2px] border-[#111111] text-[11px] transition-all ${
                        selectedFrameIdx === idx ? 'bg-[#F4CD3F] font-bold shadow-[2px_2px_0px_#111111]' : 'bg-[#F8E8E8] hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>FRAME #{frame.frameNumber} [{frame.timestamp}]</span>
                        <span className="text-[#D95D5D] font-bold">{frame.riskPct}%</span>
                      </div>
                      <div className="text-[10px] text-gray-700 mt-0.5 line-clamp-1">{frame.label}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
