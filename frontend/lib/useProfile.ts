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
      const res = await fetch('/api/profile', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      // 401 Unauthorized indicates unauthenticated visitor / expired session
      // This is an expected normal state, not an unhandled console error
      if (res.status === 401) {
        setProfile(null);
        setError(null);
        return;
      }

      if (!res.ok) {
        throw new Error(`Profile service returned ${res.status}: ${res.statusText}`);
      }

      const data: UserProfile = await res.json();
      setProfile(data);
      setError(null);
    } catch (err: any) {
      if (err?.message?.includes('Unauthorized')) {
        setProfile(null);
        setError(null);
        return;
      }
      console.warn('Profile fetch notice:', err?.message || err);
      setError(err?.message || 'Failed to connect to ARGOS profile service.');
      setProfile(null);
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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, organization }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.detail || 'Failed to update profile.');
    }
    await fetchProfile();
  };

  const changePassword = async (old_password: string, new_password: string) => {
    const res = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ old_password, new_password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.detail || 'Failed to change password.');
    }
  };

  const updateNotifications = async (prefs: Partial<NotificationPreferences>) => {
    const res = await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(prefs),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || err.detail || 'Failed to update notification preferences.');
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
