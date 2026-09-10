'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/navigation/Sidebar';
import DashboardHeader from '@/components/navigation/DashboardHeader';
import { useProfile } from '@/lib/useProfile';
import { 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Bell, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Film, 
  Globe, 
  Scale, 
  Eye, 
  ArrowRight,
  RefreshCw,
  Lock,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, isLoading, refetch, updateProfile, changePassword, updateNotifications } = useProfile();

  // Form states
  const [activeTab, setActiveTab] = useState<'account' | 'plan' | 'usage' | 'security' | 'notifications'>('account');
  const [nameInput, setNameInput] = useState('');
  const [orgInput, setOrgInput] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notifications State
  const [notifState, setNotifState] = useState({
    email_alerts: true,
    push_alerts: false,
    detection_alerts: true,
    incident_alerts: true,
  });
  const [notifMsg, setNotifMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync inputs on profile load
  React.useEffect(() => {
    if (profile) {
      setNameInput(profile.user.name);
      setOrgInput(profile.user.organization || '');
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile(nameInput, orgInput);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSecurityMsg({ type: 'success', text: 'Password changed successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleNotif = async (key: keyof typeof notifState) => {
    const updated = { ...notifState, [key]: !notifState[key] };
    setNotifState(updated);
    setNotifMsg(null);
    try {
      await updateNotifications(updated);
      setNotifMsg({ type: 'success', text: 'Preferences saved.' });
    } catch (err: any) {
      setNotifMsg({ type: 'error', text: 'Failed to persist preferences.' });
    }
  };

  const isPro = profile?.subscription.plan === 'pro';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8E8E8] text-[#111111] font-mono">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader title="Operator Profile & Subscription" />

        <div className="p-6 lg:p-8 space-y-8 flex-1 max-w-[1440px] w-full mx-auto">
          
          {/* Top Profile Summary Card */}
          <div className="bg-[#EFD99C] border-[3px] border-[#111111] p-6 brutal-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-[3px] border-[#111111] bg-white overflow-hidden shadow-[2px_2px_0px_#111111] shrink-0">
                <img
                  src={profile?.user.avatar_url || 'https://api.dicebear.com/7.x/identicon/svg?seed=argos'}
                  alt={profile?.user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black uppercase text-[#111111]">
                    {profile?.user.name || 'Loading Operator...'}
                  </h1>
                  <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase border-[1.5px] border-[#111111] ${
                    isPro ? 'bg-[#F4CD3F] text-[#111111]' : 'bg-white text-gray-700'
                  }`}>
                    {profile?.subscription.plan === 'pro' ? 'ARGOS PRO' : 'ARGOS FREE'}
                  </span>
                </div>
                <div className="text-xs text-gray-700 mt-0.5">
                  {profile?.user.email} • {profile?.user.organization || 'Independent Operator'}
                </div>
                <div className="text-[10px] text-gray-600 mt-1">
                  ACCOUNT ID: <span className="font-bold text-black">{profile?.user.id || 'usr_loading'}</span> • MEMBER SINCE: {profile?.user.created_at ? new Date(profile.user.created_at).toLocaleDateString() : '2026'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
              {isPro ? (
                <Link
                  href="/pricing"
                  className="px-4 py-2.5 bg-white hover:bg-[#F6C6D8] text-[#111111] border-[2px] border-[#111111] text-xs font-black uppercase brutal-btn"
                >
                  MANAGE SUBSCRIPTION
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] text-xs font-black uppercase brutal-btn flex items-center gap-2 shadow-[2px_2px_0px_#111111]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#844469]" />
                  <span>UPGRADE TO PRO (₹199)</span>
                </Link>
              )}
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap border-b-[3px] border-[#111111] gap-2 pb-0">
            {[
              { id: 'account', label: '1. ACCOUNT', icon: User },
              { id: 'plan', label: '2. CURRENT PLAN', icon: ShieldCheck },
              { id: 'usage', label: '3. USAGE & QUOTAS', icon: Activity },
              { id: 'security', label: '4. SECURITY', icon: KeyRound },
              { id: 'notifications', label: '5. NOTIFICATIONS', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 border-[2px] border-b-0 border-[#111111] text-xs font-black uppercase flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-[#111111] text-[#F4CD3F] shadow-[2px_-2px_0px_#844469]'
                      : 'bg-white hover:bg-[#F6C6D8] text-[#111111]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ACCOUNT */}
          {activeTab === 'account' && (
            <div className="bg-white border-[3px] border-[#111111] p-6 brutal-shadow space-y-6">
              <div className="pb-3 border-b-[2px] border-[#111111]">
                <h3 className="text-lg font-black uppercase">Operator Account Information</h3>
                <p className="text-xs text-gray-600">Update operator display name and forensic institutional affiliation.</p>
              </div>

              {profileMsg && (
                <div className={`p-3 border-[2px] border-[#111111] text-xs font-bold ${
                  profileMsg.type === 'success' ? 'bg-[#8BCF9B]/40 text-green-900' : 'bg-[#D95D5D]/20 text-red-900'
                }`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="max-w-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full p-2.5 bg-[#F8E8E8] border-[2px] border-[#111111] text-xs font-bold outline-none focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Email Address (Immutable)</label>
                  <input
                    type="email"
                    value={profile?.user.email || ''}
                    disabled
                    className="w-full p-2.5 bg-gray-100 border-[2px] border-[#111111] text-xs font-bold text-gray-500 cursor-not-allowed"
                  />
                  <div className="text-[10px] text-gray-500 mt-1">Identity key cryptographically bound to forensic audit log.</div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Organization / Studio</label>
                  <input
                    type="text"
                    value={orgInput}
                    onChange={(e) => setOrgInput(e.target.value)}
                    className="w-full p-2.5 bg-[#F8E8E8] border-[2px] border-[#111111] text-xs font-bold outline-none focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] font-mono text-xs font-black uppercase brutal-btn flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'SAVING...' : 'SAVE CHANGES'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: CURRENT PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Free Plan Card */}
                <div className={`p-6 border-[3px] border-[#111111] flex flex-col justify-between ${
                  !isPro ? 'bg-[#EFD99C] shadow-[5px_5px_0px_#111111]' : 'bg-white opacity-80'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase bg-[#111111] text-white px-2 py-0.5">
                        TIER 01
                      </span>
                      {!isPro && (
                        <span className="text-[10px] font-black uppercase bg-[#8BCF9B] px-2 py-0.5 border-[1.5px] border-[#111111]">
                          CURRENT PLAN
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black uppercase font-display">ARGOS FREE</h3>
                    <div className="text-xs font-bold text-[#844469] mt-1 mb-4">PURPOSE: DETECT</div>
                    
                    <div className="text-3xl font-black mb-4">₹0 <span className="text-xs font-normal text-gray-600">forever</span></div>
                    
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center gap-2">✓ Full Audio-Visual Deepfake Detection</li>
                      <li className="flex items-center gap-2">✓ Lip-Sync & Face ROI Analysis (96x96)</li>
                      <li className="flex items-center gap-2">✓ 80-Band Mel-Spectrogram Extraction</li>
                      <li className="flex items-center gap-2">✓ SyncNet Cross-Modal Alignment</li>
                      <li className="flex items-center gap-2">✓ Real / Fake Classification & Confidence</li>
                      <li className="flex items-center gap-2">✓ Evidence Keyframe Exhibits</li>
                      <li className="flex items-center gap-2">✓ Analysis History & Public Verification</li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t-[2px] border-[#111111]">
                    {!isPro ? (
                      <div className="text-xs font-bold text-center text-gray-700 py-2 bg-white/60 border-[1.5px] border-[#111111]">
                        ACTIVE PLAN
                      </div>
                    ) : (
                      <Link
                        href="/pricing"
                        className="block text-center text-xs font-black uppercase py-2 bg-white hover:bg-gray-100 border-[2px] border-[#111111]"
                      >
                        SWITCH TO FREE
                      </Link>
                    )}
                  </div>
                </div>

                {/* Pro Plan Card */}
                <div className={`p-6 border-[3px] border-[#111111] flex flex-col justify-between ${
                  isPro ? 'bg-[#EFD99C] shadow-[5px_5px_0px_#844469]' : 'bg-[#F6C6D8]'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase bg-[#844469] text-white px-2 py-0.5">
                        TIER 02 // PRO
                      </span>
                      {isPro && (
                        <span className="text-[10px] font-black uppercase bg-[#8BCF9B] px-2 py-0.5 border-[1.5px] border-[#111111]">
                          CURRENT PLAN
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black uppercase font-display">ARGOS PRO</h3>
                    <div className="text-xs font-bold text-[#844469] mt-1 mb-4">PURPOSE: PROTECT + MONITOR + RESPOND</div>
                    
                    <div className="text-3xl font-black mb-4">₹199 <span className="text-xs font-normal text-gray-700">/ month</span></div>

                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center gap-2 font-bold text-[#844469]">✓ EVERYTHING IN FREE TIER PLUS:</li>
                      <li className="flex items-center gap-2">✓ Media DNA Multimodal Fingerprinting</li>
                      <li className="flex items-center gap-2">✓ Hardware-Grade C2PA Provenance Signing</li>
                      <li className="flex items-center gap-2">✓ Imperceptible Watermark Embedding</li>
                      <li className="flex items-center gap-2">✓ Sovereign Protection Certificates</li>
                      <li className="flex items-center gap-2">✓ Telemetry Across Supported Public Sources</li>
                      <li className="flex items-center gap-2">✓ Automated Incident & Takedown Dossiers</li>
                      <li className="flex items-center gap-2">✓ Cryptographic PDF Forensic Reports</li>
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t-[2px] border-[#111111]">
                    {isPro ? (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-center text-[#8BCF9B] bg-[#111111] py-2 border-[1.5px] border-[#111111]">
                          ● PRO SUBSCRIPTION ACTIVE
                        </div>
                        <div className="text-[10px] text-center text-gray-700">
                          Status: {profile?.subscription.status.toUpperCase()} • Billed Monthly
                        </div>
                      </div>
                    ) : (
                      <Link
                        href="/pricing"
                        className="block text-center text-xs font-black uppercase py-3 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] brutal-btn shadow-[2px_2px_0px_#111111]"
                      >
                        UPGRADE TO PRO (₹199/MO)
                      </Link>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: USAGE */}
          {activeTab === 'usage' && (
            <div className="bg-white border-[3px] border-[#111111] p-6 brutal-shadow space-y-6">
              <div className="pb-3 border-b-[2px] border-[#111111]">
                <h3 className="text-lg font-black uppercase">Monthly Forensic Telemetry & Quotas</h3>
                <p className="text-xs text-gray-600">Dynamic counters queried directly from backend database ledger.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Analyses */}
                <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111]">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase">
                    <span>Analyses Used</span>
                    <Eye className="w-4 h-4 text-[#844469]" />
                  </div>
                  <div className="text-3xl font-black font-display my-2">
                    {profile?.usage.analyses ?? 0}
                    <span className="text-xs text-gray-500 font-mono font-bold"> / {profile?.usage.analysis_limit ?? 10}</span>
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Remaining: <strong className="text-black">{profile?.usage.analyses_remaining ?? 10}</strong> analyses
                  </div>
                </div>

                {/* Protected Assets */}
                <div className="p-4 bg-[#EFD99C] border-[2px] border-[#111111]">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase">
                    <span>Protected Assets</span>
                    <Film className="w-4 h-4 text-[#844469]" />
                  </div>
                  <div className="text-3xl font-black font-display my-2">
                    {profile?.usage.protected_assets ?? 0}
                  </div>
                  <div className="text-[10px] text-gray-700">
                    Registered with Media DNA & C2PA
                  </div>
                </div>

                {/* Monitoring Sources */}
                <div className="p-4 bg-[#F6C6D8] border-[2px] border-[#111111]">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase">
                    <span>Monitoring Sources</span>
                    <Globe className="w-4 h-4 text-[#844469]" />
                  </div>
                  <div className="text-3xl font-black font-display my-2">
                    {profile?.usage.monitoring_sources ?? 0}
                  </div>
                  <div className="text-[10px] text-gray-700">
                    Supported public & indexed relays
                  </div>
                </div>

                {/* Incidents */}
                <div className="p-4 bg-[#F8E8E8] border-[2px] border-[#111111]">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-700 uppercase">
                    <span>Active Incidents</span>
                    <Scale className="w-4 h-4 text-[#D95D5D]" />
                  </div>
                  <div className="text-3xl font-black font-display my-2 text-[#D95D5D]">
                    {profile?.usage.incidents ?? 0}
                  </div>
                  <div className="text-[10px] text-gray-600">
                    Takedowns & copyright notices
                  </div>
                </div>

              </div>

              {!isPro && (
                <div className="p-4 bg-[#EFD99C] border-[2px] border-[#111111] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-black text-black uppercase">Need extended analysis limits? </span>
                    ARGOS PRO unlocks 1000 analyses/month, continuous telemetry, and sovereign protection.
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 bg-[#111111] text-[#F4CD3F] font-black text-xs uppercase border-[1.5px] border-[#111111] shrink-0"
                  >
                    UPGRADE TO PRO (₹199)
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white border-[3px] border-[#111111] p-6 brutal-shadow space-y-6">
              <div className="pb-3 border-b-[2px] border-[#111111]">
                <h3 className="text-lg font-black uppercase">Forensic Security & Key Management</h3>
                <p className="text-xs text-gray-600">Manage password hashing credentials and session token status.</p>
              </div>

              {securityMsg && (
                <div className={`p-3 border-[2px] border-[#111111] text-xs font-bold ${
                  securityMsg.type === 'success' ? 'bg-[#8BCF9B]/40 text-green-900' : 'bg-[#D95D5D]/20 text-red-900'
                }`}>
                  {securityMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="max-w-xl space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full p-2.5 bg-[#F8E8E8] border-[2px] border-[#111111] text-xs font-bold outline-none focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-[#F8E8E8] border-[2px] border-[#111111] text-xs font-bold outline-none focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-[#F8E8E8] border-[2px] border-[#111111] text-xs font-bold outline-none focus:bg-white"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-5 py-2.5 bg-[#F4CD3F] hover:bg-[#ffe066] text-[#111111] border-[2px] border-[#111111] font-mono text-xs font-black uppercase brutal-btn flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isChangingPassword ? 'CHANGING...' : 'UPDATE PASSWORD'}</span>
                  </button>
                </div>
              </form>

              {/* Security Telemetry */}
              <div className="pt-4 border-t-[2px] border-[#111111] space-y-3">
                <div className="text-xs font-black uppercase text-gray-700">ACTIVE SESSION TELEMETRY</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F8E8E8] border-[1.5px] border-[#111111]">
                    <div className="font-bold text-gray-600">TOKEN AUTHENTICATION</div>
                    <div className="font-black text-black">JWT Bearer HS256 Signed</div>
                    <div className="text-[10px] text-[#8BCF9B] font-bold mt-1">● ACTIVE SESSION SECURED</div>
                  </div>
                  <div className="p-3 bg-gray-100 border-[1.5px] border-[#111111]">
                    <div className="font-bold text-gray-600">TWO-FACTOR AUTHENTICATION</div>
                    <div className="font-black text-gray-800">Hardware FIDO2 / TOTP (Enterprise Roadmap)</div>
                    <div className="text-[10px] text-gray-500 mt-1">Status: Unconfigured</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white border-[3px] border-[#111111] p-6 brutal-shadow space-y-6">
              <div className="pb-3 border-b-[2px] border-[#111111]">
                <h3 className="text-lg font-black uppercase">Notification Channels & Alert Routing</h3>
                <p className="text-xs text-gray-600">Configure where you receive critical deepfake and derivative alerts.</p>
              </div>

              {notifMsg && (
                <div className="p-3 bg-[#8BCF9B]/40 border-[2px] border-[#111111] text-xs font-bold text-green-900">
                  {notifMsg.text}
                </div>
              )}

              <div className="max-w-xl space-y-4">
                
                {/* Email alerts */}
                <div className="flex items-center justify-between p-3.5 bg-[#F8E8E8] border-[2px] border-[#111111]">
                  <div>
                    <div className="text-xs font-black uppercase">Email Forensic Alerts</div>
                    <div className="text-[10px] text-gray-600">Receive instant email digests when new manipulations or matches are detected.</div>
                  </div>
                  <button
                    onClick={() => handleToggleNotif('email_alerts')}
                    className={`px-3 py-1 text-xs font-black uppercase border-[1.5px] border-[#111111] ${
                      notifState.email_alerts ? 'bg-[#8BCF9B] text-black' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {notifState.email_alerts ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Push alerts */}
                <div className="flex items-center justify-between p-3.5 bg-[#F8E8E8] border-[2px] border-[#111111]">
                  <div>
                    <div className="text-xs font-black uppercase">Browser Push Alerts</div>
                    <div className="text-[10px] text-gray-600">Desktop browser notifications for urgent forensic anomalies.</div>
                  </div>
                  <button
                    onClick={() => handleToggleNotif('push_alerts')}
                    className={`px-3 py-1 text-xs font-black uppercase border-[1.5px] border-[#111111] ${
                      notifState.push_alerts ? 'bg-[#8BCF9B] text-black' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {notifState.push_alerts ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Detection alerts */}
                <div className="flex items-center justify-between p-3.5 bg-[#F8E8E8] border-[2px] border-[#111111]">
                  <div>
                    <div className="text-xs font-black uppercase">Detection Pipeline Alerts</div>
                    <div className="text-[10px] text-gray-600">Notify when 11-stage deepfake analysis completes on uploaded media.</div>
                  </div>
                  <button
                    onClick={() => handleToggleNotif('detection_alerts')}
                    className={`px-3 py-1 text-xs font-black uppercase border-[1.5px] border-[#111111] ${
                      notifState.detection_alerts ? 'bg-[#8BCF9B] text-black' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {notifState.detection_alerts ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* Incident alerts */}
                <div className="flex items-center justify-between p-3.5 bg-[#F8E8E8] border-[2px] border-[#111111]">
                  <div>
                    <div className="text-xs font-black uppercase">Takedown & Incident Alerts</div>
                    <div className="text-[10px] text-gray-600">Status updates regarding submitted takedown notices and platform responses.</div>
                  </div>
                  <button
                    onClick={() => handleToggleNotif('incident_alerts')}
                    className={`px-3 py-1 text-xs font-black uppercase border-[1.5px] border-[#111111] ${
                      notifState.incident_alerts ? 'bg-[#8BCF9B] text-black' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {notifState.incident_alerts ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
