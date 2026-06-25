import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
  X,
} from 'lucide-react';

const ALERT_VARIANTS = {
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-cyber-yellow/40 bg-cyber-yellow/5',
    iconClass: 'text-cyber-yellow',
    titleClass: 'text-cyber-yellow',
    indicatorClass: 'bg-cyber-yellow',
  },
  danger: {
    icon: ShieldAlert,
    containerClass: 'border-cyber-red/40 bg-cyber-red/5',
    iconClass: 'text-cyber-red',
    titleClass: 'text-cyber-red',
    indicatorClass: 'bg-cyber-red',
  },
  info: {
    icon: Info,
    containerClass: 'border-cyber-blue/40 bg-cyber-blue/5',
    iconClass: 'text-cyber-blue',
    titleClass: 'text-cyber-blue',
    indicatorClass: 'bg-cyber-blue',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'border-cyber-green/40 bg-cyber-green/5',
    iconClass: 'text-cyber-green',
    titleClass: 'text-cyber-green',
    indicatorClass: 'bg-cyber-green',
  },
};

ALERT_VARIANTS.error = ALERT_VARIANTS.danger;

export default function AlertBanner({
  type = 'warning',
  title,
  message,
  onDismiss,
  autoDismiss = false,
  autoDismissMs = 5000,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [title, message]);

  useEffect(() => {
    if (!autoDismiss || !isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismiss, autoDismissMs, isVisible, onDismiss]);

  if (!isVisible || (!title && !message)) {
    return null;
  }

  const variant = ALERT_VARIANTS[type] ?? ALERT_VARIANTS.warning;
  const Icon = variant.icon;

  const dismissBanner = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-lg border px-4 py-3 animate-fade-in ${variant.containerClass}`}
    >
      <span className="relative mt-0.5 flex-shrink-0">
        <span
          className={`absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping ${variant.indicatorClass}`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${variant.indicatorClass}`}
        />
      </span>

      <span className={`mt-0.5 flex-shrink-0 ${variant.iconClass}`}>
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        {title && (
          <p className={`text-sm font-semibold ${variant.titleClass}`}>
            {title}
          </p>
        )}

        {message && (
          <p className="mt-0.5 text-sm leading-relaxed text-cyber-text">
            {message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={dismissBanner}
        aria-label="Dismiss"
        className="flex-shrink-0 text-cyber-muted transition-colors hover:text-cyber-bright"
      >
        <X size={16} />
      </button>
    </div>
  );
}