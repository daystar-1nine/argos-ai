'use client';

import React from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import BrutalistCard from '@/components/ui/BrutalistCard';
import { HelpCircle, BookOpen, ShieldCheck, Scale, Cpu, Search, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  const docs = [
    {
      title: "1. The 8-Stage Protection Lifecycle",
      desc: "Argos operates on an unbroken chain of custody: Protect -> Prove -> Monitor -> Detect -> Explain -> Alert -> Respond -> Verify. Learn how each stage enforces media sovereignty.",
      tag: "CORE LIFECYCLE"
    },
    {
      title: "2. Spread-Spectrum Watermark vs. C2PA",
      desc: "C2PA manifests provide legal hardware-signed provenance assertions. Spread-spectrum watermarking acts as an invisible cryptographic anchor that survives aggressive transcoding and cropping.",
      tag: "CRYPTOGRAPHY"
    },
    {
      title: "3. SyncNet Audio-Visual Forensic Physics",
      desc: "Our neural ensemble measures phoneme-to-viseme temporal synchrony. When audio vowel formants occur while mouth lips are closed, neural desync (>100ms) flags synthetic tampering.",
      tag: "FORENSICS"
    },
    {
      title: "4. Supported Public Source Scope",
      desc: "Argos continuously monitors supported public, indexed and integrated sources. We never claim to scan the private web or promise automated instant deletion without platform review.",
      tag: "MONITORING"
    },
    {
      title: "5. DMCA 512(c) & EU DSA Article 16 Takedown Notices",
      desc: "How to use Argos-generated forensic dossiers to demand takedowns from platform trust & safety agents with non-repudiable proof of origin.",
      tag: "LEGAL WORKFLOWS"
    },
    {
      title: "6. Public Verification API & Ledger",
      desc: "How external journalists and platforms query the sovereign ledger by Asset ID or SHA-256 to verify whether an asset is authentic or modified.",
      tag: "API INTEGRATION"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Documentation & Help" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          <PageHeader
            badge="KNOWLEDGE BASE"
            badgeColor="mauve"
            title="DOCUMENTATION & HELP"
            subtitle="Learn the technical architectures, cryptographic standards, forensic neural models, and legal takedown workflows behind Argos AI."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((d, i) => (
              <div
                key={i}
                className="bg-white border-[3px] border-[#111111] brutal-shadow p-6 flex flex-col justify-between hover:translate-x-[-2px] transition-all"
              >
                <div>
                  <span className="text-[10px] font-black uppercase bg-[#F6C6D8] text-[#111111] px-2 py-0.5 border border-black inline-block mb-3">
                    {d.tag}
                  </span>
                  <h3 className="font-black text-base text-[#111111] font-display uppercase tracking-tight mb-2">
                    {d.title}
                  </h3>
                  <p className="font-mono text-xs text-gray-700 leading-relaxed">
                    {d.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 text-xs font-bold text-[#844469] flex items-center gap-1">
                  <span>READ ARCHITECTURE SPEC →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact / Help Desk Box */}
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-6 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-black text-sm uppercase text-[#111111]">
                NEED FORENSIC EXPERT CONSULTATION?
              </div>
              <div className="text-gray-700 mt-0.5">
                Our cyber forensics team assists high-profile creators and enterprise media rooms with urgent takedown escalations.
              </div>
            </div>

            <Link
              href="/incidents"
              className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-black font-black uppercase border-[2px] border-black brutal-btn shrink-0"
            >
              Open Incident Ticket
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
