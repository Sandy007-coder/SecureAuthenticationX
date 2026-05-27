import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Info, CheckCircle, X } from 'lucide-react';

/**
 * AlertBanner
 * Props:
 *   type    — 'warning' | 'danger' | 'info' | 'success'
 *   title   — bold heading text
 *   message — body text
 *   onDismiss — optional callback; if provided a close button is shown
 */
export default function AlertBanner({ type = 'warning', title, message, onDismiss }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const config = {
    warning: {
      icon:        <AlertTriangle size={18} />,
      containerCls: 'border-cyber-yellow/40 bg-cyber-yellow/5',
      iconCls:     'text-cyber-yellow',
      titleCls:    'text-cyber-yellow',
      dot:         'bg-cyber-yellow',
    },
    danger: {
      icon:        <ShieldAlert size={18} />,
      containerCls: 'border-cyber-red/40 bg-cyber-red/5',
      iconCls:     'text-cyber-red',
      titleCls:    'text-cyber-red',
      dot:         'bg-cyber-red',
    },
    info: {
      icon:        <Info size={18} />,
      containerCls: 'border-cyber-blue/40 bg-cyber-blue/5',
      iconCls:     'text-cyber-blue',
      titleCls:    'text-cyber-blue',
      dot:         'bg-cyber-blue',
    },
    success: {
      icon:        <CheckCircle size={18} />,
      containerCls: 'border-cyber-green/40 bg-cyber-green/5',
      iconCls:     'text-cyber-green',
      titleCls:    'text-cyber-green',
      dot:         'bg-cyber-green',
    },
  }[type];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={`relative flex items-start gap-3 rounded-lg border px-4 py-3 animate-fade-in ${config.containerCls}`}
      role="alert"
    >
      {/* Pulsing dot */}
      <span className="mt-0.5 flex-shrink-0 relative">
        <span className={`absolute inline-flex h-2 w-2 rounded-full ${config.dot} animate-ping opacity-75`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>

      {/* Icon */}
      <span className={`flex-shrink-0 mt-0.5 ${config.iconCls}`}>{config.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title   && <p className={`text-sm font-semibold ${config.titleCls}`}>{title}</p>}
        {message && <p className="text-cyber-text text-sm mt-0.5 leading-relaxed">{message}</p>}
      </div>

      {/* Dismiss */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-cyber-muted hover:text-cyber-bright transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
