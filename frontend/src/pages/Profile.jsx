import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Calendar,
  Key,
  Lock,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { useAuth } from '../App.jsx';
import { authApi } from '../services/api.js';

const INITIAL_SECURITY_FEATURES = [
  { key: 'mfa',               label: '2-Factor Authentication',   enabled: true,  toggleable: true  },
  { key: 'httpOnly',          label: 'HTTP-Only Cookie Auth',      enabled: true,  toggleable: false },
  { key: 'sessionEncryption', label: 'Session Encryption',         enabled: true,  toggleable: false },
  { key: 'ipAllowlist',       label: 'IP Allowlisting',            enabled: false, toggleable: true  },
  { key: 'loginAlerts',       label: 'Suspicious Login Alerts',    enabled: true,  toggleable: true  },
];

function validate(fields) {
  const errors = {};
  if (!fields.username || fields.username.trim().length < 3)
    errors.username = 'Username must be at least 3 characters.';
  if (!fields.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    errors.email = 'Enter a valid email address.';
  return errors;
}

function validatePassword(fields) {
  const errors = {};
  if (!fields.currentPassword)
    errors.currentPassword = 'Current password is required.';
  if (!fields.newPassword || fields.newPassword.length < 8)
    errors.newPassword = 'New password must be at least 8 characters.';
  if (!/[A-Z]/.test(fields.newPassword))
    errors.newPassword = 'Must contain at least one uppercase letter.';
  if (!/\d/.test(fields.newPassword))
    errors.newPassword = 'Must contain at least one digit.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(fields.newPassword))
    errors.newPassword = 'Must contain at least one special character.';
  if (fields.newPassword !== fields.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user: authenticatedUser, updateUser } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState({ username: '', email: '' });
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [securityFeatures, setSecurityFeatures] = useState(INITIAL_SECURITY_FEATURES);
  const [securitySaveMsg, setSecuritySaveMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const { data } = await authApi.getProfile();
        if (mounted) setProfile(data.user || data);
      } catch {
        if (mounted) setProfile(authenticatedUser);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, [authenticatedUser]);

  const user = profile || authenticatedUser || {};

  useEffect(() => {
    if (user.username || user.email) {
      setEditFields({ username: user.username || '', email: user.email || '' });
    }
  }, [user.username, user.email]);

  const handleStartEdit = () => {
    setEditFields({ username: user.username || '', email: user.email || '' });
    setEditErrors({});
    setSaveSuccess('');
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditErrors({});
  };

  const handleSaveProfile = async () => {
    const errors = validate(editFields);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      await authApi.updateProfile({
        username: editFields.username.trim(),
        email: editFields.email.trim().toLowerCase(),
      });

      setProfile((prev) => ({ ...prev, ...editFields }));

      if (updateUser) {
        updateUser({ username: editFields.username, email: editFields.email });
      }

      setSaveSuccess('Profile updated successfully.');
      setIsEditing(false);

    } catch (error) {
      const message = error?.response?.data?.message;
      const status  = error?.response?.status;

      if (status === 409) {
        setSaveError('This email is already in use by another account.');
      } else if (status === 422) {
        setSaveError(message || 'Invalid input. Please check your details.');
      } else {
        setSaveError(message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    const errors = validatePassword(passwordFields);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await authApi.changePassword({
        currentPassword: passwordFields.currentPassword,
        newPassword:     passwordFields.newPassword,
        confirmPassword: passwordFields.confirmPassword,
      });

      setPasswordSuccess('Password changed successfully.');
      setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);

    } catch (error) {
      const message = error?.response?.data?.message;
      const status  = error?.response?.status;

      if (status === 401) {
        setPasswordError('Current password is incorrect.');
      } else if (status === 422) {
        setPasswordError(message || 'New password does not meet requirements.');
      } else {
        setPasswordError(message || 'Failed to change password. Please try again.');
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggleSecurity = (key) => {
    setSecurityFeatures((prev) =>
      prev.map((f) => (f.key === key && f.toggleable ? { ...f, enabled: !f.enabled } : f))
    );
    setSecuritySaveMsg('Security preferences updated.');
    setTimeout(() => setSecuritySaveMsg(''), 3000);
  };

  const profileDetails = useMemo(() => [
    { icon: <User size={15} />,     label: 'Username', value: user.username || '—' },
    { icon: <Mail size={15} />,     label: 'Email',    value: user.email    || '—' },
    { icon: <Shield size={15} />,   label: 'Role',     value: user.role     || 'user' },
    {
      icon: <Calendar size={15} />,
      label: 'Joined',
      value: user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })
        : '—',
    },
    { icon: <Key size={15} />, label: 'User ID', value: user._id || user.id || '—' },
  ], [user]);

  const initials   = user.username?.slice(0, 2).toUpperCase() || 'SX';
  const role       = user.role || 'user';
  const isAdmin    = role === 'admin';
  const mfaEnabled = securityFeatures.find((f) => f.key === 'mfa')?.enabled;

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((c) => !c)}
        />

        <main className="flex-1 space-y-6 overflow-y-auto px-4 py-6 lg:px-8 animate-fade-in">
          <header>
            <h1 className="font-display text-xl font-bold text-cyber-bright">
              User <span className="neon-text">Profile</span>
            </h1>
            <p className="mt-0.5 font-mono-code text-sm text-cyber-muted">
              Account details and security configuration
            </p>
          </header>

          {saveSuccess && (
            <AlertBanner type="success" title="Saved" message={saveSuccess} autoDismiss />
          )}
          {saveError && (
            <AlertBanner type="danger" title="Error" message={saveError} />
          )}
          {passwordSuccess && (
            <AlertBanner type="success" title="Password Changed" message={passwordSuccess} autoDismiss />
          )}
          {passwordError && (
            <AlertBanner type="danger" title="Error" message={passwordError} />
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner message="Loading profile…" />
            </div>
          ) : (
            <div className="space-y-6">

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <section className="glass-card flex flex-col items-center gap-4 border border-cyber-border/60 p-6">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-cyber-blue/60 bg-cyber-blue/20 shadow-neon">
                      <span className="font-display text-3xl font-bold text-cyber-blue">
                        {initials}
                      </span>
                    </div>
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-cyber-bg bg-cyber-green">
                      <span className="absolute inset-0 rounded-full bg-cyber-green opacity-75 animate-ping" />
                    </span>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-bold text-cyber-bright">{user.username || 'Unknown'}</p>
                    <p className="text-sm text-cyber-muted">{user.email || '—'}</p>
                  </div>

                  <div className={isAdmin ? 'badge-red' : 'badge-blue'}>
                    {isAdmin ? <ShieldCheck size={11} /> : <User size={11} />}
                    {role.toUpperCase()}
                  </div>

                  <div className="w-full rounded-lg border border-cyber-green/30 bg-cyber-green/5 px-4 py-3 text-center">
                    <p className="font-mono-code text-xs font-semibold uppercase tracking-widest text-cyber-green">
                      Account Active
                    </p>
                    <p className="mt-0.5 text-xs text-cyber-muted">All systems operational</p>
                  </div>

                  <button onClick={handleStartEdit} className="btn-cyber w-full gap-2 py-2 text-xs">
                    <Edit3 size={13} />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => { setShowPasswordForm((v) => !v); setPasswordErrors({}); }}
                    className="w-full gap-2 rounded-lg border border-cyber-border/50 py-2 text-xs text-cyber-muted hover:border-cyber-blue/40 hover:text-cyber-blue transition-all flex items-center justify-center"
                  >
                    <Key size={13} />
                    Change Password
                  </button>
                </section>

                <section className="glass-card border border-cyber-border/60 p-6">
                  <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                    <User size={16} className="text-cyber-blue" />
                    Account Details
                  </h2>

                  <div className="space-y-4">
                    {profileDetails.map(({ icon, label, value }) => (
                      <div key={label} className="border-b border-cyber-border/40 pb-4 last:border-0 last:pb-0">
                        <p className="mb-1 flex items-center gap-1.5 font-mono-code text-xs uppercase tracking-widest text-cyber-muted">
                          <span className="text-cyber-blue">{icon}</span>
                          {label}
                        </p>
                        <p className="break-all text-sm font-medium text-cyber-bright">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="glass-card border border-cyber-border/60 p-6">
                  <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                    <Lock size={16} className="text-cyber-blue" />
                    Security Status
                  </h2>

                  <AlertBanner
                    type="success"
                    title="Account Secured"
                    message="Your account meets all enterprise security requirements."
                  />

                  {securitySaveMsg && (
                    <p className="mt-3 text-xs text-cyber-green">{securitySaveMsg}</p>
                  )}

                  <div className="mt-4 space-y-3">
                    {securityFeatures.map(({ key, label, enabled, toggleable }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-cyber-border/40 bg-cyber-surface/40 px-4 py-3"
                      >
                        <span className="text-sm text-cyber-text">{label}</span>

                        {toggleable ? (
                          <button
                            onClick={() => handleToggleSecurity(key)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              enabled ? 'bg-cyber-green' : 'bg-cyber-border/60'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                enabled ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : enabled ? (
                          <CheckCircle size={16} className="flex-shrink-0 text-cyber-green" />
                        ) : (
                          <AlertCircle size={16} className="flex-shrink-0 text-cyber-yellow" />
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate('/security-settings')}
                    className="btn-cyber mt-5 w-full gap-2 py-2 text-xs"
                  >
                    <Shield size={13} />
                    Security Settings
                  </button>
                </section>
              </div>

              {isEditing && (
                <section className="glass-card border border-cyber-blue/30 p-6">
                  <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                    <Edit3 size={16} className="text-cyber-blue" />
                    Edit Profile
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-cyber-muted">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editFields.username}
                        onChange={(e) => setEditFields((p) => ({ ...p, username: e.target.value }))}
                        className={`w-full rounded-lg border bg-cyber-surface/40 px-4 py-2.5 text-sm text-cyber-bright placeholder:text-cyber-muted focus:outline-none ${
                          editErrors.username
                            ? 'border-cyber-red/60 focus:border-cyber-red'
                            : 'border-cyber-border/50 focus:border-cyber-blue/60'
                        }`}
                        placeholder="Enter username"
                      />
                      {editErrors.username && (
                        <p className="mt-1 text-xs text-cyber-red">{editErrors.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-cyber-muted">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editFields.email}
                        onChange={(e) => setEditFields((p) => ({ ...p, email: e.target.value }))}
                        className={`w-full rounded-lg border bg-cyber-surface/40 px-4 py-2.5 text-sm text-cyber-bright placeholder:text-cyber-muted focus:outline-none ${
                          editErrors.email
                            ? 'border-cyber-red/60 focus:border-cyber-red'
                            : 'border-cyber-border/50 focus:border-cyber-blue/60'
                        }`}
                        placeholder="Enter email"
                      />
                      {editErrors.email && (
                        <p className="mt-1 text-xs text-cyber-red">{editErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-cyber-blue/20 px-5 py-2 text-sm font-medium text-cyber-blue hover:bg-cyber-blue/30 disabled:opacity-50 transition-all"
                    >
                      {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 rounded-lg border border-cyber-border/50 px-5 py-2 text-sm text-cyber-muted hover:text-cyber-bright transition-all"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              {showPasswordForm && (
                <section className="glass-card border border-cyber-border/60 p-6">
                  <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                    <Key size={16} className="text-cyber-blue" />
                    Change Password
                  </h2>

                  <div className="grid gap-5 sm:grid-cols-3">
                    {[
                      { field: 'currentPassword', label: 'Current Password', showKey: 'current' },
                      { field: 'newPassword',     label: 'New Password',     showKey: 'new'     },
                      { field: 'confirmPassword', label: 'Confirm Password', showKey: 'confirm' },
                    ].map(({ field, label, showKey }) => (
                      <div key={field}>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-cyber-muted">
                          {label}
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords[showKey] ? 'text' : 'password'}
                            value={passwordFields[field]}
                            onChange={(e) =>
                              setPasswordFields((p) => ({ ...p, [field]: e.target.value }))
                            }
                            className={`w-full rounded-lg border bg-cyber-surface/40 px-4 py-2.5 pr-10 text-sm text-cyber-bright placeholder:text-cyber-muted focus:outline-none ${
                              passwordErrors[field]
                                ? 'border-cyber-red/60 focus:border-cyber-red'
                                : 'border-cyber-border/50 focus:border-cyber-blue/60'
                            }`}
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((p) => ({ ...p, [showKey]: !p[showKey] }))
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-bright"
                          >
                            {showPasswords[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {passwordErrors[field] && (
                          <p className="mt-1 text-xs text-cyber-red">{passwordErrors[field]}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-cyber-muted">
                    Password must be 8+ characters with uppercase, a digit, and a special character.
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSavingPassword}
                      className="flex items-center gap-2 rounded-lg bg-cyber-blue/20 px-5 py-2 text-sm font-medium text-cyber-blue hover:bg-cyber-blue/30 disabled:opacity-50 transition-all"
                    >
                      {isSavingPassword ? <RefreshCw size={14} className="animate-spin" /> : <Lock size={14} />}
                      {isSavingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => { setShowPasswordForm(false); setPasswordErrors({}); }}
                      className="flex items-center gap-2 rounded-lg border border-cyber-border/50 px-5 py-2 text-sm text-cyber-muted hover:text-cyber-bright transition-all"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </section>
              )}

              <section className="glass-card border border-cyber-border/60 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-cyber-bright">
                  <Smartphone size={16} className="text-cyber-blue" />
                  Multi-Factor Authentication
                </h2>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-4">
                  <div>
                    <p className="text-sm font-medium text-cyber-bright">
                      Authenticator App (TOTP)
                    </p>
                    <p className="mt-0.5 text-xs text-cyber-muted">
                      {mfaEnabled
                        ? 'MFA is active. Your account is protected with a second factor.'
                        : 'MFA is disabled. Enable it for stronger account security.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleSecurity('mfa')}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      mfaEnabled
                        ? 'border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/10'
                        : 'bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30'
                    }`}
                  >
                    {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                  </button>
                </div>

                {!mfaEnabled && (
                  <p className="mt-3 text-xs text-cyber-yellow">
                    ⚠ Your account is less secure without MFA. We strongly recommend enabling it.
                  </p>
                )}
              </section>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}