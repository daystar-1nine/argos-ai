'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Volume2, 
  Activity, 
  AlertTriangle,
  Clock,
  FastForward
} from 'lucide-react';

export interface TimelineSegment {
  start: string;
  end: string;
  status: 'normal' | 'suspicious' | 'high_risk';
  riskPct: number;
  note: string;
}

export interface VideoSyncControllerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number; // 0 to 32 seconds
  onSeek: (time: number) => void;
  onJumpToAnomaly: () => void;
  timelineSegments?: TimelineSegment[];
  isAnomalyZone: boolean;
  syncScore?: number;
  riskScore?: number;
  currentFrameNumber?: number;
  className?: string;
}

export default function VideoSyncController({
  isPlaying,
  onTogglePlay,
  currentTime,
  onSeek,
  onJumpToAnomaly,
  timelineSegments = [
    { start: "00:00", end: "00:07", status: "normal", riskPct: 8, note: "Baseline authentic audio & video" },
    { start: "00:07", end: "00:14", status: "suspicious", riskPct: 42, note: "Subtle viseme lag starts developing" },
    { start: "00:14", end: "00:18", status: "high_risk", riskPct: 93, note: "HIGH RISK: Lip-sync mismatch +320ms, synthetic mouth warp" },
    { start: "00:18", end: "00:26", status: "high_risk", riskPct: 86, note: "AI voice synthesis spectral vocoder anomaly" },
    { start: "00:26", end: "00:32", status: "normal", riskPct: 12, note: "Authentic outro segment" }
  ],
  isAnomalyZone,
  syncScore = 98,
  riskScore = 8,
  currentFrameNumber = 420,
  className = ''
}: VideoSyncControllerProps) {
  const totalDuration = 32.0;

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 100);
    return `00:${s < 10 ? '0' : ''}${s}.${ms < 10 ? '0' : ''}${ms}`;
  };

  return (
    <div className={`bg-[#0d1117] border-[3px] border-[#111111] text-white p-3 sm:p-4 brutal-shadow-sm font-mono space-y-3 ${className}`}>
      
      {/* Top Header Controls: Play/Pause, Frame, Timestamp & Jump Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/15">
        
        {/* Left: Playback buttons & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-[#F4CD3F] hover:bg-white text-[#111111] border-2 border-black brutal-shadow-sm flex items-center justify-center transition-all cursor-pointer"
            title={isPlaying ? "Pause Playback" : "Play Playback"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => onSeek(0)}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-[#EFD99C] text-[#111111] border-2 border-black brutal-shadow-sm flex items-center justify-center transition-all cursor-pointer"
            title="Rewind to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 border border-white/20 text-xs">
            <Clock className="w-3.5 h-3.5 text-[#F4CD3F]" />
            <span className="font-bold text-white tracking-wider">{formatSeconds(currentTime)}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">00:32.00</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-black/60 px-2 py-1 border border-white/20 text-[11px] text-[#8BCF9B] font-bold">
            FRAME #{currentFrameNumber}
          </div>
        </div>

        {/* Right: SYNCED Badge & Jump to Anomaly Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/80 border border-[#8BCF9B] text-[#8BCF9B] text-[10px] font-black uppercase">
            <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink-fast" />
            <span>SYNCED</span>
          </div>

          {/* Jump to Anomaly Button (Requirement 7) */}
          <button
            onClick={onJumpToAnomaly}
            className="px-3 py-1.5 bg-[#D95D5D] hover:bg-[#ff7373] text-white border-2 border-[#111111] brutal-shadow-sm text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Seek directly to high-risk anomaly segment (00:14 - 00:18)"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>[ JUMP TO ANOMALY ]</span>
          </button>
        </div>

      </div>

      {/* Interactive Timeline Scrubber Bar */}
      <div className="space-y-1.5">
        <div className="relative w-full h-7 bg-black/90 border-2 border-[#111111] overflow-hidden cursor-pointer select-none">
          
          {/* Timeline color-coded background segments */}
          <div className="absolute inset-0 flex">
            {/* 00:00 - 00:07 Normal (7/32 = 21.8%) */}
            <div 
              style={{ width: `${(7 / totalDuration) * 100}%` }}
              className="h-full bg-[#8BCF9B]/25 border-r border-black/60 hover:bg-[#8BCF9B]/40 transition-colors flex items-center px-1"
              title="00:00 - 00:07 Normal (8% Risk)"
              onClick={() => onSeek(3.5)}
            >
              <span className="text-[8px] font-mono text-[#8BCF9B] font-bold hidden md:inline">NORMAL</span>
            </div>

            {/* 00:07 - 00:14 Suspicious (7/32 = 21.8%) */}
            <div 
              style={{ width: `${(7 / totalDuration) * 100}%` }}
              className="h-full bg-[#F4CD3F]/30 border-r border-black/60 hover:bg-[#F4CD3F]/45 transition-colors flex items-center px-1"
              title="00:07 - 00:14 Suspicious (42% Risk)"
              onClick={() => onSeek(10.5)}
            >
              <span className="text-[8px] font-mono text-[#F4CD3F] font-bold hidden md:inline">SUSPECT</span>
            </div>

            {/* 00:14 - 00:18 High Risk Anomaly (4/32 = 12.5%) */}
            <div 
              style={{ width: `${(4 / totalDuration) * 100}%` }}
              className="h-full bg-[#D95D5D]/50 border-r border-black/60 hover:bg-[#D95D5D]/70 transition-colors flex items-center justify-center px-1 animate-pulse"
              title="00:14 - 00:18 HIGH RISK ANOMALY (+320ms Mismatch)"
              onClick={() => onSeek(15.4)}
            >
              <span className="text-[8px] font-mono text-white font-black tracking-wider whitespace-nowrap">
                ⚠ HIGH RISK
              </span>
            </div>

            {/* 00:18 - 00:26 Vocoder Risk (8/32 = 25%) */}
            <div 
              style={{ width: `${(8 / totalDuration) * 100}%` }}
              className="h-full bg-[#844469]/40 border-r border-black/60 hover:bg-[#844469]/55 transition-colors flex items-center px-1"
              title="00:18 - 00:26 AI Voice Synthesis Anomaly"
              onClick={() => onSeek(22)}
            >
              <span className="text-[8px] font-mono text-[#EFD99C] font-bold hidden md:inline">VOICE CLONE</span>
            </div>

            {/* 00:26 - 00:32 Normal Outro (6/32 = 18.75%) */}
            <div 
              style={{ width: `${(6 / totalDuration) * 100}%` }}
              className="h-full bg-[#8BCF9B]/25 hover:bg-[#8BCF9B]/40 transition-colors flex items-center px-1"
              title="00:26 - 00:32 Outro Normal"
              onClick={() => onSeek(29)}
            >
              <span className="text-[8px] font-mono text-[#8BCF9B] font-bold hidden md:inline">OUTRO</span>
            </div>
          </div>

          {/* Draggable Playhead Needle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] z-20 pointer-events-none"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          >
            <div className="absolute -top-1 -translate-x-1/2 w-2.5 h-2 bg-white border border-black" />
          </div>

          {/* Invisible click handler */}
          <input
            type="range"
            min="0"
            max={totalDuration}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
          />
        </div>

        {/* Timeline Marks */}
        <div className="flex justify-between text-[9px] text-white/50 font-mono px-0.5">
          <span>00:00</span>
          <span>00:07</span>
          <span className="text-[#D95D5D] font-bold">00:14 (ANOMALY)</span>
          <span>00:18</span>
          <span>00:26</span>
          <span>00:32</span>
        </div>
      </div>

      {/* Real-time Waveform & Lip Sync Signal Gauges */}
      <div className="p-2 bg-black/60 border border-white/15 space-y-2 text-[10px]">
        
        {/* Audio Waveform */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#F4CD3F] flex items-center gap-1.5 font-bold">
            <Volume2 className="w-3.5 h-3.5" /> AUDIO VOCODER SPECTRUM:
          </span>
          <span className={isAnomalyZone ? "text-[#D95D5D] font-black" : "text-[#8BCF9B] font-bold"}>
            {isAnomalyZone ? "ANOMALY 62% (SYNTHETIC VOCODER)" : "NOMINAL SENSOR SPECTRUM"}
          </span>
        </div>

        <div className="h-5 flex items-end gap-0.5 bg-black p-0.5 border border-white/10">
          {Array.from({ length: 36 }).map((_, i) => {
            const height = isAnomalyZone 
              ? Math.min(100, Math.max(20, Math.sin((i + currentTime * 4) * 0.8) * 50 + 40))
              : Math.min(100, Math.max(15, Math.sin((i + currentTime * 2) * 0.5) * 35 + 25));
            return (
              <div 
                key={i} 
                className={`flex-1 transition-all duration-75 ${
                  isAnomalyZone ? 'bg-[#D95D5D]' : 'bg-[#F4CD3F]'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>

        {/* Viseme Sync Delta */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <span className="text-white/80">PHONEME-TO-VISEME DELTA:</span>
          <span className={`font-mono font-black ${isAnomalyZone ? "text-[#D95D5D]" : "text-[#8BCF9B]"}`}>
            {isAnomalyZone ? "+320ms (CRITICAL DESYNC)" : "0.0ms (SYNCHRONIZED)"}
          </span>
        </div>

      </div>

    </div>
  );
}
