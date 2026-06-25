import { ShieldCheck } from 'lucide-react';

const SIZE_CONFIG = {
  sm: {
    icon: 24,
    container: 'w-12 h-12',
    text: 'text-xs',
  },
  md: {
    icon: 36,
    container: 'w-20 h-20',
    text: 'text-sm',
  },
  lg: {
    icon: 52,
    container: 'w-32 h-32',
    text: 'text-base',
  },
};

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading…',
  fullScreen = false,
}) {
  const { icon: iconSize, container: containerSize, text: textSize } =
    SIZE_CONFIG[size] ?? SIZE_CONFIG.md;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${containerSize}`}>

        <span className="absolute inset-0 rounded-full border-2 border-cyber-blue/30 animate-ping" />

        <span className="absolute inset-0 rounded-full border-2 border-cyber-border/40" />

        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full animate-spin"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#spinner-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset="140"
          />
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck size={iconSize} className="text-cyber-blue" />
        </div>
      </div>

      {message && (
        <p className={`animate-pulse font-mono-code uppercase tracking-widest text-cyber-muted ${textSize}`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}