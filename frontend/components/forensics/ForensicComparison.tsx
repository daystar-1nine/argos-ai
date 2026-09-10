'use client';

import React, { useState, useEffect } from 'react';
import { 
  Split, 
  Layers, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  Activity,
  Check
} from 'lucide-react';
import ComparisonMedia from './ComparisonMedia';
import ComparisonSlider from './ComparisonSlider';
import VideoSyncController from './VideoSyncController';

export interface ForensicComparisonProps {
  initialTime?: number;
  initialViewMode?: 'split' | 'slider';
  compact?: boolean;
  className?: string;
  onSegmentChange?: (segmentIdx: number) => void;
}

export default function ForensicComparison({
  initialTime = 15.4, // defaults inside 00:14 - 00:18 high-risk zone
  initialViewMode = 'split',
  compact = false,
  className = '',
  onSegmentChange
}: ForensicComparisonProps) {
  const [viewMode, setViewMode] = useState<'split' | 'slider'>(initialViewMode);
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [isPlaying, setIsPlaying] = useState(false);

  // Best Hackathon Demo Sequence (Requirement 4)
  // 'idle' -> 'original_loaded' -> 'analyzing' -> 'match_found' -> 'manipulation_detected' -> 'ready'
  const [demoSequenceState, setDemoSequenceState] = useState<'original_loaded' | 'analyzing' | 'match_found' | 'ready'>('ready');
  const [isScanning, setIsScanning] = useState(false);

  // Playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          return next > 32 ? 0 : parseFloat(next.toFixed(1));
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Run Hackathon Demo Sequence
  const triggerScanSequence = () => {
    setIsScanning(true);
    setDemoSequenceState('original_loaded');

    setTimeout(() => {
      setDemoSequenceState('analyzing');
    }, 450);

    setTimeout(() => {
      setDemoSequenceState('match_found');
    }, 950);

    setTimeout(() => {
      setDemoSequenceState('ready');
      setIsScanning(false);
      // jump right to the high risk moment
      setCurrentTime(15.4);
    }, 1450);
  };

  // Determine current timeline zone
  const isAnomalyZone = currentTime >= 14 && currentTime <= 18;
  const isSuspiciousZone = currentTime >= 7 && currentTime < 14;

  // Frame calculation (approx 30 fps)
  const currentFrameNumber = Math.floor(currentTime * 30);

  // Dynamic media resolution based on timestamp
  const originalSrc = "/demo/original/original-01.jpg";
  const manipulatedSrc = isAnomalyZone 
    ? "/demo/manipulated/manipulated-01.jpg" 
    : isSuspiciousZone 
      ? "/demo/manipulated/manipulated-01-suspicious.jpg" 
      : "/demo/manipulated/manipulated-01-normal.jpg";

  // Anomaly metadata
  const anomalyLabel = isAnomalyZone 
    ? "LIP-SYNC ANOMALY +320ms" 
    : isSuspiciousZone 
      ? "SUSPECT PHONEME LAG +90ms" 
      : "NOMINAL";
      
  const riskPct = isAnomalyZone ? 93 : isSuspiciousZone ? 42 : 8;

  const handleJumpToAnomaly = () => {
    setCurrentTime(15.4);
    setIsPlaying(false);
  };

  return (
    <div className={`flex flex-col font-mono select-none ${className}`}>
      
      {/* Top Toolbar Controls: View Mode, Overlay Toggle & Scan Trigger */}
      <div className="flex flex-wrap items-center justify-between p-2.5 sm:p-3 bg-[#111111] text-white border-[3px] border-[#111111] gap-3">
        
        {/* Left: View Mode Switcher (Side-by-Side vs Slider) */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-white/60 text-[10px] uppercase font-bold mr-1 hidden sm:inline">VIEW:</span>
          
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 text-xs font-black uppercase border-[2px] border-[#111111] flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'split' 
                ? 'bg-[#F4CD3F] text-[#111111] shadow-[2px_2px_0px_#111111]' 
                : 'bg-[#222222] text-white/80 hover:bg-[#333333]'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1 text-xs font-black uppercase border-[2px] border-[#111111] flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'slider' 
                ? 'bg-[#F4CD3F] text-[#111111] shadow-[2px_2px_0px_#111111]' 
                : 'bg-[#222222] text-white/80 hover:bg-[#333333]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Compare Slider</span>
          </button>
        </div>

        {/* Right: Forensic Overlay Toggle & Demo Re-scan */}
        <div className="flex items-center gap-2 text-xs">
          {/* Toggle: [ FORENSIC OVERLAY ] */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-3 py-1 text-[11px] font-black uppercase border-[2px] border-[#111111] flex items-center gap-1.5 transition-all cursor-pointer ${
              showOverlay 
                ? 'bg-[#8BCF9B] text-[#111111] shadow-[2px_2px_0px_#111111]' 
                : 'bg-[#333333] text-white/70 hover:bg-[#444444]'
            }`}
            title="Toggle face detection boxes, mouth mesh, and anomaly markers"
          >
            {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>FORENSIC OVERLAY: {showOverlay ? "ON" : "OFF"}</span>
          </button>

          {/* Re-scan sequence button (Requirement 4) */}
          <button
            onClick={triggerScanSequence}
            disabled={isScanning}
            className="px-3 py-1 bg-[#844469] hover:bg-[#9c527c] text-[#EFD99C] border-[2px] border-[#111111] brutal-btn text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Replay sequence: Original Loaded -> Analyzing -> Match Found -> Manipulation Detected"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">RE-SCAN FEED</span>
          </button>
        </div>

      </div>

      {/* ============================================================== */}
      {/* SCANNING SEQUENCE STATUS BANNER (Requirement 4)               */}
      {/* ============================================================== */}
      {isScanning && (
        <div className="p-2.5 bg-[#F4CD3F] text-[#111111] border-x-[3px] border-b-[3px] border-[#111111] flex items-center justify-between text-xs font-black uppercase animate-pulse">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            <span>
              {demoSequenceState === 'original_loaded' && "1/3 // ORIGINAL MASTER LOADED [C2PA SIGNED]"}
              {demoSequenceState === 'analyzing' && "2/3 // RUNNING FORENSIC SPECTRAL SCAN & VISEME CORRELATION..."}
              {demoSequenceState === 'match_found' && "3/3 // MATCH LOCATED ON PUBLIC INDEX // DERIVATIVE TAMPER DETECTED"}
            </span>
          </div>
          <span className="text-[10px] bg-black text-[#F4CD3F] px-2 py-0.5">
            CORRELATING
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* MAIN VIEWPORT: SIDE-BY-SIDE OR SLIDER                         */}
      {/* ============================================================== */}
      <div className="bg-[#0b0f15] border-x-[3px] border-b-[3px] border-[#111111] p-3 sm:p-4">
        
        {viewMode === 'split' ? (
          /* Responsive Side-by-Side: 2 columns on desktop, stacked on mobile */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            
            {/* Left Panel: ORIGINAL [VERIFIED] */}
            <ComparisonMedia
              variant="original"
              src={originalSrc}
              title="ORIGINAL [VERIFIED]"
              badge="✓ PROVENANCE VALID"
              isAnomaly={false}
              showOverlay={showOverlay}
              timestamp={currentTime}
              frameNumber={currentFrameNumber}
              compact={compact}
            />

            {/* Right Panel: MANIPULATED [DETECTED] */}
            {demoSequenceState !== 'original_loaded' ? (
              <ComparisonMedia
                variant="manipulated"
                src={manipulatedSrc}
                title="MANIPULATED [DETECTED]"
                badge={isAnomalyZone ? "⚠ ANOMALY DETECTED" : "INDEXED DERIVATIVE"}
                isAnomaly={isAnomalyZone}
                showOverlay={showOverlay}
                timestamp={currentTime}
                frameNumber={currentFrameNumber}
                anomalyLabel={anomalyLabel}
                riskPct={riskPct}
                compact={compact}
              />
            ) : (
              /* Temporary scanning placeholder during first 400ms of demo sequence */
              <div className="aspect-video bg-[#1a141c] border-[3px] border-dashed border-[#D95D5D] flex flex-col items-center justify-center p-6 text-center text-[#EFD99C]">
                <Activity className="w-8 h-8 text-[#D95D5D] animate-spin mb-2" />
                <div className="text-xs font-black uppercase text-[#D95D5D]">
                  ACQUIRING SUSPECT STREAM...
                </div>
                <div className="text-[10px] text-white/60 mt-1">
                  Correlating perceptual hashes across indexed mirrors
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Interactive Compare Slider */
          <ComparisonSlider
            originalSrc={originalSrc}
            manipulatedSrc={manipulatedSrc}
            showOverlay={showOverlay}
            isAnomaly={isAnomalyZone}
            timestamp={currentTime}
            frameNumber={currentFrameNumber}
            anomalyLabel={anomalyLabel}
            riskPct={riskPct}
          />
        )}

      </div>

      {/* ============================================================== */}
      {/* SYNCHRONIZED TIMELINE & CONTROLS (Requirements 7, 8, 10)      */}
      {/* ============================================================== */}
      <VideoSyncController
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentTime={currentTime}
        onSeek={(t) => setCurrentTime(t)}
        onJumpToAnomaly={handleJumpToAnomaly}
        isAnomalyZone={isAnomalyZone}
        syncScore={isAnomalyZone ? 41 : 98}
        riskScore={riskPct}
        currentFrameNumber={currentFrameNumber}
        className="border-t-0"
      />

    </div>
  );
}
