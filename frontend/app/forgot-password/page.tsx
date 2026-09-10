'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { KeyRound, Mail, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);
    setIsConfigError(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error?.code === 'EMAIL_PROVIDER_NOT_CONFIGURED') {
          setIsConfigError(true);
          setError(data.error.message);
        } else {
          setError(data.error?.message || 'Failed to dispatch reset request.');
        }
      } else {
        setStatusMessage(data.message || 'If an account exists with this address, password reset instructions have been dispatched.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error communicating with recovery matrix.');
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
            CREDENTIAL RECOVERY MATRIX
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-6 md:p-8">
          <div className="border-b-[2.5px] border-[#111111] pb-4 mb-6">
            <h1 className="text-xl font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              FORGOT PASSWORD
            </h1>
            <p className="text-xs text-[#111111]/80 mt-1">
              Transmit registered email address to issue a cryptographically sealed 15-minute reset token.
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-3 border-[2px] text-xs font-bold ${
              isConfigError
                ? 'bg-[#EFD99C] border-[#844469] text-[#844469]'
                : 'bg-[#F6C6D8] border-[#D95D5D] text-[#D95D5D]'
            } flex items-start gap-2`}>
              {isConfigError ? (
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-black uppercase">{isConfigError ? 'CONFIGURATION ADVISORY' : 'ERROR'}</div>
                <div>{error}</div>
                {isConfigError && (
                  <div className="mt-2 text-[10px] text-gray-700">
                    To enable automated email delivery, configure SMTP credentials (<code>SMTP_HOST</code>, <code>SMTP_PORT</code>, <code>SMTP_USERNAME</code>, <code>SMTP_PASSWORD</code>) in your <code>.env</code> file.
                  </div>
                )}
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="mb-6 p-3 bg-[#8BCF9B]/30 border-[2px] border-[#8BCF9B] text-green-950 text-xs font-bold flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-800" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                Account Email
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] font-black uppercase tracking-wider text-xs brutal-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>DISPATCHING KEY...</span>
              ) : (
                <>
                  <span>[ TRANSMIT RESET KEY ]</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-[2.5px] border-[#111111] text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-[#844469] hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
