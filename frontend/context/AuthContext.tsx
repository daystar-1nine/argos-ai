'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
  role: string;
  organization?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  plan: 'free' | 'pro';
  subscriptionStatus: string;
  features: Record<string, boolean>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword?: string, termsAccepted?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active');
  const [features, setFeatures] = useState<Record<string, boolean>>({});

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (!res.ok) {
        setUser(null);
        setIsAuthenticated(false);
        setPlan('free');
        setFeatures({});
        return;
      }

      const data = await res.json();
      if (data.authenticated && data.user) {
        const u = data.user;
        setUser(u);
        setIsAuthenticated(true);
        const userPlan = (u.plan === 'pro' ? 'pro' : 'free') as 'free' | 'pro';
        setPlan(userPlan);

        // Fetch user feature flags for UI gating
        try {
          const featRes = await fetch('/api/subscription/features', {
            headers: { 'Accept': 'application/json' },
            credentials: 'include',
          });
          if (featRes.ok) {
            const featData = await featRes.json();
            setFeatures(featData.features || {});
            setSubscriptionStatus(featData.status || 'active');
          }
        } catch {
          // Fallback feature map based on verified plan
          if (userPlan === 'pro') {
            setFeatures({
              video_analysis: true,
              audio_analysis: true,
              lip_sync_detection: true,
              media_dna: true,
              invisible_watermark: true,
              c2pa_credentials: true,
              continuous_monitoring: true,
              derivative_detection: true,
              incident_response: true,
              takedown_generator: true,
              advanced_reports: true,
            });
          } else {
            setFeatures({
              video_analysis: true,
              audio_analysis: true,
              lip_sync_detection: true,
              confidence_scoring: true,
              evidence_keyframes: true,
              analysis_history: true,
              basic_verification: true,
              media_dna: false,
              invisible_watermark: false,
              c2pa_credentials: false,
              continuous_monitoring: false,
              derivative_detection: false,
              incident_response: false,
              takedown_generator: false,
              advanced_reports: false,
            });
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setPlan('free');
        setFeatures({});
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      setPlan('free');
      setFeatures({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Invalid email or password.');
    }

    await refreshUser();
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    termsAccepted?: boolean
  ) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name,
        email,
        password,
        confirm_password: confirmPassword,
        terms_accepted: termsAccepted ?? true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to create account.');
    }

    await refreshUser();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout request warning:', e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPlan('free');
      setFeatures({});
      router.push('/');
    }
  };

  const logoutAll = async () => {
    try {
      await fetch('/api/auth/logout-all', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout-all request warning:', e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setPlan('free');
      setFeatures({});
      router.push('/');
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (plan === 'pro') return true;
    return !!features[feature];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        plan,
        subscriptionStatus,
        features,
        login,
        signup,
        logout,
        logoutAll,
        refreshUser,
        hasFeature,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
