'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Fingerprint, 
  RotateCcw,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { DEMO_ASSET, DEMO_DNA, DEMO_PROVENANCE } from '@/lib/data';

export default function PublicVerify() {
  const [queryId, setQueryId] = useState('ARG-2026-8A92F1');
  const [testMode, setTestMode] = useState<'derivative' | 'original'>('derivative');
  const [hasQueried, setHasQueried] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const handleVerify = (mode?: 'derivative' | 'original') => {
    const activeMode = mode || testMode;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasQueried(true);
    }, 600);
  };

  const isDerivative = testMode === 'derivative';

  return (
    <div className="w-full py-16 px-4 lg:px-8 bg-[#F7F3E8]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            PUBLIC PROVENANCE GATEWAY // ZERO ACCESS REQUIRED
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#111111] font-display">
            VERIFY MEDIA
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#111111]/80 max-w-lg mx-auto mt-2">
            Enter an Argos Asset ID or drop a file to verify its cryptographic lineage, 
            detect post-protection tampering, and check invisible watermark signals.
          </p>
        </div>

        {/* Verification Input Box */}
        <div className="bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8 mb-8">
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="Enter ARGOS ASSET ID (e.g. ARG-2026-8A92F1) or SHA-256..."
                className="w-full bg-white border-[3px] border-[#111111] p-3.5 font-mono text-xs font-bold uppercase text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#844469]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-[10px] hidden sm:block">
                SOVEREIGN LEDGER
              </div>
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={isSearching}
              className="px-6 py-3.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[3px] border-[#111111] brutal-btn font-mono text-xs font-black uppercase flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isSearching ? "AUDITING..." : "VERIFY ASSET"}
            </button>
          </div>

          {/* Quick Demo Mode Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#111111]/20 font-mono text-xs">
            <span className="text-gray-700 font-bold uppercase text-[11px]">
              AUDIT COMPARISON SCENARIO:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTestMode('derivative');
                  handleVerify('derivative');
                }}
                className={`px-3 py-1 border-[2px] border-[#111111] font-bold text-[11px] uppercase transition-all ${
                  testMode === 'derivative' ? 'bg-[#D95D5D] text-white shadow-[2px_2px_0px_#111111]' : 'bg-white text-black'
                }`}
              >
                Test Suspicious Derivative
              </button>
              <button
                onClick={() => {
                  setTestMode('original');
                  handleVerify('original');
                }}
                className={`px-3 py-1 border-[2px] border-[#111111] font-bold text-[11px] uppercase transition-all ${
                  testMode === 'original' ? 'bg-[#8BCF9B] text-black shadow-[2px_2px_0px_#111111]' : 'bg-white text-black'
                }`}
              >
                Test Authentic Master
              </button>
            </div>
          </div>

        </div>

        {/* Verification Results Panel */}
        {hasQueried && (
          <div className="bg-white border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8 font-mono">
            
            {/* Top Verification Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-[3px] border-[#111111] gap-4 text-xs font-bold uppercase">
              <div className="flex items-center gap-2">
                <span className="bg-[#111111] text-[#F4CD3F] px-2.5 py-1">
                  QUERY: {queryId}
                </span>
                <span className="text-[#844469]">
                  {DEMO_ASSET.title}
                </span>
              </div>
              <span className="text-gray-500 text-[10px]">
                AUDITED AT {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* The 6 Required Core Verification Badges */}
            <div className="space-y-3 text-xs mb-8">
              
              {/* 1. ORIGINAL ASSET */}
              <div className="p-3 bg-[#F7F3E8] border-[2px] border-[#111111] flex items-center justify-between font-bold">
                <span className="uppercase">ORIGINAL ASSET:</span>
                <span className="text-[#8BCF9B] font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ✓ FOUND
                </span>
              </div>

              {/* 2. PROVENANCE */}
              <div className="p-3 bg-[#F7F3E8] border-[2px] border-[#111111] flex items-center justify-between font-bold">
                <span className="uppercase">PROVENANCE:</span>
                <span className="text-[#8BCF9B] font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ✓ VERIFIED (C2PA v2.1)
                </span>
              </div>

              {/* 3. INTEGRITY */}
              <div className="p-3 bg-[#F7F3E8] border-[2px] border-[#111111] flex items-center justify-between font-bold">
                <span className="uppercase">INTEGRITY:</span>
                <span className={`font-black flex items-center gap-1.5 ${isDerivative ? 'text-[#D95D5D]' : 'text-[#8BCF9B]'}`}>
                  {isDerivative ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      ✗ COMPROMISED
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      ✓ VALID
                    </>
                  )}
                </span>
              </div>

              {/* 4. WATERMARK */}
              <div className="p-3 bg-[#F7F3E8] border-[2px] border-[#111111] flex items-center justify-between font-bold">
                <span className="uppercase">WATERMARK:</span>
                <span className="text-[#8BCF9B] font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ✓ DETECTED (CONFIDENCE: 88%)
                </span>
              </div>

              {/* 5. POST-PROTECTION MODIFICATION */}
              <div className={`p-3 border-[2px] border-[#111111] flex items-center justify-between font-bold ${
                isDerivative ? 'bg-[#D95D5D]/20 text-[#D95D5D]' : 'bg-[#8BCF9B]/20 text-[#8BCF9B]'
              }`}>
                <span className="uppercase text-black">POST-PROTECTION MODIFICATION:</span>
                <span className="font-black flex items-center gap-1.5">
                  {isDerivative ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      ⚠ DETECTED (+320ms PHONEME LAG)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      NONE DETECTED
                    </>
                  )}
                </span>
              </div>

              {/* 6. AI MANIPULATION */}
              <div className={`p-3 border-[2px] border-[#111111] flex items-center justify-between font-bold ${
                isDerivative ? 'bg-[#D95D5D] text-white' : 'bg-[#8BCF9B] text-black'
              }`}>
                <span className="uppercase">AI MANIPULATION:</span>
                <span className="font-black flex items-center gap-1.5">
                  {isDerivative ? (
                    <>
                      🔴 HIGH PROBABILITY (93.0% RISK)
                    </>
                  ) : (
                    <>
                      ✓ PROBABILISTIC CLEAN (&lt;2.0% RISK)
                    </>
                  )}
                </span>
              </div>

            </div>

            {/* Final Prominent Verdict Banner */}
            <div className={`p-6 border-[3px] border-[#111111] brutal-shadow text-center mb-6 ${
              isDerivative ? 'bg-[#D95D5D] text-white' : 'bg-[#8BCF9B] text-black'
            }`}>
              <div className="font-mono text-xs uppercase font-bold tracking-widest mb-1 opacity-90">
                FINAL PROVENANCE DECISION
              </div>
              <div className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight">
                {isDerivative
                  ? "THIS FILE IS NOT THE ORIGINAL PROTECTED VERSION."
                  : "THIS FILE IS THE VERIFIED AUTHENTIC ORIGINAL VERSION."}
              </div>
              <div className="font-mono text-xs mt-2 opacity-90">
                {isDerivative
                  ? "Argos detected alterations after the cryptographic seal was registered: temporal mouth warping and synthetic voice frequencies."
                  : "Cryptographic SHA-256 match and C2PA root manifest confirm zero post-protection tampering."}
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-[#111111]/20 gap-3">
              <Link
                href="/dashboard"
                className="text-xs font-bold text-[#844469] flex items-center gap-1 hover:underline"
              >
                OPEN FULL FORENSICS WORKBENCH →
              </Link>
              <Link
                href="/dashboard/protect"
                className="px-4 py-2 bg-[#F4CD3F] text-black font-bold uppercase text-xs border-[2px] border-[#111111] brutal-btn"
              >
                PROTECT YOUR MEDIA NOW
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
