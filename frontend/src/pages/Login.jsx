import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api.js';
import { useAuth } from '../App.jsx';

export default function Login() {
  const navigate        = useNavigate();
  const { login }       = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.email)                         e.email    = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)                      e.password = 'Password is required.';
    else if (form.password.length < 6)       e.password = 'Minimum 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      login(data.user || data);
      navigate('/dashboard');
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4 relative">
     
      <div className="absolute inset-0 scan-overlay pointer-events-none"></div>

      {/* Grid decorative bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow blobs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-cyber-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-cyber-blue/10 border border-cyber-blue/40 mb-4 shadow-neon">
            <Shield size={32} className="text-cyber-blue" />
          </div>
          <h1 className="font-display text-2xl font-bold text-cyber-bright tracking-wider">
            SecureAuthX
          </h1>
          <p className="text-cyber-muted text-sm mt-1 font-mono-code">
            ENTERPRISE AUTHENTICATION PLATFORM
          </p>
        </div>

        {/* Card */}
        <div className="glass-card border border-cyber-border/60 p-8">
          <h2 className="text-lg font-semibold text-cyber-bright mb-1">Sign In</h2>
          <p className="text-cyber-muted text-sm mb-6">Authenticate to access your secure dashboard.</p>

          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2 rounded-lg border border-cyber-red/40 bg-cyber-red/5 px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-cyber-red flex-shrink-0" />
              <p className="text-cyber-red text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@securex.io"
                  className={`input-cyber pl-9 ${errors.email ? 'border-cyber-red' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-cyber pl-9 pr-10 ${errors.password ? 'border-cyber-red' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-blue transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                <>
                  <Shield size={16} />
                  Secure Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-cyber-muted">
            No account?{' '}
            <Link
              to="/register"
              className="text-cyber-blue hover:text-cyber-glow transition-colors font-medium"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Bottom label */}
        <p className="mt-6 text-center text-xs text-cyber-muted font-mono-code">
          PROTECTED BY AES-256 · TLS 1.3 · ZERO-TRUST ARCHITECTURE
        </p>
      </div>
    </div>
  );
}
