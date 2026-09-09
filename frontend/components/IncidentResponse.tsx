'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  FileCheck2, 
  Archive, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  FileText,
  Send,
  Copy,
  Check
} from 'lucide-react';
import { DEMO_INCIDENT, DEMO_ASSET, DEMO_DNA } from '@/lib/data';

export default function IncidentResponse({ onOpenReportModal }: { onOpenReportModal?: () => void }) {
  const [reportingFlowOpen, setReportingFlowOpen] = useState(false);
  const [evidencePackDownloading, setEvidencePackDownloading] = useState(false);
  const [evidencePackReady, setEvidencePackReady] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('X (Formerly Twitter)');
  const [copiedNotice, setCopiedNotice] = useState(false);

  const incident = DEMO_INCIDENT;

  const downloadEvidencePack = () => {
    setEvidencePackDownloading(true);
    setTimeout(() => {
      setEvidencePackDownloading(false);
      setEvidencePackReady(true);
      // Trigger a real file download in browser
      const blob = new Blob([
        `ARGOS AI INCIDENT EVIDENCE PACK\nCase: #${incident.id}\nAsset: ${incident.assetId}\nRoot Hash: ${DEMO_DNA.sha256Hash}\n` +
        `Manipulation Verdict: ${incident.manipulationVerdict}\nEvidence Count: 12 Frames, 1 Waveform, 3 Graphs\nTimestamp: ${new Date().toISOString()}`
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ARGOS_EVIDENCE_PACK_${incident.id}.txt`;
      a.click();
    }, 1200);
  };

  const sampleNoticeText = `================================================================================
ARGOS AI FORMAL FORENSIC TAKEDOWN NOTICE // 17 U.S.C. § 512(c) & EU DSA ART. 16
CASE REF: #${incident.id} | ASSET ID: ${incident.assetId}
================================================================================

TO: Designated Copyright & Trust/Safety Agent of ${selectedPlatform}
FROM: Authorized Rights Holder via ARGOS AI Sovereign Media Defender

1. ORIGINAL REGISTERED ASSET:
   - ID: ${incident.assetId}
   - Provenance Standard: C2PA v2.1 Claim Manifest urn:c2pa:8a92f1-4402-99ab-2026
   - Cryptographic Media DNA SHA-256: ${DEMO_DNA.sha256Hash}

2. INFRINGING & MANIPULATED DERIVATIVE:
   - Suspect URL: ${incident.suspectUrl}
   - Anomaly Classification: Deepfake speech replacement + temporal mouth warp (+320ms lag)
   - Neural Model Consensus: 4/4 models agree on high-risk synthetic tampering (93.0% confidence)

3. EVIDENCE PACK ATTACHED:
   - 12 high-resolution forensic frame delta exhibits
   - Spectral vocoder audio anomaly graph
   - Cryptographic proof of origin and spread-spectrum watermark match

4. SWORN STATEMENT:
   I have a good-faith belief that the use of the material complained of is not authorized 
   by the copyright owner, its agent, or the law.

Submitted via ARGOS AI Incident Response System.
Verification URL: https://argos-ai.defense/verify?id=${incident.assetId}`;

  const copyNotice = () => {
    navigator.clipboard.writeText(sampleNoticeText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <section id="incident-response" className="w-full py-20 px-4 lg:px-8 bg-[#EFD99C] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] text-[#F4CD3F] border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-3">
              08 // ENFORCEMENT & PLATFORM REMEDIATION
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
              TAKEDOWN & RESPONSE CENTER
            </h2>
          </div>
          
          {/* Honest Wording Box */}
          <div className="p-3 bg-white border-[2.5px] border-[#111111] font-mono text-xs max-w-md brutal-shadow-sm">
            <span className="font-black text-[#844469] block mb-0.5">DISCLAIMER & SCOPE:</span>
            <span className="text-[#111111]/80 leading-relaxed">
              "Argos assists users with evidence and reporting workflows. We do not claim guaranteed automatic deletion from every platform."
            </span>
          </div>
        </div>

        {/* Case File Box */}
        <div className="bg-[#F7F3E8] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8">
          
          {/* Case Header */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b-[3px] border-[#111111] gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="bg-[#844469] text-white font-black text-sm px-3 py-1">
                CASE #{incident.id}
              </span>
              <span className="font-black text-[#111111] text-sm">
                {incident.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-[#F4CD3F] text-black font-bold px-2 py-0.5 border border-black">
                STATUS: {incident.status.toUpperCase()}
              </span>
              <span className="text-gray-600">OPENED: 3 HOURS AGO</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 6 Cols: Verification & Forensic Findings */}
            <div className="lg:col-span-6 flex flex-col gap-4 font-mono">
              
              <div className="bg-white border-[3px] border-[#111111] p-5 brutal-shadow-sm">
                <div className="text-xs font-black uppercase text-[#111111] mb-3 pb-2 border-b border-[#111111]/20">
                  SOVEREIGN PROVENANCE & AUDIT CHECK:
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 bg-[#F7F3E8] border border-[#111111]">
                    <span className="font-bold">Original asset:</span>
                    <span className="font-black text-[#8BCF9B] flex items-center gap-1">
                      ✓ {incident.originalAssetStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#F7F3E8] border border-[#111111]">
                    <span className="font-bold">Provenance:</span>
                    <span className="font-black text-[#8BCF9B] flex items-center gap-1">
                      ✓ {incident.provenanceStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#F7F3E8] border border-[#111111]">
                    <span className="font-bold">Media DNA:</span>
                    <span className="font-black text-[#8BCF9B] flex items-center gap-1">
                      ✓ {incident.mediaDnaStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#D95D5D]/20 border border-[#D95D5D]">
                    <span className="font-bold text-[#111111]">Manipulation:</span>
                    <span className="font-black text-[#D95D5D] flex items-center gap-1">
                      🔴 {incident.manipulationVerdict}
                    </span>
                  </div>
                </div>
              </div>

              {/* Evidence Inventory */}
              <div className="bg-white border-[3px] border-[#111111] p-5 brutal-shadow-sm">
                <div className="text-xs font-black uppercase text-[#111111] mb-3 pb-2 border-b border-[#111111]/20 flex items-center justify-between">
                  <span>ASSEMBLED EVIDENCE INVENTORY</span>
                  <span className="text-[#844469]">CHAIN OF CUSTODY</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-[#EFD99C] border border-[#111111]">
                    <div className="text-2xl font-black font-display text-[#111111]">12</div>
                    <div className="text-[10px] uppercase font-bold text-gray-700 mt-1">
                      Evidence Frames
                    </div>
                  </div>

                  <div className="p-3 bg-[#EFD99C] border border-[#111111]">
                    <div className="text-2xl font-black font-display text-[#111111]">1</div>
                    <div className="text-[10px] uppercase font-bold text-gray-700 mt-1">
                      Audio Waveform
                    </div>
                  </div>

                  <div className="p-3 bg-[#EFD99C] border border-[#111111]">
                    <div className="text-2xl font-black font-display text-[#111111]">3</div>
                    <div className="text-[10px] uppercase font-bold text-gray-700 mt-1">
                      Analysis Graphs
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-gray-600">
                  Target Derivative: <a href={incident.suspectUrl} target="_blank" rel="noreferrer" className="text-[#844469] font-bold underline break-all">{incident.suspectUrl}</a>
                </div>
              </div>

            </div>

            {/* Right 6 Cols: Action Triggers & Reporting Workflow Drawer */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full font-mono">
              
              <div className="bg-white border-[3px] border-[#111111] p-5 brutal-shadow-sm mb-6">
                <div className="text-xs font-black uppercase text-[#111111] mb-4 pb-2 border-b border-[#111111]/20">
                  CASE REMEDIATION ACTIONS:
                </div>

                {/* The 3 Core Required Action Buttons */}
                <div className="flex flex-col gap-3">
                  
                  {/* Button 1: GENERATE EVIDENCE PACK */}
                  <button
                    onClick={downloadEvidencePack}
                    disabled={evidencePackDownloading}
                    className="w-full py-3 px-4 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      [ GENERATE EVIDENCE PACK ]
                    </span>
                    <span className="text-[10px] bg-black text-white px-2 py-0.5">
                      {evidencePackDownloading ? "COMPILING ZIP..." : evidencePackReady ? "DOWNLOADED ✓" : ".ZIP DOSSIER"}
                    </span>
                  </button>

                  {/* Button 2: GENERATE REPORT */}
                  <button
                    onClick={onOpenReportModal || (() => {
                      const el = document.getElementById('forensic-report-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    })}
                    className="w-full py-3 px-4 bg-[#EFD99C] hover:bg-[#f5e3b5] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      [ GENERATE REPORT ]
                    </span>
                    <span className="text-[10px] bg-[#844469] text-white px-2 py-0.5">
                      OFFICIAL PDF DOSSIER
                    </span>
                  </button>

                  {/* Button 3: OPEN REPORTING FLOW */}
                  <button
                    onClick={() => setReportingFlowOpen(!reportingFlowOpen)}
                    className="w-full py-3 px-4 bg-[#844469] hover:bg-[#99537c] text-white border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      [ OPEN REPORTING FLOW ]
                    </span>
                    <span className="text-[10px] bg-[#F4CD3F] text-black px-2 py-0.5">
                      {reportingFlowOpen ? "COLLAPSE NOTICE" : "DMCA / DSA TEMPLATE"}
                    </span>
                  </button>

                </div>
              </div>

              {/* Reporting Flow Notice Generator Panel */}
              {reportingFlowOpen && (
                <div className="bg-[#111111] text-[#EFD99C] border-[3px] border-[#111111] p-5 brutal-shadow-lg font-mono text-xs animate-in fade-in">
                  
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/20">
                    <span className="font-bold text-[#F4CD3F] uppercase">
                      ASSISTED REPORTING NOTICE GENERATOR
                    </span>
                    <button
                      onClick={copyNotice}
                      className="px-2.5 py-1 bg-[#F4CD3F] text-black font-bold uppercase text-[10px] flex items-center gap-1 hover:bg-white"
                    >
                      {copiedNotice ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedNotice ? "COPIED" : "COPY NOTICE"}
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="text-[10px] text-white/70 uppercase block mb-1">
                      SELECT TARGET PLATFORM AGENT:
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="w-full bg-black text-[#EFD99C] border border-white/40 p-1.5 text-xs font-bold"
                    >
                      <option value="X (Formerly Twitter) Trust & Safety">X (Public Relay)</option>
                      <option value="YouTube / Google Legal Copyright Operations">YouTube (Public Index)</option>
                      <option value="TikTok / ByteDance Intellectual Property Agent">TikTok (Indexed Mirror)</option>
                      <option value="Reddit Inc. Copyright & Integrity Team">Reddit (Public Forum)</option>
                      <option value="Meta (Instagram/Threads) Rights Division">Meta Platforms</option>
                      <option value="Generic Hosting Provider / Cloudflare Abuse">Web Host / ISP Abuse Desk</option>
                    </select>
                  </div>

                  <div className="bg-black/90 p-3 border border-white/20 text-[10px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap text-white/90">
                    {sampleNoticeText}
                  </div>

                  <div className="mt-3 text-[10px] text-[#F4CD3F]">
                    Notice includes C2PA v2.1 signature manifest and root Media DNA hash for instantaneous platform trust agent verification.
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
