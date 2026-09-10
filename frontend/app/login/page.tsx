'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle, Key } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8E8E8] flex flex-col justify-center items-center p-4 md:p-8 font-mono">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <ArgosLogo size="lg" />
          </Link>
          <div className="mt-2 text-xs font-black uppercase tracking-widest text-[#844469]">
            SECURE ACCESS GATEWAY
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-6 md:p-8">
          <div className="border-b-[2.5px] border-[#111111] pb-4 mb-6">
            <h1 className="text-xl font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <Lock className="w-5 h-5" />
              SECURE ACCESS
            </h1>
            <p className="text-xs text-[#111111]/80 mt-1">
              Authenticate operator credentials to enter sovereign console.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#F6C6D8] border-[2px] border-[#D95D5D] text-[#D95D5D] text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@agency.gov"
                  className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase tracking-wider text-[#111111]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-[#844469] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                />
                <Key className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] font-black uppercase tracking-wider text-xs brutal-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>AUTHENTICATING KEY...</span>
              ) : (
                <>
                  <span>[ SIGN IN ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-[2.5px] border-[#111111] text-center">
            <div className="text-xs text-[#111111]/80 mb-2">
              Don&apos;t have an account?
            </div>
            <Link
              href={`/signup${redirectPath !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
              className="inline-block w-full py-2.5 bg-[#F8E8E8] hover:bg-[#F6C6D8] text-[#111111] border-[2px] border-[#111111] text-xs font-black uppercase tracking-wider transition-all"
            >
              [ CREATE ACCOUNT ]
            </Link>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="mt-6 text-center text-[10px] text-[#111111]/60 font-bold uppercase flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#8BCF9B]" />
          <span>CRYPTOGRAPHIC IDENTITY ENFORCED // KERNEL 0x88F1</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8E8E8] flex items-center justify-center font-mono text-xs font-bold">
          LOADING ARGOS AUTHENTICATION GATEWAY...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
