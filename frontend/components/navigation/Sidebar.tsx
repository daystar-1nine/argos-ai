'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { 
  LayoutDashboard, 
  Film, 
  ShieldCheck, 
  Globe, 
  Eye, 
  Zap, 
  Bell, 
  Scale, 
  FileText, 
  Search, 
  Award, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const mainLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/media', label: 'My Media', icon: Film },
    { href: '/protect', label: 'Protect', icon: ShieldCheck },
    { href: '/monitor', label: 'Monitor', icon: Globe },
    { href: '/detections', label: 'Detections', icon: Eye },
    { href: '/attack-lab', label: 'Attack Lab', icon: Zap },
    { href: '/alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { href: '/incidents', label: 'Incidents', icon: Scale },
    { href: '/reports', label: 'Reports', icon: FileText },
    { href: '/certificates', label: 'Certificates', icon: Award },
    { href: '/verify', label: 'Verify', icon: Search },
  ];

  const bottomLinks = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help & Docs', icon: HelpCircle },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#EFD99C] border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#111111] p-4 flex flex-col justify-between shrink-0 font-mono">
      <div>
        {/* Brand Header */}
        <div className="pb-4 mb-4 border-b-[2.5px] border-[#111111]">
          <Link href="/" className="hover:opacity-90 transition-opacity block">
            <ArgosLogo size="sm" />
          </Link>
        </div>

        {/* Section Label */}
        <div className="text-[10px] font-black uppercase text-[#111111]/60 px-2 mb-2">
          FORENSIC WORKBENCH
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          {mainLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 border-[2px] border-[#111111] text-xs font-bold uppercase transition-all ${
                  isActive
                    ? 'bg-[#111111] text-[#F4CD3F] shadow-[3px_3px_0px_#844469] translate-x-[2px]'
                    : 'bg-[#F8E8E8] hover:bg-[#F6C6D8] text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#D95D5D] text-white text-[9px] font-black px-1.5 py-0.2">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings & User Box */}
      <div className="pt-6 border-t-[2.5px] border-[#111111] mt-6 space-y-3">
        <nav className="space-y-1">
          {bottomLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-1.5 border-[2px] border-[#111111] text-xs font-bold uppercase transition-all ${
                  isActive
                    ? 'bg-[#111111] text-[#F4CD3F]'
                    : 'bg-[#F8E8E8] hover:bg-[#F6C6D8] text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-2.5 bg-white border-[2px] border-[#111111] text-[10px]">
          <div className="font-bold text-[#844469]">C2PA SIGNING AGENT</div>
          <div className="font-black text-black text-xs">did:argos:sig-7b2f</div>
          <div className="text-[#8BCF9B] font-bold mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8BCF9B] led-blink" />
            LEDGER SYNCED
          </div>
        </div>
      </div>
    </aside>
  );
}
