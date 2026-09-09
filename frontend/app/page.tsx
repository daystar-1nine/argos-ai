'use client';

import React from 'react';
import Navbar from '@/components/navigation/Navbar';
import LiveStatusStrip from '@/components/LiveStatusStrip';
import LandingHero from '@/components/landing/LandingHero';
import LandingProblem from '@/components/landing/LandingProblem';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingProtection from '@/components/landing/LandingProtection';
import LandingMediaDNA from '@/components/landing/LandingMediaDNA';
import LandingDetection from '@/components/landing/LandingDetection';
import LandingGlobalWatch from '@/components/landing/LandingGlobalWatch';
import LandingAttackLab from '@/components/landing/LandingAttackLab';
import LandingAlerts from '@/components/landing/LandingAlerts';
import LandingEvidence from '@/components/landing/LandingEvidence';
import LandingTakedown from '@/components/landing/LandingTakedown';
import LandingVerification from '@/components/landing/LandingVerification';
import LandingTechStack from '@/components/landing/LandingTechStack';
import LandingCTA from '@/components/landing/LandingCTA';
import Footer from '@/components/navigation/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8E8E8] text-[#111111]">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* Network Status Terminal Bar */}
      <LiveStatusStrip />

      {/* 2. Hero with Y2K CRT Comparative Monitor */}
      <LandingHero />

      {/* 3. The Problem */}
      <LandingProblem />

      {/* 4. How Argos Works (8-Step Lifecycle) */}
      <LandingHowItWorks />

      {/* 5. Protection (Authenticity Gate & Watermark) */}
      <LandingProtection />

      {/* 6. Media DNA (Particle Double-Helix Visualizer) */}
      <LandingMediaDNA />

      {/* 7. Deepfake Detection & Explainable AI */}
      <LandingDetection />

      {/* 8. Global Monitoring (Argos Global Watch) */}
      <LandingGlobalWatch />

      {/* 9. Attack Lab (Stress Test Simulation) */}
      <LandingAttackLab />

      {/* 10. Alerts Dispatch Center */}
      <LandingAlerts />

      {/* 11. Forensic Evidence & Dossier */}
      <LandingEvidence />

      {/* 12. Takedown & Incident Response */}
      <LandingTakedown />

      {/* 13. Public Verification */}
      <LandingVerification />

      {/* 14. Technology & Architecture */}
      <LandingTechStack />

      {/* 15. Final Call to Action */}
      <LandingCTA />

      {/* 16. Footer with Legal Disclaimer */}
      <Footer />
    </div>
  );
}
