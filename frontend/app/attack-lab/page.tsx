'use client';

import React from 'react';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import PageHeader from '@/components/ui/PageHeader';
import AttackLab from '@/components/AttackLab';

export default function AttackLabPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Attack Lab" />
        <div className="p-6 lg:p-8 flex-1 max-w-[1440px] w-full mx-auto">
          <AttackLab />
        </div>
      </div>
    </div>
  );
}
