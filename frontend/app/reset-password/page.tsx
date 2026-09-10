'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ArgosLogo from '@/components/branding/ArgosLogo';
import { KeyRound, Key, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to update credentials.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error executing password reset.');
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
            CREDENTIAL RECONFIGURATION
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#EFD99C] border-[3px] border-[#111111] brutal-shadow p-6 md:p-8">
          <div className="border-b-[2.5px] border-[#111111] pb-4 mb-6">
            <h1 className="text-xl font-black uppercase tracking-wider text-[#111111] flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              RESET PASSWORD
            </h1>
            <p className="text-xs text-[#111111]/80 mt-1">
              Enter your reset authorization key and configure a new high-entropy password.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#F6C6D8] border-[2px] border-[#D95D5D] text-[#D95D5D] text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#8BCF9B]/30 border-[2px] border-[#8BCF9B] text-green-950 text-xs font-bold flex items-start gap-2">
                <CheckCircle className="w-5 h-5 shrink-0 text-green-800" />
                <div>
                  <div className="font-black">PASSWORD RESET COMPLETE</div>
                  <p className="mt-1">
                    Your credentials have been securely updated. All existing active sessions have been terminated.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] font-black uppercase tracking-wider text-xs brutal-btn text-center"
              >
                PROCEED TO SIGN IN
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                  Reset Token / Security Key
                </label>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste 15-minute token"
                  className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-mono font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 bg-white border-[2.5px] border-[#111111] text-xs font-bold focus:outline-none focus:bg-[#FFFEEB] placeholder:text-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2.5px] border-[#111111] font-black uppercase tracking-wider text-xs brutal-btn flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>COMMITTING CREDENTIALS...</span>
                ) : (
                  <>
                    <span>[ RESET CREDENTIALS ]</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8E8E8] flex items-center justify-center font-mono text-xs font-bold">
          LOADING ARGOS CREDENTIAL RESET...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
