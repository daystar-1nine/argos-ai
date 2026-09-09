'use client';

import React from 'react';
import Link from 'next/link';
import DeepfakeForensics from '@/components/DeepfakeForensics';

export default function LandingDetection() {
  return (
    <div id="detection-section">
      <DeepfakeForensics />
    </div>
  );
}
