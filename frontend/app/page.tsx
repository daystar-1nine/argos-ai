'use client';

import React from 'react';
import Header from '@/components/Header';
import LiveStatusStrip from '@/components/LiveStatusStrip';
import HeroCRT from '@/components/HeroCRT';
import BentoGrid from '@/components/BentoGrid';
import AuthenticityGate from '@/components/AuthenticityGate';
import MediaDNAVisualizer from '@/components/MediaDNAVisualizer';
import AttackLab from '@/components/AttackLab';
import DeepfakeForensics from '@/components/DeepfakeForensics';
import GlobalWatch from '@/components/GlobalWatch';
import OwnerAlerts from '@/components/OwnerAlerts';
import IncidentResponse from '@/components/IncidentResponse';
import ForensicReportSection from '@/components/ForensicReportModal';
import ProtectionWorkflow from '@/components/ProtectionWorkflow';
import Footer from '@/components/Footer';

export default function Home() {
  const scrollToProtect = () => {
    const el = document.getElementById('protect-workflow');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#F7F3E8]">
      {/* 1. Global Navigation Bar */}
      <Header />

      {/* 2. Live System Status Strip */}
      <LiveStatusStrip />

      {/* 3. Grand Hero with Retro CRT Monitor */}
      <HeroCRT onProtectClick={scrollToProtect} />

      {/* 4. The 8-Pillar Bento Lifecycle Grid */}
      <BentoGrid />

      {/* 5. Authenticity Gate (Before we protect it, we verify it) */}
      <AuthenticityGate onProceedToProtect={scrollToProtect} />

      {/* 6. Interactive Media DNA Particle Visualizer */}
      <MediaDNAVisualizer />

      {/* 7. Attack Lab (Interactive WOW Feature) */}
      <AttackLab />

      {/* 8. Deepfake Forensics & Explainable AI */}
      <DeepfakeForensics />

      {/* 9. Argos Global Watch (Supported Indexed Sources) */}
      <GlobalWatch />

      {/* 10. Owner Alert Center */}
      <OwnerAlerts />

      {/* 11. Incident Response & Takedown Center */}
      <IncidentResponse />

      {/* 12. Forensic Report PDF Dossier Section */}
      <ForensicReportSection />

      {/* 13. 5-Stage Protection Workflow */}
      <ProtectionWorkflow />

      {/* 14. Footer with Legal Disclaimer */}
      <Footer />
    </main>
  );
}
