import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  XCircle,
} from 'lucide-react';

const DEVICE_CONFIG = {
  desktop: {
    Icon: Monitor,
    iconClass: 'text-cyber-blue',
  },
  mobile: {
    Icon: Smartphone,
    iconClass: 'text-cyber-accent',
  },
  unknown: {
    Icon: Globe,
    iconClass: 'text-cyber-muted',
  },
};

const STATUS_CONFIG = {
  success: {
    Icon: CheckCircle,
    className: 'badge-green',
    label: 'Success',
  },
  failed: {
    Icon: XCircle,
    className: 'badge-red',
    label: 'Failed',
  },
  pending: {
    Icon: Clock,
    className: 'badge-yellow',
    label: 'Pending',
  },
  suspicious: {
    Icon: AlertTriangle,
    className: 'badge-red',
    label: 'Suspicious',
  },
};

const SORTABLE_COLUMNS = [
  { key: 'user', label: 'User' },
  { key: 'ip', label: 'IP Address' },
  { key: 'location', label: 'Location' },
  { key: 'device', label: 'Device' },
  { key: 'status', label: 'Status' },
  { key: 'timestamp', label: 'Time' },
];

function DeviceIndicator({ device }) {
  const { Icon, iconClass } = DEVICE_CONFIG[device] ?? DEVICE_CONFIG.unknown;

  return (
    <span className="flex items-center gap-1.5">
      <Icon size={14} className={iconClass} />
      <span className="capitalize text-cyber-muted">
        {device || 'unknown'}
      </span>
    </span>
  );
}

function StatusBadge({ status }) {
  const { Icon, className, label } = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span className={className}>
      <Icon size={10} />
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={`skeleton-${index}`}
          className="h-12 animate-pulse rounded-lg bg-cyber-surface/60"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-10 text-center text-cyber-muted">
      <Globe size={32} className="mx-auto mb-2 opacity-40" />
      <p className="text-sm">No login activity recorded.</p>
    </div>
  );
}

function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown size={12} className="opacity-40" />;
  return direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
}

export default function LoginActivityTable({
  activities = [],
  loading = false,
}) {
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortedActivities = useMemo(() => {
    const sorted = [...activities];

    sorted.sort((a, b) => {
      const aVal = (a[sortKey] ?? '').toString().toLowerCase();
      const bVal = (b[sortKey] ?? '').toString().toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [activities, sortKey, sortDirection]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (activities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyber-border/50">
            {SORTABLE_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="pb-3 pr-4 text-left font-mono-code text-xs font-semibold uppercase tracking-widest text-cyber-muted"
              >
                <button
                  type="button"
                  onClick={() => handleSort(key)}
                  className="flex items-center gap-1 transition-colors hover:text-cyber-bright"
                >
                  {label}
                  <SortIcon active={sortKey === key} direction={sortDirection} />
                </button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-cyber-border/30">
          {sortedActivities.map((activity, index) => (
            <tr
              key={activity.id ?? `${activity.ip}-${activity.timestamp}-${index}`}
              className="transition-colors duration-150 hover:bg-cyber-blue/5"
            >
              <td className="py-3 pr-4 font-medium text-cyber-bright">
                {activity.user || 'Unknown'}
              </td>

              <td className="py-3 pr-4 font-mono-code text-xs text-cyber-blue">
                {activity.ip || '—'}
              </td>

              <td className="py-3 pr-4 text-cyber-text">
                {activity.location || 'Unknown'}
              </td>

              <td className="py-3 pr-4">
                <DeviceIndicator device={activity.device} />
              </td>

              <td className="py-3 pr-4">
                <StatusBadge status={activity.status} />
              </td>

              <td className="whitespace-nowrap py-3 text-xs font-mono-code text-cyber-muted">
                {activity.timestamp || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}