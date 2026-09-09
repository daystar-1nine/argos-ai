'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import IncidentResponse from '@/components/IncidentResponse';
import { ArrowLeft } from 'lucide-react';

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = (params.incidentId as string) || 'ARG-8291';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title={`Case // #${incidentId}`} />

        <div className="p-6 lg:p-8 space-y-6 flex-1 max-w-[1440px] w-full mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-[#844469]">
            <Link href="/incidents" className="flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents List
            </Link>
          </div>

          <IncidentResponse />
        </div>
      </div>
    </div>
  );
}
