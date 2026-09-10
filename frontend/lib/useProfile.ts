'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, NotificationPreferences } from '@/lib/types';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/profile');
      if (!res.ok) {
        throw new Error(`Failed to load profile: ${res.statusText}`);
      }
      const data: UserProfile = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to connect to ARGOS profile service.');
      // Fallback state for resilient client rendering
      setProfile({
        user: {
          id: 'usr_demo_01',
          name: 'Lead Forensic Operator',
          email: 'analyst@argos.ai',
          organization: 'ARGOS Sovereign Forensics',
          role: 'analyst',
          created_at: new Date().toISOString(),
          avatar_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=argos_analyst',
        },
        subscription: {
          plan: 'free',
          name: 'ARGOS FREE',
          status: 'active',
          price_inr: 0,
          billing_period: null,
        },
        usage: {
          analyses: 0,
          analysis_limit: 10,
          analyses_remaining: 10,
          protected_assets: 0,
          monitoring_sources: 0,
          incidents: 0,
        },
        features: {
          detection: true,
          deepfake_analysis: true,
          face_lip_analysis: true,
          audio_spectral_analysis: true,
          temporal_sync_analysis: true,
          evidence_frames: true,
          verification: true,
          media_dna: false,
          watermark: false,
          c2pa: false,
          protection_certificate: false,
          monitoring: false,
          derivative_matching: false,
          alerts: false,
          incidents: false,
          advanced_reports: false,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (name: string, organization?: string) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, organization }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to update profile.');
    }
    await fetchProfile();
  };

  const changePassword = async (old_password: string, new_password: string) => {
    const res = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ old_password, new_password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to change password.');
    }
  };

  const updateNotifications = async (prefs: Partial<NotificationPreferences>) => {
    const res = await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to update notification preferences.');
    }
    await fetchProfile();
  };

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
    changePassword,
    updateNotifications,
  };
}
