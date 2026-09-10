'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProFeatureGate from '@/components/ui/ProFeatureGate';
import { Shield, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requirePro?: boolean;
  feature?: string;
  featureTitle?: string;
  featureDescription?: string;
}

export default function AuthGuard({
  children,
  requirePro = false,
  feature,
  featureTitle,
  featureDescription,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, plan, hasFeature } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // Auth Loading State (Prevents flash of protected content or login screen)
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 font-mono select-none">
        <div className="p-8 bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow-lg max-w-md w-full text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F4CD3F] border-[2.5px] border-[#111111] flex items-center justify-center rounded-full animate-pulse shadow-[3px_3px_0px_#111111]">
            <Shield className="w-8 h-8 text-[#111111]" />
          </div>
          <div className="text-sm font-black uppercase text-[#111111] tracking-wider mb-2">
            AUTHENTICATING SESSION
          </div>
          <div className="text-xs text-[#844469] font-bold mb-4">
            VERIFYING OPERATOR CRYPTOGRAPHIC KEY // MATRIX 0x88F1
          </div>
          <div className="w-full bg-[#F8E8E8] border-[2px] border-[#111111] h-3 overflow-hidden">
            <div className="h-full bg-[#111111] animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, return loading indicator while redirect executes
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs font-bold text-[#844469]">
        REDIRECTING TO SECURE LOGIN...
      </div>
    );
  }

  // Pro feature check: if route requires Pro and user is Free, show ProFeatureGate
  const isFeatureAllowed = feature ? hasFeature(feature) : (requirePro ? plan === 'pro' : true);
  if (!isFeatureAllowed) {
    return (
      <div className="p-4 md:p-8">
        <ProFeatureGate
          featureTitle={featureTitle || (feature ? feature.replace(/_/g, ' ').toUpperCase() : 'ARGOS PRO SUITE')}
          featureDescription={featureDescription || 'This capability is exclusively reserved for ARGOS PRO operators. Upgrade your subscription to unlock active media shielding, automated platform monitoring, and legal response.'}
        />
      </div>
    );
  }


  return <>{children}</>;
}
