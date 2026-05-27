import React from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * LoadingSpinner
 * Props:
 *   size    — 'sm' | 'md' | 'lg'  (default 'md')
 *   message — optional string shown below the spinner
 */
export default function LoadingSpinner({ size = 'md', message = 'Loading…' }) {
  const iconSize = { sm: 24, md: 36, lg: 52 }[size];
  const ringSize = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-32 h-32' }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Animated ring */}
      <div className={`relative ${ringSize}`}>
        {/* Outer pulsing ring */}
        <span
          className="absolute inset-0 rounded-full border-2 border-cyber-blue/30"
          style={{ animation: 'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite' }}
        />
        {/* Spinning arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="url(#spinGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset="140"
          />
          <defs>
            <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck size={iconSize} className="text-cyber-blue" />
        </div>
      </div>

      {/* Message */}
      {message && (
        <p className="text-cyber-muted text-sm font-mono-code tracking-widest uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
