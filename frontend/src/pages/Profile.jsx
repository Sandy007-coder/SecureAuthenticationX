import React, { useState, useEffect } from 'react';
import {
  User, Mail, Shield, ShieldCheck, Calendar,
  Key, Lock, CheckCircle, AlertCircle, Edit3,
} from 'lucide-react';
import Navbar         from '../components/Navbar.jsx';
import Sidebar        from '../components/Sidebar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AlertBanner    from '../components/AlertBanner.jsx';
import { useAuth }    from '../App.jsx';
import { authApi }    from '../services/api.js';

export default function Profile() {
  const { user: ctxUser }   = useAuth();
  const [sidebarOpen, setSidebar] = useState(false);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    authApi.getProfile()
      .then(({ data }) => setProfile(data.user || data))
      .catch(() => setProfile(ctxUser))   // fallback to context user
      .finally(() => setLoading(false));
  }, [ctxUser]);

  const u = profile || ctxUser || {};

  // ─── Info rows ───────────────────────────────────────────────────────────────
  const infoRows = [
    { icon: <User size={15} />,     label: 'Username',   value: u.username  || '—' },
    { icon: <Mail size={15} />,     label: 'Email',      value: u.email     || '—' },
    { icon: <Shield size={15} />,   label: 'Role',       value: u.role      || 'user' },
    { icon: <Calendar size={15} />, label: 'Joined',     value: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : '—' },
    { icon: <Key size={15} />,      label: 'User ID',    value: u._id || u.id || '—' },
  ];

  // ─── Security feature rows ────────────────────────────────────────────────────
  const securityFeatures = [
    { label: '2-Factor Authentication', enabled: true },
    { label: 'HTTP-Only Cookie Auth',   enabled: true },
    { label: 'Session Encryption',      enabled: true },
    { label: 'IP Allowlisting',         enabled: false },
    { label: 'Suspicious Login Alerts', enabled: true },
  ];

  return (
    <div className="flex h-screen bg-cyber-bg overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebar(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebar((v) => !v)} sidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 space-y-6 animate-fade-in">

          {/* Header */}
          <div>
            <h1 className="font-display text-xl font-bold text-cyber-bright">
              User <span className="neon-text">Profile</span>
            </h1>
            <p className="text-cyber-muted text-sm mt-0.5 font-mono-code">
              Account details and security configuration
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner message="Loading profile…" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Avatar + quick info — left column */}
              <div className="glass-card border border-cyber-border/60 p-6 flex flex-col items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full
                                  bg-cyber-blue/20 border-2 border-cyber-blue/60 shadow-neon">
                    <span className="font-display text-3xl font-bold text-cyber-blue">
                      {u.username?.slice(0, 2).toUpperCase() || 'SX'}
                    </span>
                  </div>
                  {/* Online dot */}
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-cyber-bg bg-cyber-green">
                    <span className="absolute inset-0 rounded-full bg-cyber-green animate-ping opacity-75" />
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-cyber-bright">{u.username || 'Unknown'}</p>
                  <p className="text-cyber-muted text-sm">{u.email || '—'}</p>
                </div>

                {/* Role badge */}
                <div className={u.role === 'admin' ? 'badge-red' : 'badge-blue'}>
                  {u.role === 'admin' ? <ShieldCheck size={11} /> : <User size={11} />}
                  {(u.role || 'user').toUpperCase()}
                </div>

                {/* Account status */}
                <div className="w-full rounded-lg border border-cyber-green/30 bg-cyber-green/5 px-4 py-3 text-center">
                  <p className="text-cyber-green text-xs font-semibold tracking-widest uppercase font-mono-code">
                    Account Active
                  </p>
                  <p className="text-cyber-muted text-xs mt-0.5">All systems operational</p>
                </div>

                <button className="w-full btn-cyber py-2 text-xs gap-2">
                  <Edit3 size={13} /> Edit Profile
                </button>
              </div>

              {/* Account details — middle column */}
              <div className="glass-card border border-cyber-border/60 p-6">
                <h2 className="text-base font-semibold text-cyber-bright mb-5 flex items-center gap-2">
                  <User size={16} className="text-cyber-blue" />
                  Account Details
                </h2>
                <div className="space-y-4">
                  {infoRows.map((row) => (
                    <div key={row.label} className="border-b border-cyber-border/40 pb-4 last:border-0 last:pb-0">
                      <p className="text-xs text-cyber-muted tracking-widest uppercase font-mono-code mb-1 flex items-center gap-1.5">
                        <span className="text-cyber-blue">{row.icon}</span>
                        {row.label}
                      </p>
                      <p className="text-cyber-bright text-sm font-medium break-all">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security status — right column */}
              <div className="glass-card border border-cyber-border/60 p-6">
                <h2 className="text-base font-semibold text-cyber-bright mb-5 flex items-center gap-2">
                  <Lock size={16} className="text-cyber-blue" />
                  Security Status
                </h2>

                <AlertBanner
                  type="success"
                  title="Account Secured"
                  message="Your account meets all enterprise security requirements."
                />

                <div className="mt-5 space-y-3">
                  {securityFeatures.map((feat) => (
                    <div
                      key={feat.label}
                      className="flex items-center justify-between rounded-lg px-4 py-3
                                 border border-cyber-border/40 bg-cyber-surface/40"
                    >
                      <span className="text-cyber-text text-sm">{feat.label}</span>
                      {feat.enabled ? (
                        <CheckCircle size={16} className="text-cyber-green flex-shrink-0" />
                      ) : (
                        <AlertCircle size={16} className="text-cyber-yellow flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <button className="mt-5 w-full btn-cyber py-2 text-xs gap-2">
                  <Shield size={13} /> Security Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
