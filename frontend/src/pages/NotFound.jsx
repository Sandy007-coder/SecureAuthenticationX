import { Link, useLocation } from 'react-router-dom';
import { Shield, Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="scan-overlay flex min-h-screen items-center justify-center bg-cyber-bg px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-cyber-red/5 blur-3xl" />
      </div>

      <div className="relative max-w-md text-center animate-slide-up">
        <div
          className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl
                     border border-cyber-red/40 bg-cyber-red/10 shadow-neon-red"
        >
          <Compass size={40} className="text-cyber-red" />
        </div>

        <div
          className="mb-2 font-display text-8xl font-black text-cyber-red"
          style={{
            textShadow: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)',
          }}
        >
          404
        </div>

        <h1 className="mb-3 font-display text-2xl font-bold text-cyber-bright">
          ROUTE NOT FOUND
        </h1>

        <p className="mb-2 font-mono-code text-sm text-cyber-muted">
          ERROR_CODE: ROUTE_NOT_FOUND
        </p>

        <p className="mb-8 text-sm leading-relaxed text-cyber-text">
          The page you're looking for doesn't exist or may have been moved.
          Double-check the URL or head back to a known location.
        </p>

        <div className="glass-card mb-8 rounded-lg border border-cyber-border/60 p-4 text-left font-mono-code text-xs">
          <p className="mb-1 text-cyber-muted">
            $ trace-route --target{' '}
            <span className="break-all text-cyber-blue">{location.pathname}</span>
          </p>

          <p className="text-cyber-red">✗ Destination unreachable</p>

          <p className="mt-1 text-cyber-muted">$ sys-status</p>

          <p className="text-cyber-green">✓ All other systems nominal</p>

          <p className="mt-1 text-cyber-blue">
            ▶ Recommended action: return to dashboard
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/dashboard" className="btn-cyber w-full gap-2 sm:w-auto">
            <Shield size={16} />
            Return to Dashboard
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="flex w-full items-center justify-center gap-2 px-5 py-2.5
                       text-sm font-medium text-cyber-muted transition-colors
                       hover:text-cyber-bright sm:w-auto"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-cyber-muted">
          <Shield size={14} className="text-cyber-blue" />
          <span className="font-display text-xs tracking-widest">SecureAuthenticationX</span>
        </div>
      </div>
    </div>
  );
}