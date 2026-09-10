'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { Shield, UserPlus, Mail, Lock, Key, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side validation states
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLength || !hasUppercase || !hasDigit) {
      setError('Password must be at least 8 characters long, contain an uppercase letter and a number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the ARGOS Forensic Operating Terms.');
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password, confirmPassword, termsAccepted);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize account.');
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
            OPERATOR ONBOARDING PROTOCOL
          </div>
        </div>

        {/* Signup Card */}
        <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-6 md:p-8">
          <div className="border-b-[2.5px] border-[#111111] pb-4 mb-6">
            <h1 className="text-xl font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              CREATE YOUR ACCOUNT
            </h1>
            <p className="text-xs text-[#111111]/80 mt-1">
              Automatic provisioning of <span className="font-bold text-[#844469]">ARGOS FREE</span> with full ML detection.
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
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent John Doe"
                className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
              />
            </div>

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
              <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                />
                <Key className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
              </div>

              {/* Password complexity hints */}
              <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] font-bold">
                <div className={`p-1 border-[1.5px] text-center ${hasMinLength ? 'bg-[#8BCF9B] border-[#111111] text-black' : 'bg-white border-gray-400 text-gray-500'}`}>
                  8+ CHARS
                </div>
                <div className={`p-1 border-[1.5px] text-center ${hasUppercase ? 'bg-[#8BCF9B] border-[#111111] text-black' : 'bg-white border-gray-400 text-gray-500'}`}>
                  1 UPPERCASE
                </div>
                <div className={`p-1 border-[1.5px] text-center ${hasDigit ? 'bg-[#8BCF9B] border-[#111111] text-black' : 'bg-white border-gray-400 text-gray-500'}`}>
                  1 NUMBER
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                />
                {passwordsMatch && (
                  <CheckCircle className="w-4 h-4 text-[#8BCF9B] absolute right-3 top-3" />
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 border-[2px] border-[#111111] accent-[#F4CD3F]"
              />
              <label htmlFor="terms" className="text-[11px] text-[#111111]/90 font-bold leading-tight">
                I accept the ARGOS Digital Forensics Terms & C2PA Provenance Framework.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] font-black uppercase tracking-wider text-xs brutal-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>INITIALIZING OPERATOR LEDGER...</span>
              ) : (
                <>
                  <span>[ CREATE FREE ACCOUNT ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-[2.5px] border-[#111111] text-center">
            <div className="text-xs text-[#111111]/80 mb-2">
              Already have an account?
            </div>
            <Link
              href={`/login${redirectPath !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
              className="inline-block w-full py-2.5 bg-[#F8E8E8] hover:bg-[#F6C6D8] text-[#111111] border-[2px] border-[#111111] text-xs font-black uppercase tracking-wider transition-all"
            >
              [ SIGN IN ]
            </Link>
          </div>
        </div>

        {/* Telemetry Footer */}
        <div className="mt-6 text-center text-[10px] text-[#111111]/60 font-bold uppercase flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#8BCF9B]" />
          <span>ZERO STORED PLAINTEXT PASSWORDS // BCRYPT-SALTED MATRIX</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8E8E8] flex items-center justify-center font-mono text-xs font-bold">
          LOADING ARGOS REGISTRATION PROTOCOL...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
