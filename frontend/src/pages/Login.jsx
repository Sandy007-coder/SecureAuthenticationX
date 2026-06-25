import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
} from 'lucide-react';

import { authApi } from '../services/api.js';
import { useAuth } from '../App.jsx';

const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = {};

    if (!credentials.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(credentials.email)) {
      errors.email = 'Enter a valid email.';
    }

    if (!credentials.password) {
      errors.password = 'Password is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = ({ target }) => {
    const { name, value } = target;

    setCredentials((current) => ({ ...current, [name]: value }));

    if (validationErrors[name]) {
      setValidationErrors((current) => ({ ...current, [name]: '' }));
    }

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await authApi.login({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      login(data.user);

      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message;
      const status = error?.response?.status;

      if (status === 429) {
        setErrorMessage('Too many attempts. Please wait a moment before trying again.');
      } else {
        setErrorMessage(message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cyber-bg px-4">
      <div className="scan-overlay pointer-events-none absolute inset-0" />

      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="pointer-events-none fixed left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyber-blue/5 blur-3xl" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyber-accent/5 blur-3xl" />

      <div className="relative w-full max-w-md animate-slide-up">
        <header className="mb-8 text-center">
          <div
            className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl
                       border border-cyber-blue/40 bg-cyber-blue/10 shadow-neon"
          >
            <Shield size={32} className="text-cyber-blue" />
          </div>

          <h1 className="font-display text-2xl font-bold tracking-wider text-cyber-bright">
            SecureAuthenticationX
          </h1>

          <p className="mt-1 font-mono-code text-sm text-cyber-muted">
            ENTERPRISE AUTHENTICATION PLATFORM
          </p>
        </header>

        <section className="glass-card border border-cyber-border/60 p-8">
          <h2 className="mb-1 text-lg font-semibold text-cyber-bright">
            Sign In
          </h2>

          <p className="mb-6 text-sm text-cyber-muted">
            Authenticate to access your secure dashboard.
          </p>

          {errorMessage && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-cyber-red/40 bg-cyber-red/5 px-4 py-3">
              <AlertCircle size={16} className="flex-shrink-0 text-cyber-red" />
              <p className="text-sm text-cyber-red">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="mb-1.5 block font-mono-code text-xs uppercase tracking-widest text-cyber-muted">
                Email Address
              </label>

              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />

                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  placeholder="admin@securex.io"
                  autoComplete="email"
                  className={`input-cyber pl-9 ${validationErrors.email ? 'border-cyber-red' : ''}`}
                />
              </div>

              {validationErrors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-cyber-red">
                  <AlertCircle size={11} />
                  {validationErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-mono-code text-xs uppercase tracking-widest text-cyber-muted">
                Password
              </label>

              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />

                <input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`input-cyber pl-9 pr-10 ${validationErrors.password ? 'border-cyber-red' : ''}`}
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisible((current) => !current)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted transition-colors hover:text-cyber-blue"
                >
                  {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {validationErrors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-cyber-red">
                  <AlertCircle size={11} />
                  {validationErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cyber w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="30"
                      strokeDashoffset="10"
                    />
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

          <p className="mt-6 text-center text-sm text-cyber-muted">
            No account?{' '}
            <Link to="/register" className="font-medium text-cyber-blue transition-colors hover:text-cyber-glow">
              Create one
            </Link>
          </p>
        </section>

        <p className="mt-6 text-center font-mono-code text-xs text-cyber-muted">
          PROTECTED BY JWT · BCRYPT · HTTP-ONLY COOKIES
        </p>
      </div>
    </div>
  );
}