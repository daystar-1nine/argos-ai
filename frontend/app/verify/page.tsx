'use client';

import React from 'react';
import Navbar from '@/components/navigation/Navbar';
import PublicVerify from '@/components/PublicVerify';
import Footer from '@/components/navigation/Footer';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8E8E8] text-[#111111]">
      <Navbar />
      <div className="flex-1">
        <PublicVerify />
      </div>
      <Footer />
    </div>
  );
}
