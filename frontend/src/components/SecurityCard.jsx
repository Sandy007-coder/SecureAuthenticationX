import React from 'react';

/**
 * SecurityCard
 * A glassmorphism analytics card for the dashboard.
 *
 * Props:
 *   icon      — JSX element (Lucide icon)
 *   label     — small uppercase label string
 *   value     — large metric value (string | number)
 *   sub       — optional sub-text
 *   accent    — 'blue' | 'green' | 'red' | 'yellow'  (default 'blue')
 *   trend     — optional '↑ 12%' type string
 *   trendUp   — boolean; true = green, false = red
 */
export default function SecurityCard({
  icon,
  label,
  value,
  sub,
  accent = 'blue',
  trend,
  trendUp,
}) {
  const accentMap = {
    blue:   { border: 'border-cyber-blue/40',   glow: 'shadow-neon',       icon: 'text-cyber-blue',   bg: 'bg-cyber-blue/10' },
    green:  { border: 'border-cyber-green/40',  glow: 'shadow-neon-green', icon: 'text-cyber-green',  bg: 'bg-cyber-green/10' },
    red:    { border: 'border-cyber-red/40',    glow: 'shadow-neon-red',   icon: 'text-cyber-red',    bg: 'bg-cyber-red/10' },
    yellow: { border: 'border-cyber-yellow/40', glow: '',                  icon: 'text-cyber-yellow', bg: 'bg-cyber-yellow/10' },
  };

  const a = accentMap[accent] || accentMap.blue;

  return (
    <div
      className={`glass-card border ${a.border} ${a.glow} p-5 flex flex-col gap-4
                  hover:-translate-y-1 hover:${a.glow} transition-all duration-300 animate-slide-up`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-lg ${a.bg}`}>
          <span className={a.icon}>{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold font-mono-code px-2 py-0.5 rounded-full
                        ${trendUp
                          ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                          : 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30'
                        }`}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Metric */}
      <div>
        <p className="text-cyber-muted text-xs tracking-widest uppercase mb-1 font-mono-code">{label}</p>
        <p className={`text-3xl font-bold font-display ${a.icon}`}>{value}</p>
        {sub && <p className="text-cyber-muted text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}
