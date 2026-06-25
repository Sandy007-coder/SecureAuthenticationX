const ACCENT_STYLES = {
  blue: {
    borderClass: 'border-cyber-blue/40',
    shadowClass: 'shadow-neon',
    hoverShadowClass: 'hover:shadow-neon',
    iconClass: 'text-cyber-blue',
    backgroundClass: 'bg-cyber-blue/10',
  },
  green: {
    borderClass: 'border-cyber-green/40',
    shadowClass: 'shadow-neon-green',
    hoverShadowClass: 'hover:shadow-neon-green',
    iconClass: 'text-cyber-green',
    backgroundClass: 'bg-cyber-green/10',
  },
  red: {
    borderClass: 'border-cyber-red/40',
    shadowClass: 'shadow-neon-red',
    hoverShadowClass: 'hover:shadow-neon-red',
    iconClass: 'text-cyber-red',
    backgroundClass: 'bg-cyber-red/10',
  },
  yellow: {
    borderClass: 'border-cyber-yellow/40',
    shadowClass: '',
    hoverShadowClass: '',
    iconClass: 'text-cyber-yellow',
    backgroundClass: 'bg-cyber-yellow/10',
  },
};

export default function SecurityCard({
  icon,
  label,
  value,
  sub,
  accent = 'blue',
  trend,
  trendUp,
  onClick,
}) {
  const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.blue;

  const trendClass = trendUp
    ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
    : 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30';

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`
        glass-card flex w-full flex-col gap-4 border p-5 text-left
        transition-all duration-300 animate-slide-up
        hover:-translate-y-1
        ${styles.borderClass}
        ${styles.shadowClass}
        ${styles.hoverShadowClass}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${styles.backgroundClass}`}>
          <span className={styles.iconClass}>
            {icon}
          </span>
        </div>

        {trend && (
          <span
            className={`
              rounded-full px-2 py-0.5
              font-mono-code text-xs font-semibold
              ${trendClass}
            `}
          >
            {trend}
          </span>
        )}
      </div>

      <div>
        <p className="mb-1 font-mono-code text-xs uppercase tracking-widest text-cyber-muted">
          {label}
        </p>

        <p className={`font-display text-3xl font-bold ${styles.iconClass}`}>
          {value}
        </p>

        {sub && (
          <p className="mt-1 text-xs text-cyber-muted">
            {sub}
          </p>
        )}
      </div>
    </Wrapper>
  );
}