import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import { authApi } from '../services/api.js';

/* ───────────────────────────────────────────────────────── */
/* Password Strength */
/* ───────────────────────────────────────────────────────── */

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };

  let score = 0;

  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    { label: '', color: 'bg-cyber-border' },
    { label: 'Weak', color: 'bg-cyber-red' },
    { label: 'Fair', color: 'bg-cyber-yellow' },
    { label: 'Good', color: 'bg-cyber-accent' },
    { label: 'Strong', color: 'bg-cyber-green' },
  ];

  return { score, ...map[score] };
}

/* ───────────────────────────────────────────────────────── */
/* Reusable Field Component */
/* ───────────────────────────────────────────────────────── */

function Field({
  name,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
}) {
  return (
    <div>
      <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted pointer-events-none"
        />

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className={`input-cyber pl-10 ${
            error ? 'border-red-500' : ''
          }`}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────── */
/* Register Component */
/* ───────────────────────────────────────────────────────── */

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);

  /* ───────────────────────────────────────────────────── */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  /* ───────────────────────────────────────────────────── */

  const validate = () => {
    const e = {};

    if (!form.username || form.username.length < 3) {
      e.username = 'Username must be at least 3 characters.';
    }

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }

    if (!form.password || form.password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }

    if (form.password !== form.confirm) {
      e.confirm = 'Passwords do not match.';
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  /* ───────────────────────────────────────────────────── */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError('');
    setApiSuccess('');

    if (!validate()) return;

    setLoading(true);

    try {
      await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setApiSuccess('Account created successfully!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 scan-overlay pointer-events-none"></div>

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="fixed top-1/3 right-1/4 w-80 h-80 bg-cyber-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main */}
      <div className="relative w-full max-w-md animate-slide-up z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/40 mb-4 shadow-neon">
            <Shield size={32} className="text-cyber-blue" />
          </div>

          <h1 className="font-display text-2xl font-bold text-cyber-bright tracking-wider">
            SecureAuthX
          </h1>

          <p className="text-cyber-muted text-sm mt-1 font-mono-code">
            CREATE SECURE ACCOUNT
          </p>
        </div>

        {/* Card */}
        <div className="glass-card border border-cyber-border/60 p-8">
          <h2 className="text-lg font-semibold text-cyber-bright mb-1">
            Register
          </h2>

          <p className="text-cyber-muted text-sm mb-6">
            Set up your enterprise authentication credentials.
          </p>

          {/* Errors */}
          {apiError && (
            <div className="flex items-center gap-2 rounded-lg border border-cyber-red/40 bg-cyber-red/5 px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-cyber-red" />
              <p className="text-cyber-red text-sm">{apiError}</p>
            </div>
          )}

          {/* Success */}
          {apiSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-cyber-green/40 bg-cyber-green/5 px-4 py-3 mb-5">
              <CheckCircle size={16} className="text-cyber-green" />
              <p className="text-cyber-green text-sm">{apiSuccess}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              name="username"
              label="Username"
              placeholder="john_doe"
              icon={User}
              value={form.username}
              onChange={handleChange}
              error={errors.username}
            />

            <Field
              name="email"
              label="Email Address"
              type="email"
              placeholder="admin@securex.io"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* Password */}
            <div>
              <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted"
                />

                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`input-cyber pl-10 pr-10 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-blue transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error */}
              {errors.password && (
                <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.password}
                </p>
              )}

              {/* Password Strength Meter */}
              {form.password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score
                            ? strength.color
                            : 'bg-cyber-border/40'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-cyber-muted font-mono-code">
                    Strength:{' '}
                    <span
                      className={`font-semibold ${
                        strength.score <= 1
                          ? 'text-cyber-red'
                          : strength.score === 2
                          ? 'text-cyber-yellow'
                          : strength.score === 3
                          ? 'text-cyber-accent'
                          : 'text-cyber-green'
                      }`}
                    >
                      {strength.label || '—'}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted"
                />

                <input
                  type={showCon ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`input-cyber pl-10 pr-10 ${
                    errors.confirm ? 'border-red-500' : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowCon(!showCon)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-blue transition-colors"
                >
                  {showCon ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.confirm && (
                <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
                  <AlertCircle size={11} />
                  {errors.confirm}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber py-3"
            >
              {loading ? 'Creating account...' : 'Create Secure Account'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-cyber-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyber-blue hover:text-cyber-glow"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}