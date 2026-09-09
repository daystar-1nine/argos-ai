'use client';

import React from 'react';
import Header from '@/components/Header';
import LiveStatusStrip from '@/components/LiveStatusStrip';
import PublicVerify from '@/components/PublicVerify';
import Footer from '@/components/Footer';

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F7F3E8]">
      <Header />
      <LiveStatusStrip />
      <div className="flex-1">
        <PublicVerify />
      </div>
      <Footer />
    </main>
  );
}
