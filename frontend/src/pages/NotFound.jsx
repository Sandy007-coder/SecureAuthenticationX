import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center px-4 scan-overlay">

      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-cyber-red/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md animate-slide-up">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl
                        bg-cyber-red/10 border border-cyber-red/40 mb-6 shadow-neon-red">
          <AlertTriangle size={40} className="text-cyber-red" />
        </div>

        {/* 404 */}
        <div className="font-display text-8xl font-black text-cyber-red mb-2" style={{
          textShadow: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)',
        }}>
          404
        </div>

        <h1 className="font-display text-2xl font-bold text-cyber-bright mb-3">
          ACCESS DENIED
        </h1>

        <p className="text-cyber-muted text-sm mb-2 font-mono-code">
          ERROR_CODE: ROUTE_NOT_FOUND
        </p>

        <p className="text-cyber-text text-sm mb-8 leading-relaxed">
          The resource you requested does not exist or has been classified.
          Your access attempt has been logged.
        </p>

        {/* Fake terminal */}
        <div className="glass-card border border-cyber-border/60 rounded-lg p-4 text-left mb-8 font-mono-code text-xs">
          <p className="text-cyber-muted mb-1">$ trace-route --target <span className="text-cyber-blue">unknown</span></p>
          <p className="text-cyber-red">✗ Destination unreachable</p>
          <p className="text-cyber-muted mt-1">$ sys-status</p>
          <p className="text-cyber-green">✓ All other systems nominal</p>
          <p className="text-cyber-blue mt-1">▶ Recommend: return to dashboard</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-cyber gap-2 w-full sm:w-auto">
            <Shield size={16} /> Return to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-cyber-muted
                       hover:text-cyber-bright transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        {/* Brand */}
        <div className="mt-12 flex items-center justify-center gap-2 text-cyber-muted">
          <Shield size={14} className="text-cyber-blue" />
          <span className="font-display text-xs tracking-widest">SECUREAUTHX</span>
        </div>
      </div>
    </div>
  );
}
