'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dna, ShieldCheck, Hash, Fingerprint, Waves, Clock, Sparkles } from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_PROTECTION } from '@/lib/data';

export default function MediaDNAVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dnaMode, setDnaMode] = useState<'visual' | 'audio' | 'temporal'>('visual');
  const [isCopied, setIsCopied] = useState(false);

  // Pixel particle DNA simulation on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    // Particle nodes for DNA double helix pixel art
    const particleCount = 70;
    const particles: Array<{
      x: number;
      y: number;
      baseY: number;
      speed: number;
      phase: number;
      color: string;
      size: number;
    }> = [];

    const colors = ['#F4CD3F', '#844469', '#8BCF9B', '#111111', '#EFD99C'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (i / particleCount) * width,
        y: height / 2,
        baseY: height / 2,
        speed: 0.03 + Math.random() * 0.02,
        phase: i * 0.18,
        color: colors[i % colors.length],
        size: 3 + Math.floor(Math.random() * 4),
      });
    }

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.fillStyle = '#EFD99C';
      ctx.fillRect(0, 0, width, height);

      // Draw pixel grid background
      ctx.strokeStyle = 'rgba(17, 17, 17, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw twin DNA helix strands with connecting pixel rungs
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const amp = dnaMode === 'audio' ? 45 : dnaMode === 'temporal' ? 35 : 55;
        
        const y1 = p.baseY + Math.sin(time * 1.5 + p.phase) * amp;
        const y2 = p.baseY + Math.sin(time * 1.5 + p.phase + Math.PI) * amp;

        // Draw connecting rung every 3 particles
        if (i % 3 === 0) {
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x, y1);
          ctx.lineTo(p.x, y2);
          ctx.stroke();
        }

        // Top strand pixel block
        ctx.fillStyle = dnaMode === 'visual' ? '#844469' : dnaMode === 'audio' ? '#111111' : '#D95D5D';
        ctx.fillRect(p.x - p.size / 2, y1 - p.size / 2, p.size, p.size);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - p.size / 2, y1 - p.size / 2, p.size, p.size);

        // Bottom strand pixel block
        ctx.fillStyle = '#F4CD3F';
        ctx.fillRect(p.x - p.size / 2, y2 - p.size / 2, p.size, p.size);
        ctx.strokeRect(p.x - p.size / 2, y2 - p.size / 2, p.size, p.size);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dnaMode]);

  const copyHash = () => {
    navigator.clipboard.writeText(DEMO_DNA.sha256Hash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="media-dna" className="w-full py-20 px-4 lg:px-8 bg-[#F7F3E8] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#844469] text-[#EFD99C] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-3">
              03 // CRYPTOGRAPHIC ENTROPY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
              ARGOS MEDIA DNA
            </h2>
          </div>
          <div className="font-mono text-xs text-[#111111]/80 max-w-md">
            Every verified asset receives a multi-dimensional digital genome combining 
            cryptographic SHA-256, perceptual visual embeddings, acoustic signatures, and temporal kinematics.
          </div>
        </div>

        {/* Main Display Container */}
        <div className="bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8">
          
          {/* Top Bar: Asset Metadata */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-[3px] border-[#111111] gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="font-black text-sm bg-[#111111] text-[#F4CD3F] px-2.5 py-1">
                ASSET: {DEMO_ASSET.id}
              </span>
              <span className="text-[#111111] font-bold hidden sm:inline">
                {DEMO_ASSET.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDnaMode('visual')}
                className={`px-3 py-1 border-[2px] border-[#111111] font-bold uppercase transition-all ${
                  dnaMode === 'visual' ? 'bg-[#844469] text-white shadow-[2px_2px_0px_#111111]' : 'bg-white text-black'
                }`}
              >
                Visual DNA
              </button>
              <button
                onClick={() => setDnaMode('audio')}
                className={`px-3 py-1 border-[2px] border-[#111111] font-bold uppercase transition-all ${
                  dnaMode === 'audio' ? 'bg-[#844469] text-white shadow-[2px_2px_0px_#111111]' : 'bg-white text-black'
                }`}
              >
                Audio DNA
              </button>
              <button
                onClick={() => setDnaMode('temporal')}
                className={`px-3 py-1 border-[2px] border-[#111111] font-bold uppercase transition-all ${
                  dnaMode === 'temporal' ? 'bg-[#844469] text-white shadow-[2px_2px_0px_#111111]' : 'bg-white text-black'
                }`}
              >
                Temporal DNA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Canvas: DNA Pixel Helix Particle Simulator */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="relative aspect-[16/9] w-full bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block" />
                
                {/* Floating Canvas Badges */}
                <div className="absolute top-3 left-3 bg-[#111111] text-[#F4CD3F] font-mono text-[10px] font-black px-2 py-0.5 border border-[#111111]">
                  GENOME STRAND // {dnaMode.toUpperCase()} VECTOR
                </div>

                <div className="absolute bottom-3 right-3 bg-white/90 text-black font-mono text-[9px] font-bold px-2 py-1 border border-[#111111]">
                  ENTROPY CONFIDENCE: {DEMO_DNA.entropyScore * 100}%
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-[#111111]/70">
                <span>ACTIVE SIMULATION: DOUBLE HELIX PIXEL PARTICLES</span>
                <span className="font-bold text-[#844469]">RESOLUTION: 3840x2160 MASTER</span>
              </div>
            </div>

            {/* Right Column: The 6 Core DNA Signatures */}
            <div className="lg:col-span-5 flex flex-col gap-3 font-mono">
              
              {/* SHA-256 Card */}
              <div className="bg-white border-[2.5px] border-[#111111] p-3 brutal-shadow-sm">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#844469]" />
                    SHA-256 ROOT FINGERPRINT
                  </span>
                  <button
                    onClick={copyHash}
                    className="text-[10px] text-[#844469] font-bold hover:underline"
                  >
                    {isCopied ? "COPIED ✓" : "COPY HASH"}
                  </button>
                </div>
                <div className="text-[10px] text-gray-700 break-all font-mono bg-[#F7F3E8] p-1.5 border border-[#111111]">
                  {DEMO_DNA.sha256Hash}
                </div>
              </div>

              {/* Visual DNA Bar */}
              <div className="bg-white border-[2.5px] border-[#111111] p-3 brutal-shadow-sm">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-[#844469]" />
                    VISUAL DNA (EMBEDDING)
                  </span>
                  <span className="text-[10px] font-bold text-[#844469]">96% ENTROPY</span>
                </div>
                <div className="font-mono text-[10px] font-bold text-[#111111] mb-1">
                  {DEMO_DNA.visualDnaSignature}
                </div>
                <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                  <div className="bg-[#844469] h-full w-[96%]" />
                </div>
              </div>

              {/* Audio DNA Bar */}
              <div className="bg-white border-[2.5px] border-[#111111] p-3 brutal-shadow-sm">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-[#844469]" />
                    AUDIO DNA (SPECTRAL HARMONICS)
                  </span>
                  <span className="text-[10px] font-bold text-[#844469]">84% ENTROPY</span>
                </div>
                <div className="font-mono text-[10px] font-bold text-[#111111] mb-1">
                  {DEMO_DNA.audioDnaSignature}
                </div>
                <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                  <div className="bg-[#F4CD3F] h-full w-[84%]" />
                </div>
              </div>

              {/* Temporal DNA Bar */}
              <div className="bg-white border-[2.5px] border-[#111111] p-3 brutal-shadow-sm">
                <div className="flex items-center justify-between text-xs font-black uppercase text-[#111111] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#844469]" />
                    TEMPORAL DNA (MICRO-SACCADES)
                  </span>
                  <span className="text-[10px] font-bold text-[#844469]">92% ENTROPY</span>
                </div>
                <div className="font-mono text-[10px] font-bold text-[#111111] mb-1">
                  {DEMO_DNA.temporalDnaSignature}
                </div>
                <div className="w-full bg-gray-200 h-2 border border-[#111111]">
                  <div className="bg-[#D95D5D] h-full w-[92%]" />
                </div>
              </div>

              {/* Provenance & Watermark Status Badges */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="p-2.5 bg-[#8BCF9B] border-[2px] border-[#111111] font-bold text-black text-xs flex items-center gap-2">
                  <span className="text-black font-black">✓</span>
                  <div>
                    <div className="text-[9px] uppercase text-black/70">PROVENANCE</div>
                    <div className="font-black text-[11px]">VERIFIED</div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#F4CD3F] border-[2px] border-[#111111] font-bold text-black text-xs flex items-center gap-2">
                  <span className="text-black font-black">✓</span>
                  <div>
                    <div className="text-[9px] uppercase text-black/70">WATERMARK</div>
                    <div className="font-black text-[11px]">ACTIVE</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
