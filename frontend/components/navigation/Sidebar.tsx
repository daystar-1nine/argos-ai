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
  ChevronRight,
  User,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, plan, logout } = useAuth();


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
    { href: '/profile', label: 'My Profile', icon: User },
    { href: '/pricing', label: 'Plans & Pricing', icon: Sparkles },
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

        {/* Operator Profile Badge */}
        <div className="p-2.5 bg-white border-[2px] border-[#111111] block shadow-[2px_2px_0px_#111111]">
          <div className="flex items-center gap-2.5">
            <Link href="/profile" className="w-8 h-8 rounded-full border-[1.5px] border-[#111111] bg-[#EFD99C] overflow-hidden shrink-0 hover:opacity-80">
              <img
                src={user?.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=argos'}
                alt="Operator Avatar"
                className="w-full h-full object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href="/profile" className="text-xs font-black truncate text-[#111111] hover:text-[#844469] block">
                {user?.name || 'Lead Operator'}
              </Link>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 border-[1px] border-[#111111] ${
                  plan === 'pro'
                    ? 'bg-[#F4CD3F] text-[#111111]'
                    : 'bg-[#EFD99C] text-gray-800'
                }`}>
                  {plan === 'pro' ? 'ARGOS PRO' : 'ARGOS FREE'}
                </span>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="text-[10px] text-[#D95D5D] font-bold hover:underline flex items-center gap-0.5"
                >
                  <LogOut className="w-3 h-3" />
                  EXIT
                </button>
              </div>
            </div>
          </div>
        </div>


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
