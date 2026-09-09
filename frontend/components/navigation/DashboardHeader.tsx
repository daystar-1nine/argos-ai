'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Plus, ExternalLink, Terminal } from 'lucide-react';

export default function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const pathname = usePathname();
  const pathSegment = pathname.split('/')[1] || 'dashboard';

  return (
    <header className="w-full bg-[#111111] text-[#EFD99C] px-6 py-3 border-b-[3px] border-[#111111] flex flex-wrap items-center justify-between gap-4 font-mono text-xs z-20">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2">
        <span className="text-[#F4CD3F] font-bold uppercase">ARGOS //</span>
        <span className="text-[#F6C6D8] font-bold uppercase">{pathSegment}</span>
        {title && (
          <>
            <span className="text-white/40">/</span>
            <span className="text-white font-black truncate">{title}</span>
          </>
        )}
      </div>

      {/* Right Telemetry & Actions */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#8BCF9B] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#8BCF9B] led-blink" />
          5 MONITORING NODES ACTIVE
        </span>

        <Link
          href="/protect"
          className="px-3 py-1.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border border-black font-black uppercase text-xs brutal-btn flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Protect Media
        </Link>

        <Link
          href="/verify"
          className="px-3 py-1.5 bg-[#F6C6D8] hover:bg-[#ffb3cc] text-[#111111] border border-black font-bold uppercase text-xs brutal-btn flex items-center gap-1"
        >
          <Shield className="w-3.5 h-3.5" />
          Public Verify
        </Link>
      </div>
    </header>
  );
}
