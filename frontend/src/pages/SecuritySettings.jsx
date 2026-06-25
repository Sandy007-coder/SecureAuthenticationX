import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Smartphone,
  Lock,
  Monitor,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Key,
  Clock,
} from 'lucide-react';

import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { useAuth } from '../App.jsx';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled ?? true);
  const [allowlistEnabled, setAllowlistEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [toggleMessage, setToggleMessage] = useState('');

  const handleToggle = (setter, current, label) => {
    setter(!current);
    setToggleMessage(`${label} ${!current ? 'enabled' : 'disabled'}.`);
    setTimeout(() => setToggleMessage(''), 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((current) => !current)}
        />

        <main className="flex-1 space-y-6 overflow-y-auto px-4 py-6 lg:px-8 animate-fade-in">
          <header>
            <h1 className="font-display text-xl font-bold text-cyber-bright">
              Security <span className="neon-text">Settings</span>
            </h1>
            <p className="mt-0.5 font-mono-code text-sm text-cyber-muted">
              Manage authentication, sessions, and account protection
            </p>
          </header>

          {toggleMessage && (
            <AlertBanner
              type="success"
              title="Setting Updated"
              message={toggleMessage}
              autoDismiss
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            <section className="glass-card border border-cyber-border/60 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                <Smartphone size={16} className="text-cyber-blue" />
                Multi-Factor Authentication
              </h2>

              <div className="flex items-center justify-between rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-4">
                <div>
                  <p className="text-sm font-medium text-cyber-bright">
                    Authenticator App (TOTP)
                  </p>
                  <p className="mt-0.5 text-xs text-cyber-muted">
                    {mfaEnabled
                      ? 'Active — a second factor is required at login.'
                      : 'Inactive — your account relies on password only.'}
                  </p>
                </div>

                <ToggleSwitch
                  enabled={mfaEnabled}
                  onClick={() => handleToggle(setMfaEnabled, mfaEnabled, 'Multi-factor authentication')}
                />
              </div>

              {mfaEnabled ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-cyber-green/30 bg-cyber-green/5 px-4 py-3">
                  <CheckCircle size={16} className="flex-shrink-0 text-cyber-green" />
                  <p className="text-xs text-cyber-muted">
                    MFA is protecting this account. To reconfigure your authenticator app, disable and re-enable MFA.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-cyber-yellow/30 bg-cyber-yellow/5 px-4 py-3">
                    <AlertTriangle size={16} className="flex-shrink-0 text-cyber-yellow" />
                    <p className="text-xs text-cyber-muted">
                      Your account is less secure without MFA. Enable it to add a second layer of protection.
                    </p>
                  </div>
                  <button className="btn-cyber mt-4 w-full gap-2 py-2 text-xs">
                    <Smartphone size={13} />
                    Set Up Authenticator App
                  </button>
                </>
              )}
            </section>

            <section className="glass-card border border-cyber-border/60 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                <Key size={16} className="text-cyber-blue" />
                Password
              </h2>

              <div className="rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-4">
                <p className="text-sm font-medium text-cyber-bright">Account Password</p>
                <p className="mt-0.5 text-xs text-cyber-muted">
                  Use a strong, unique password and update it periodically.
                </p>
              </div>

              <Link
                to="/profile"
                className="btn-cyber mt-4 flex w-full items-center justify-center gap-2 py-2 text-xs"
              >
                <Lock size={13} />
                Change Password
              </Link>
            </section>

            <section className="glass-card border border-cyber-border/60 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                <MapPin size={16} className="text-cyber-blue" />
                IP Allowlisting
              </h2>

              <div className="flex items-center justify-between rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-4">
                <div>
                  <p className="text-sm font-medium text-cyber-bright">Restrict Login by IP</p>
                  <p className="mt-0.5 text-xs text-cyber-muted">
                    {allowlistEnabled
                      ? 'Only allowlisted IP addresses can sign in.'
                      : 'Login is permitted from any IP address.'}
                  </p>
                </div>

                <ToggleSwitch
                  enabled={allowlistEnabled}
                  onClick={() => handleToggle(setAllowlistEnabled, allowlistEnabled, 'IP allowlisting')}
                />
              </div>

              {allowlistEnabled && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-cyber-yellow/30 bg-cyber-yellow/5 px-4 py-3">
                  <AlertTriangle size={16} className="flex-shrink-0 text-cyber-yellow" />
                  <p className="text-xs text-cyber-muted">
                    Make sure to add your current IP address before relying on this restriction, or you may be locked out.
                  </p>
                </div>
              )}
            </section>

            <section className="glass-card border border-cyber-border/60 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                <AlertTriangle size={16} className="text-cyber-blue" />
                Suspicious Login Alerts
              </h2>

              <div className="flex items-center justify-between rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-4">
                <div>
                  <p className="text-sm font-medium text-cyber-bright">Email Notifications</p>
                  <p className="mt-0.5 text-xs text-cyber-muted">
                    {loginAlertsEnabled
                      ? 'You will be notified of logins from new locations or devices.'
                      : 'Login notifications are turned off.'}
                  </p>
                </div>

                <ToggleSwitch
                  enabled={loginAlertsEnabled}
                  onClick={() => handleToggle(setLoginAlertsEnabled, loginAlertsEnabled, 'Login alerts')}
                />
              </div>
            </section>
          </div>

          <section className="glass-card border border-cyber-border/60 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-cyber-bright">
              <Monitor size={16} className="text-cyber-blue" />
              Current Session
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <SessionDetail
                icon={<Lock size={16} className="text-cyber-blue" />}
                label="Account"
                value={user?.email || '—'}
              />
              <SessionDetail
                icon={<Shield size={16} className="text-cyber-blue" />}
                label="Role"
                value={(user?.role || 'user').toUpperCase()}
              />
              <SessionDetail
                icon={<Clock size={16} className="text-cyber-blue" />}
                label="Session Type"
                value="JWT (HTTP-only cookie)"
              />
            </div>

            <p className="mt-4 text-xs text-cyber-muted">
              Sessions automatically expire after a period of inactivity. If you believe
              your account has been compromised, change your password immediately from
              the{' '}
              <Link to="/profile" className="text-cyber-blue hover:underline">
                Profile
              </Link>{' '}
              page.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

function SessionDetail({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-4">
      <p className="mb-1 flex items-center gap-1.5 font-mono-code text-xs uppercase tracking-widest text-cyber-muted">
        {icon}
        {label}
      </p>
      <p className="break-all text-sm font-medium text-cyber-bright">{value}</p>
    </div>
  );
}

function ToggleSwitch({ enabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        enabled ? 'bg-cyber-green' : 'bg-cyber-border/60'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  );
}