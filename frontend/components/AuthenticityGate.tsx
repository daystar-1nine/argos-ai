'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Upload, 
  FileCheck, 
  Cpu, 
  Camera, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AuthenticityVerdict } from '@/lib/types';
import ArgosLoader from '@/components/ui/ArgosLoader';

export default function AuthenticityGate({ onProceedToProtect }: { onProceedToProtect?: () => void }) {

  const [analyzing, setAnalyzing] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<'authentic' | 'synthetic' | 'inconclusive'>('authentic');
  const [fileName, setFileName] = useState('camera_raw_keynote_master_4k.mp4');
  const [analysisStep, setAnalysisStep] = useState(0);

  // Analysis Result State
  const [verdict, setVerdict] = useState<AuthenticityVerdict>('Likely authentic');
  const [eligible, setEligible] = useState(true);
  const [aiGenScore, setAiGenScore] = useState(4.2);
  const [visualScore, setVisualScore] = useState(96.8);
  const [temporalScore, setTemporalScore] = useState(97.4);
  const [metadataNote, setMetadataNote] = useState('Hardware sensor PRNU consistent (Sony FX6 XAVC-I profile)');

  const runAnalysis = (scenario: 'authentic' | 'synthetic' | 'inconclusive', name?: string) => {
    setSelectedScenario(scenario);
    if (name) setFileName(name);
    setAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 500);
    setTimeout(() => setAnalysisStep(3), 1000);
    setTimeout(() => setAnalysisStep(4), 1400);

    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisStep(0);
      if (scenario === 'synthetic') {
        setVerdict('Potentially synthetic');
        setEligible(false);
        setAiGenScore(87.4);
        setVisualScore(34.1);
        setTemporalScore(41.8);
        setMetadataNote('Suspect: Synthetic diffusion schedule & missing optical PRNU sensor noise');
      } else if (scenario === 'inconclusive') {
        setVerdict('Insufficient evidence');
        setEligible(false);
        setAiGenScore(52.0);
        setVisualScore(58.5);
        setTemporalScore(54.0);
        setMetadataNote('Truncated container metadata; heavy re-encoding prevents noise-floor ground truth');
      } else {
        setVerdict('Likely authentic');
        setEligible(true);
        setAiGenScore(4.2);
        setVisualScore(96.8);
        setTemporalScore(97.4);
        setMetadataNote('Hardware sensor PRNU consistent (Sony FX6 XAVC-I profile)');
      }
    }, 1800);
  };

  return (
    <section id="authenticity-gate" className="w-full py-20 px-4 lg:px-8 bg-[#EFD99C] border-b-[3px] border-[#111111] relative">
      {analyzing && (
        <ArgosLoader 
          variant="analysis" 
          targetName={fileName} 
          duration={1800} 
          onClose={() => setAnalyzing(false)} 
        />
      )}
      <div className="max-w-7xl mx-auto">

        
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            02 // PRE-PROTECTION VERIFICATION
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display leading-[0.95] mb-4">
            BEFORE WE PROTECT IT,<br />
            WE VERIFY IT.
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 leading-relaxed">
            Argos does not blindly register unverified uploads. To prevent bad actors from registering 
            synthetic or deepfake media as "original," every asset must first pass through the 
            probabilistic Authenticity Gate.
          </p>
        </div>

        {/* Main Interactive Gate Box */}
        <div className="bg-[#F7F3E8] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8">
          
          {/* Top Presets Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b-[3px] border-[#111111] gap-4 font-mono text-xs">
            <span className="font-bold text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#844469]" />
              CHOOSE SAMPLE FILE FOR AUTHENTICITY AUDIT:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runAnalysis('authentic', 'camera_raw_keynote_master_4k.mp4')}
                disabled={analyzing}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase transition-all ${
                  selectedScenario === 'authentic' && !analyzing
                    ? 'bg-[#8BCF9B] text-[#111111] shadow-[2px_2px_0px_#111111]'
                    : 'bg-white hover:bg-[#EFD99C]'
                }`}
              >
                ✓ Authentic Master
              </button>
              <button
                onClick={() => runAnalysis('synthetic', 'sadtalker_generated_speech_v2.mp4')}
                disabled={analyzing}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase transition-all ${
                  selectedScenario === 'synthetic' && !analyzing
                    ? 'bg-[#D95D5D] text-white shadow-[2px_2px_0px_#111111]'
                    : 'bg-white hover:bg-[#EFD99C]'
                }`}
              >
                ⚠ Synthetic AI Content
              </button>
              <button
                onClick={() => runAnalysis('inconclusive', 'lowres_reencoded_clip.mp4')}
                disabled={analyzing}
                className={`px-3 py-1.5 border-[2px] border-[#111111] font-bold uppercase transition-all ${
                  selectedScenario === 'inconclusive' && !analyzing
                    ? 'bg-[#F4CD3F] text-[#111111] shadow-[2px_2px_0px_#111111]'
                    : 'bg-white hover:bg-[#EFD99C]'
                }`}
              >
                ? Inconclusive Asset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Dropzone & Inspection Pipeline */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              
              {/* Dropzone */}
              <div 
                onClick={() => !analyzing && runAnalysis(selectedScenario)}
                className={`border-[3px] border-dashed border-[#111111] p-6 bg-white flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  analyzing ? 'bg-[#EFD99C]/40 border-solid' : 'hover:bg-[#EFD99C]/20'
                }`}
              >
                <div className="w-12 h-12 bg-[#F4CD3F] border-[2px] border-[#111111] flex items-center justify-center mb-3">
                  {analyzing ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-[#111111]" />
                  ) : (
                    <Upload className="w-6 h-6 text-[#111111]" />
                  )}
                </div>
                <div className="font-mono text-xs font-black uppercase text-[#111111]">
                  ACTIVE FILE: <span className="text-[#844469]">{fileName}</span>
                </div>
                <div className="font-mono text-[11px] text-[#111111]/60 mt-1">
                  Click to re-run 5-point sensor and optical consistency gate
                </div>
              </div>

              {/* 5-Step Pipeline Indicators */}
              <div className="mt-6 space-y-2 font-mono text-xs">
                <div className="text-[11px] font-bold text-[#111111]/70 uppercase mb-2">
                  GATE VALIDATION PIPELINE:
                </div>

                <div className="flex items-center justify-between p-2 bg-white border-[2px] border-[#111111]">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#111111]" />
                    01 AI-Generation Diffusion Residue
                  </span>
                  <span className={`font-bold ${aiGenScore > 50 ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                    {analyzing && analysisStep < 1 ? 'ANALYZING...' : `${aiGenScore}% ANOMALY`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border-[2px] border-[#111111]">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#111111]" />
                    02 Hardware Sensor PRNU & EXIF
                  </span>
                  <span className={`font-bold ${selectedScenario === 'authentic' ? 'text-[#8BCF9B]' : 'text-[#D95D5D]'}`}>
                    {analyzing && analysisStep < 2 ? 'ANALYZING...' : selectedScenario === 'authentic' ? 'VALID' : 'DEFICIENT'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border-[2px] border-[#111111]">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#111111]" />
                    03 Visual Spatial Consistency
                  </span>
                  <span className="font-bold text-[#111111]">
                    {analyzing && analysisStep < 3 ? 'ANALYZING...' : `${visualScore}% CONGRUENCE`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border-[2px] border-[#111111]">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#111111]" />
                    04 Temporal & Physical Motion Physics
                  </span>
                  <span className="font-bold text-[#111111]">
                    {analyzing && analysisStep < 4 ? 'ANALYZING...' : `${temporalScore}% CONTINUITY`}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Gate Verdict & Protection Status */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              
              <div className={`p-6 border-[3px] border-[#111111] brutal-shadow h-full flex flex-col justify-between ${
                eligible ? 'bg-[#8BCF9B]/30' : verdict === 'Potentially synthetic' ? 'bg-[#D95D5D]/20' : 'bg-[#F4CD3F]/30'
              }`}>
                
                <div>
                  <div className="flex items-center justify-between font-mono text-xs font-bold uppercase mb-4">
                    <span>GATE AUDIT DECISION</span>
                    <span className="text-[10px] bg-[#111111] text-white px-2 py-0.5">
                      PROBABILISTIC CLASSIFIER
                    </span>
                  </div>

                  {/* Big Verdict Banner */}
                  {eligible ? (
                    <div className="p-4 bg-[#8BCF9B] border-[2.5px] border-[#111111] brutal-shadow-sm mb-4">
                      <div className="flex items-center gap-2 text-black font-black text-lg sm:text-xl uppercase font-display">
                        <CheckCircle2 className="w-6 h-6" />
                        AUTHENTICITY ESTABLISHED
                      </div>
                      <div className="font-mono text-xs font-black text-black/80 mt-1">
                        PROTECTION ELIGIBLE ✓
                      </div>
                    </div>
                  ) : verdict === 'Potentially synthetic' ? (
                    <div className="p-4 bg-[#D95D5D] text-white border-[2.5px] border-[#111111] brutal-shadow-sm mb-4">
                      <div className="flex items-center gap-2 font-black text-lg sm:text-xl uppercase font-display">
                        <XCircle className="w-6 h-6" />
                        AUTHENTICITY NOT ESTABLISHED
                      </div>
                      <div className="font-mono text-xs font-black text-white/90 mt-1">
                        PROTECTION CERTIFICATE NOT ISSUED ✗
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F4CD3F] text-black border-[2.5px] border-[#111111] brutal-shadow-sm mb-4">
                      <div className="flex items-center gap-2 font-black text-lg sm:text-xl uppercase font-display">
                        <HelpCircle className="w-6 h-6" />
                        INSUFFICIENT EVIDENCE
                      </div>
                      <div className="font-mono text-xs font-black text-black/80 mt-1">
                        RAW FOOTAGE / SENSOR EXIF REQUIRED ?
                      </div>
                    </div>
                  )}

                  {/* Verdict Details */}
                  <div className="bg-white border-[2px] border-[#111111] p-4 font-mono text-xs space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">PROBABILISTIC VERDICT:</span>
                      <span className="font-black text-[#844469] uppercase">"{verdict}"</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">AI GENERATION RISK:</span>
                      <span className="font-black">{aiGenScore}%</span>
                    </div>
                    <div className="pt-2 border-t border-[#111111]/20 text-[11px] text-[#111111]/80">
                      <strong>Metadata Integrity:</strong> {metadataNote}
                    </div>
                  </div>

                  {/* Important Non-100% Certainty Rule Notice */}
                  <div className="p-2.5 bg-[#EFD99C] border border-[#111111] text-[10px] font-mono text-[#111111]/80 leading-tight">
                    <strong>INTEGRITY POLICY:</strong> Argos utilizes probabilistic forensic neural models and never guarantees 100% certainty. 
                    This gate strictly prevents bad actors from creating counterfeit original provenance certificates for synthetic content.
                  </div>
                </div>

                {/* Bottom CTA to Step 02/03 */}
                <div className="mt-6 pt-4 border-t-[2px] border-[#111111]/30 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#111111]/70">
                    STATUS: {eligible ? 'READY FOR MEDIA DNA ENCODING' : 'HALTED AT GATE'}
                  </span>
                  {eligible && (
                    <a
                      href="#media-dna"
                      className="px-4 py-2 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] brutal-btn font-mono text-xs font-black"
                    >
                      GENERATE MEDIA DNA →
                    </a>
                  )}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
