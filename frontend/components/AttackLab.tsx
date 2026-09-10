'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Crop, 
  Maximize2, 
  FileArchive, 
  RefreshCw,
  Eye,
  Sliders,
  Radio
} from 'lucide-react';
import { AttackType } from '@/lib/types';
import { ATTACK_RESPONSES, DEMO_ASSET } from '@/lib/data';
import ArgosLoader from '@/components/ui/ArgosLoader';
import ComparisonMedia from '@/components/forensics/ComparisonMedia';


export default function AttackLab() {
  const [selectedAttack, setSelectedAttack] = useState<AttackType>('face_swap');
  const [isSimulating, setIsSimulating] = useState(false);
  const [intensity, setIntensity] = useState(80);

  const attackResult = ATTACK_RESPONSES[selectedAttack];

  const triggerAttack = (type: AttackType) => {
    setSelectedAttack(type);
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <section id="attack-lab" className="w-full py-20 px-4 lg:px-8 bg-[#EFD99C] border-b-[3px] border-[#111111] relative">
      {isSimulating && (
        <ArgosLoader 
          variant="analysis" 
          targetName={`Adversarial Stress Test: ${selectedAttack.replace('_', ' ').toUpperCase()}`} 
          duration={1500} 
          onClose={() => setIsSimulating(false)} 
        />
      )}
      <div className="max-w-7xl mx-auto">

        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-3">
            04 // STRESS TEST LAB
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
            ATTACK YOUR OWN MEDIA.
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 mt-2">
            "Test how your protected media responds to common transformations."
          </p>
        </div>

        {/* The 7 Attack Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {[
            { id: 'face_swap', label: 'FACE SWAP' },
            { id: 'lip_sync', label: 'LIP SYNC' },
            { id: 'audio_replacement', label: 'AUDIO REPLACEMENT' },
            { id: 'ai_regeneration', label: 'AI REGENERATION' },
            { id: 'crop', label: 'CROP' },
            { id: 'resize', label: 'RESIZE' },
            { id: 'compression', label: 'COMPRESSION' },
          ].map((attack) => (
            <button
              key={attack.id}
              onClick={() => triggerAttack(attack.id as AttackType)}
              disabled={isSimulating}
              className={`px-4 py-2 font-mono text-xs font-black uppercase border-[2.5px] border-[#111111] brutal-btn transition-all ${
                selectedAttack === attack.id
                  ? 'bg-[#844469] text-white shadow-[4px_4px_0px_#111111]'
                  : 'bg-[#F7F3E8] text-[#111111] hover:bg-[#F4CD3F]'
              }`}
            >
              [ {attack.label} ]
            </button>
          ))}
        </div>

        {/* Main Attack Lab Workspace */}
        <div className="bg-[#F7F3E8] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8">
          
          {/* Top Bar: Attack Scenario Metadata */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-[3px] border-[#111111] gap-4 font-mono text-xs font-bold uppercase">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#D95D5D] led-blink" />
              <span>ACTIVE STRESS VECTOR: <strong className="text-[#844469]">{selectedAttack.replace('_', ' ')}</strong></span>
            </div>
            
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-[#111111]/70">TARGET: {DEMO_ASSET.id}</span>
              <span className="bg-[#111111] text-[#F4CD3F] px-2 py-0.5">
                INTENSITY: {intensity}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left 7 Cols: ORIGINAL vs ATTACKED Visual Comparison */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ComparisonMedia
                  variant="original"
                  src="/demo/original/original-01.jpg"
                  title="ORIGINAL [PROTECTED]"
                  badge="C2PA SIGNED"
                  timestamp="00:14.00"
                  frameNumber={420}
                />

                <ComparisonMedia
                  variant="manipulated"
                  src={
                    selectedAttack === 'face_swap' 
                      ? '/demo/manipulated/manipulated-02.jpg' 
                      : (selectedAttack === 'ai_regeneration' 
                          ? '/demo/manipulated/manipulated-01-suspicious.jpg' 
                          : (selectedAttack === 'crop' || selectedAttack === 'resize' || selectedAttack === 'compression'
                              ? '/demo/manipulated/manipulated-01-normal.jpg'
                              : '/demo/manipulated/manipulated-01.jpg'))
                  }
                  title="ATTACKED DERIVATIVE"
                  badge={isSimulating ? "INJECTING..." : (attackResult.manipulationDetected ? "ANOMALY FOUND" : "BENIGN DERIVATIVE")}
                  isAnomaly={attackResult.manipulationDetected}
                  riskPct={attackResult.tamperHeatScore}
                  anomalyLabel={
                    selectedAttack === 'face_swap' ? "FACE BLEND WARP [94%]" :
                    selectedAttack === 'lip_sync' ? "VISEME LAG +320ms" :
                    selectedAttack === 'audio_replacement' ? "VOCODER ANOMALY DETECTED" :
                    selectedAttack === 'ai_regeneration' ? "DIFFUSION INPAINTING: 34%" :
                    selectedAttack === 'crop' ? "20% PERIPHERAL CROP DETECTED" :
                    selectedAttack === 'resize' ? "DOWNSAMPLED: 4K → 720p" : "H.264 CRF 28 RE-ENCODE"
                  }
                  timestamp="00:14.00"
                  frameNumber={420}
                />
              </div>

              {/* Technical Analysis Notes below comparison */}
              <div className="mt-4 p-3 bg-white border-[2px] border-[#111111] font-mono text-xs">
                <span className="font-bold text-[#844469] uppercase">FORENSIC TELEMETRY: </span>
                <span className="text-[#111111]/90">{attackResult.analysisNotes}</span>
              </div>

            </div>

            {/* Right 5 Cols: Resilience Score & Triple Pillar Status */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              
              <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-5 brutal-shadow">
                
                <div className="font-mono text-xs font-black uppercase text-[#111111] mb-2 flex items-center justify-between">
                  <span>PROTECTION RESILIENCE</span>
                  <span className="text-[10px] bg-[#111111] text-[#F4CD3F] px-2 py-0.5">SURVIVABILITY</span>
                </div>

                {/* Big Score: e.g. 86 / 100 */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl sm:text-6xl font-black text-[#111111] font-display">
                    {attackResult.resilienceScore}
                  </span>
                  <span className="text-2xl font-black text-[#111111]/60 font-mono">
                    / 100
                  </span>
                </div>

                {/* Triple Check Status Block */}
                <div className="space-y-2.5 font-mono text-xs">
                  
                  {/* Watermark Status */}
                  <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center justify-between font-bold">
                    <span className="text-[#111111]">Watermark:</span>
                    <span className="text-[#8BCF9B] font-black flex items-center gap-1">
                      ✓ DETECTED
                    </span>
                  </div>

                  {/* Media DNA Status */}
                  <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center justify-between font-bold">
                    <span className="text-[#111111]">Media DNA:</span>
                    <span className="text-[#8BCF9B] font-black flex items-center gap-1">
                      ✓ MATCHED
                    </span>
                  </div>

                  {/* Manipulation Status */}
                  <div className="p-2.5 bg-white border-[2px] border-[#111111] flex items-center justify-between font-bold">
                    <span className="text-[#111111]">Manipulation:</span>
                    <span className={`font-black flex items-center gap-1 ${
                      attackResult.manipulationDetected ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'
                    }`}>
                      {attackResult.manipulationDetected ? '⚠ DETECTED' : '✓ BENIGN EDIT'}
                    </span>
                  </div>

                </div>

                <div className="mt-4 pt-3 border-t border-[#111111]/20 font-mono text-[10px] text-[#111111]/70 leading-tight">
                  Even when faces or voices are synthetically altered, Argos spread-spectrum watermarking and 
                  Media DNA maintain fingerprint anchors, proving ownership and pinpointing exact changes.
                </div>

              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#111111]">
                  NEED TO TEST CUSTOM TRANSFORMATION?
                </span>
                <a
                  href="/dashboard/attack-lab"
                  className="px-3.5 py-1.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] brutal-btn font-mono text-xs font-black"
                >
                  FULL LAB CONSOLE →
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
