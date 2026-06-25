import { useMemo, useState } from 'react';
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

const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const SPECIAL_CHAR_PATTERN = /[!@#$%^&*(),.?":{}|<>_\-\\/[\]+=~`';]/;

const STRENGTH_LABELS = [
  { label: '', color: '' },
  { label: 'Weak', color: 'bg-cyber-red' },
  { label: 'Weak', color: 'bg-cyber-red' },
  { label: 'Fair', color: 'bg-cyber-yellow' },
  { label: 'Good', color: 'bg-cyber-accent' },
  { label: 'Strong', color: 'bg-cyber-green' },
];

const STRENGTH_TEXT_COLOR = [
  '',
  'text-cyber-red',
  'text-cyber-red',
  'text-cyber-yellow',
  'text-cyber-accent',
  'text-cyber-green',
];

function getPasswordStrength(password) {
  if (!password) {
    return { score: 0, label: '', color: '', textColor: '' };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 16) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (SPECIAL_CHAR_PATTERN.test(password)) score += 1;

  return {
    score,
    label: STRENGTH_LABELS[score].label,
    color: STRENGTH_LABELS[score].color,
    textColor: STRENGTH_TEXT_COLOR[score],
  };
}

function validatePasswordPolicy(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'At least 8 characters required.';
  if (password.length > 128) return 'Must not exceed 128 characters.';
  if (!/[A-Z]/.test(password)) return 'Add at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add at least one lowercase letter.';
  if (!/\d/.test(password)) return 'Add at least one digit.';
  if (!SPECIAL_CHAR_PATTERN.test(password)) return 'Add at least one special character.';
  return '';
}

const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, value, error, onChange }) => (
  <div>
    <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
      {label}
    </label>

    <div className="relative">
      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted pointer-events-none" />

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`input-cyber pl-10 ${error ? 'border-cyber-red' : ''}`}
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

export default function Register() {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formValues.password),
    [formValues.password]
  );

  const handleInputChange = ({ target: { name, value } }) => {
    setFormValues((current) => ({ ...current, [name]: value }));

    setValidationErrors((current) => ({ ...current, [name]: '' }));

    if (requestError) setRequestError('');
  };

  const validateForm = () => {
    const errors = {};

    const username = formValues.username.trim();
    if (!username || username.length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (username.length > 30) {
      errors.username = 'Username must not exceed 30 characters.';
    } else if (!USERNAME_PATTERN.test(username)) {
      errors.username = 'Only letters, numbers, and underscores allowed.';
    } else if (username.startsWith('_') || username.endsWith('_')) {
      errors.username = 'Cannot start or end with an underscore.';
    }

    if (!EMAIL_PATTERN.test(formValues.email)) {
      errors.email = 'Enter a valid email address.';
    }

    const passwordError = validatePasswordPolicy(formValues.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (formValues.password !== formValues.confirm) {
      errors.confirm = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    setRequestError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.register({
        username: formValues.username.trim(),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
      });

      setSuccessMessage('Account created successfully! Redirecting to sign in…');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 409) {
        setRequestError('An account with this email already exists.');
      } else if (status === 422) {
        setRequestError(message || 'Please check your details and try again.');
      } else if (status === 429) {
        setRequestError('Too many attempts. Please wait a moment before trying again.');
      } else {
        setRequestError(message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 scan-overlay pointer-events-none" />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="fixed top-1/3 right-1/4 w-80 h-80 bg-cyber-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/40 mb-4 shadow-neon">
            <Shield size={32} className="text-cyber-blue" />
          </div>

          <h1 className="font-display text-2xl font-bold text-cyber-bright tracking-wider">
            SecureAuthenticationX
          </h1>

          <p className="text-cyber-muted text-sm mt-1 font-mono-code">
            CREATE SECURE ACCOUNT
          </p>
        </div>

        <div className="glass-card border border-cyber-border/60 p-8">
          <h2 className="text-lg font-semibold text-cyber-bright mb-1">
            Register
          </h2>

          <p className="text-cyber-muted text-sm mb-6">
            Set up your enterprise authentication credentials.
          </p>

          {requestError && (
            <div className="flex items-center gap-2 rounded-lg border border-cyber-red/40 bg-cyber-red/5 px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-cyber-red flex-shrink-0" />
              <p className="text-cyber-red text-sm">{requestError}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-cyber-green/40 bg-cyber-green/5 px-4 py-3 mb-5">
              <CheckCircle size={16} className="text-cyber-green flex-shrink-0" />
              <p className="text-cyber-green text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleRegistration} className="space-y-5" noValidate>
            <InputField
              name="username"
              label="Username"
              placeholder="john_doe"
              icon={User}
              value={formValues.username}
              onChange={handleInputChange}
              error={validationErrors.username}
            />

            <InputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="admin@securex.io"
              icon={Mail}
              value={formValues.email}
              onChange={handleInputChange}
              error={validationErrors.email}
            />

            <div>
              <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
                Password
              </label>

              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formValues.password}
                  onChange={handleInputChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`input-cyber pl-10 pr-10 ${validationErrors.password ? 'border-cyber-red' : ''}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {validationErrors.password && (
                <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
                  <AlertCircle size={11} />
                  {validationErrors.password}
                </p>
              )}

              {formValues.password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((segment) => (
                      <div
                        key={segment}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          segment <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-cyber-border/40'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-cyber-muted font-mono-code">
                    Strength:{' '}
                    <span className={`font-semibold ${passwordStrength.textColor}`}>
                      {passwordStrength.label || '—'}
                    </span>
                  </p>
                </div>
              )}

              <p className="mt-2 text-xs text-cyber-muted">
                Must be 8+ characters with uppercase, lowercase, a digit, and a special character.
              </p>
            </div>

            <div>
              <label className="block text-xs text-cyber-muted tracking-widest uppercase mb-1.5 font-mono-code">
                Confirm Password
              </label>

              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />

                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm"
                  value={formValues.confirm}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`input-cyber pl-10 pr-10 ${validationErrors.confirm ? 'border-cyber-red' : ''}`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-blue transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {validationErrors.confirm && (
                <p className="mt-1 text-xs text-cyber-red flex items-center gap-1">
                  <AlertCircle size={11} />
                  {validationErrors.confirm}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-cyber py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account…' : 'Create Secure Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-cyber-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-cyber-blue hover:text-cyber-glow">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}