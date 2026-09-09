'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Plus, ExternalLink, Terminal, RefreshCw } from 'lucide-react';
import ArgosLoader from '@/components/ui/ArgosLoader';

export default function DashboardHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [rebooting, setRebooting] = useState(false);
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

        <button
          onClick={() => setRebooting(true)}
          className="px-2.5 py-1.5 bg-[#844469] hover:bg-[#9e547f] text-[#EFD99C] border border-black font-bold uppercase text-xs brutal-btn flex items-center gap-1 cursor-pointer"
          title="Reboot Forensic Matrix"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reboot</span>
        </button>
      </div>

      {rebooting && (
        <ArgosLoader 
          variant="initial" 
          forceShow={true} 
          onComplete={() => setRebooting(false)} 
        />
      )}
    </header>
  );
}

