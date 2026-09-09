'use client';

import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  Flag, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DEMO_ALERTS, DEMO_ASSET } from '@/lib/data';
import { AlertItem } from '@/lib/types';

export default function OwnerAlerts({ 
  onViewEvidence, 
  onOpenReport 
}: { 
  onViewEvidence?: (alert: AlertItem) => void;
  onOpenReport?: (alert: AlertItem) => void;
}) {
  const [alerts, setAlerts] = useState<AlertItem[]>(DEMO_ALERTS);
  const [activeAlert, setActiveAlert] = useState<AlertItem>(DEMO_ALERTS[0]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  return (
    <section id="alerts" className="w-full py-20 px-4 lg:px-8 bg-[#F7F3E8] border-b-[3px] border-[#111111]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b-[3px] border-[#111111] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D95D5D] text-white border-[2px] border-[#111111] font-mono text-xs font-bold uppercase tracking-wider mb-3">
              07 // THREAT DISPATCH & DISCOVERY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#111111] font-display">
              OWNER ALERT CENTER
            </h2>
          </div>
          <p className="font-mono text-xs text-[#111111]/80 max-w-md">
            When derivatives breach forensic integrity thresholds on monitored sources, 
            Argos immediately alerts the rights holder with a cryptographic evidence package.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left 6 Cols: Highlighted HIGH-RISK ALERT Card */}
          <div className="lg:col-span-6 bg-[#EFD99C] border-[4px] border-[#111111] brutal-shadow-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b-[3px] border-[#111111] font-mono text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#D95D5D] font-black uppercase">
                  <span className="w-2.5 h-2.5 bg-[#D95D5D] led-blink-fast" />
                  HIGH-PRIORITY DISPATCH
                </span>
                <span className="bg-[#111111] text-[#F4CD3F] px-2 py-0.5 text-[10px]">
                  ID: {activeAlert.id.toUpperCase()}
                </span>
              </div>

              {/* Alert Title */}
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111] mb-2 font-display">
                {activeAlert.title}
              </h3>
              
              <p className="text-sm font-semibold text-[#111111]/85 mb-6 leading-relaxed">
                "{activeAlert.message}"
              </p>

              {/* Structured Metadata Box */}
              <div className="bg-white border-[2.5px] border-[#111111] p-4 font-mono text-xs space-y-2.5 mb-6 brutal-shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#111111]/70 font-bold uppercase">Target Asset:</span>
                  <span className="font-black text-[#844469]">{activeAlert.assetId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#111111]/70 font-bold uppercase">Confidence Match:</span>
                  <span className="font-black text-[#D95D5D]">94.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#111111]/70 font-bold uppercase">Detected Manipulation:</span>
                  <span className="font-bold text-[#111111]">Face + lip-sync desynchronization</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#111111]/20">
                  <span className="text-[#111111]/70 font-bold uppercase">Discovered On:</span>
                  <span className="font-bold text-[#111111]">{activeAlert.sourceLabel}</span>
                </div>
              </div>
            </div>

            {/* Alert Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t-[2px] border-[#111111]/20">
              <a
                href="#forensics"
                onClick={() => {
                  markAsRead(activeAlert.id);
                  if (onViewEvidence) onViewEvidence(activeAlert);
                }}
                className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                VIEW EVIDENCE
              </a>

              <a
                href="#incident-response"
                onClick={() => {
                  markAsRead(activeAlert.id);
                  if (onOpenReport) onOpenReport(activeAlert);
                }}
                className="px-5 py-2.5 bg-[#D95D5D] hover:bg-[#eb7373] text-white border-[2.5px] border-[#111111] brutal-btn font-mono text-xs font-black flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                REPORT / RESPOND
              </a>
            </div>
          </div>

          {/* Right 6 Cols: Notification History List */}
          <div className="lg:col-span-6 flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between font-mono text-xs font-black uppercase text-[#111111] mb-1">
              <span>ALERT FEED & HISTORY ({alerts.length} ITEMS)</span>
              <span className="text-[10px] text-gray-600">LIVE WEBSOCKET FEED</span>
            </div>

            {alerts.map((item) => {
              const isSelected = activeAlert.id === item.id;
              const isCritical = item.severity === 'critical';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveAlert(item);
                    markAsRead(item.id);
                  }}
                  className={`border-[3px] border-[#111111] p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white shadow-[4px_4px_0px_#111111] translate-x-[-2px] translate-y-[-2px]'
                      : 'bg-[#EFD99C] hover:bg-white shadow-[2px_2px_0px_#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-black text-xs uppercase">
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#D95D5D]" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-600">{item.createdAt}</span>
                  </div>

                  <p className="text-xs text-[#111111]/80 line-clamp-1 mb-2">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#844469] font-bold pt-2 border-t border-[#111111]/15">
                    <span>SOURCE: {item.sourceLabel}</span>
                    <span className="flex items-center gap-1 text-black font-black uppercase">
                      SELECT <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Filter Info */}
            <div className="p-3 bg-white border-[2px] border-[#111111] text-[11px] text-gray-700 flex items-center justify-between">
              <span>Alert thresholds calibrated against Media DNA root hash.</span>
              <span className="text-[#8BCF9B] font-bold">100% DISPATCH INTEGRITY</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
