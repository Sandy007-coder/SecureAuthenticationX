import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Globe,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

const ALL_ALERTS = [
  {
    id: 'ALRT-1001',
    title: 'Brute-Force Attack Detected',
    description: '18 failed login attempts detected from IP 203.0.113.42 within 10 minutes.',
    severity: 'Critical',
    status: 'Open',
    time: '2 minutes ago',
    sourceIp: '203.0.113.42',
    attackType: 'Credential Attack',
  },
  {
    id: 'ALRT-1002',
    title: 'Unusual Location Sign-In',
    description: 'New login detected from Singapore on account diana@corp.io.',
    severity: 'High',
    status: 'Investigating',
    time: '5 minutes ago',
    sourceIp: '45.77.182.91',
    attackType: 'Account Takeover',
  },
  {
    id: 'ALRT-1003',
    title: 'Suspicious API Activity',
    description: 'Abnormal API request pattern detected from external endpoint.',
    severity: 'Medium',
    status: 'Resolved',
    time: '20 minutes ago',
    sourceIp: '198.51.100.21',
    attackType: 'API Abuse',
  },
  {
    id: 'ALRT-1004',
    title: 'Privilege Escalation Attempt',
    description: 'User account attempted to access admin endpoints without authorization.',
    severity: 'Critical',
    status: 'Open',
    time: '35 minutes ago',
    sourceIp: '10.0.0.45',
    attackType: 'Privilege Escalation',
  },
  {
    id: 'ALRT-1005',
    title: 'Malware Signature Detected',
    description: 'Known ransomware signature found in uploaded file on storage endpoint.',
    severity: 'Critical',
    status: 'Investigating',
    time: '1 hour ago',
    sourceIp: '172.16.0.12',
    attackType: 'Malware',
  },
  {
    id: 'ALRT-1006',
    title: 'Expired Token Reuse Attempt',
    description: 'Revoked JWT token was presented to the authentication service.',
    severity: 'Medium',
    status: 'Resolved',
    time: '2 hours ago',
    sourceIp: '192.168.1.88',
    attackType: 'Token Abuse',
  },
];

const severityStyles = {
  Critical: 'bg-cyber-red/20 text-cyber-red border-cyber-red/30',
  High: 'bg-cyber-yellow/20 text-cyber-yellow border-cyber-yellow/30',
  Medium: 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30',
};

const statusStyles = {
  Open: 'text-cyber-red',
  Investigating: 'text-cyber-yellow',
  Resolved: 'text-cyber-green',
};

const statusDotStyles = {
  Open: 'bg-cyber-red',
  Investigating: 'bg-cyber-yellow',
  Resolved: 'bg-cyber-green',
};

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2 };

export default function Alerts() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('severity');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filtered = useMemo(() => {
    let result = [...ALL_ALERTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.sourceIp.includes(q) ||
          a.attackType.toLowerCase().includes(q)
      );
    }

    if (filterSeverity !== 'All') {
      result = result.filter((a) => a.severity === filterSeverity);
    }

    if (filterStatus !== 'All') {
      result = result.filter((a) => a.status === filterStatus);
    }

    if (sortBy === 'severity') {
      result.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    } else if (sortBy === 'time') {
      result.sort((a, b) => a.time.localeCompare(b.time));
    } else if (sortBy === 'status') {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [search, filterSeverity, filterStatus, sortBy]);

  const stats = useMemo(() => ({
    total: ALL_ALERTS.length,
    critical: ALL_ALERTS.filter((a) => a.severity === 'Critical').length,
    investigating: ALL_ALERTS.filter((a) => a.status === 'Investigating').length,
    resolved: ALL_ALERTS.filter((a) => a.status === 'Resolved').length,
  }), []);

  return (
    <div className="space-y-6 p-6 lg:p-8">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ShieldAlert size={38} className="text-cyber-red" />
          <div>
            <h1 className="text-3xl font-bold text-cyber-bright lg:text-4xl">
              Security Alerts Center
            </h1>
            <p className="text-cyber-muted">
              Monitor incidents, authentication threats, suspicious activities and system events.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-cyber-border/50 px-4 py-2 text-sm text-cyber-muted hover:border-cyber-blue/40 hover:text-cyber-blue transition-all"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Alerts"
          value={stats.total}
          icon={<AlertTriangle size={22} className="text-cyber-yellow" />}
        />
        <StatCard
          title="Critical"
          value={stats.critical}
          icon={<ShieldAlert size={22} className="text-cyber-red" />}
          highlight="red"
        />
        <StatCard
          title="Investigating"
          value={stats.investigating}
          icon={<Globe size={22} className="text-cyber-yellow" />}
          highlight="yellow"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle size={22} className="text-cyber-green" />}
          highlight="green"
        />
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap gap-3">

          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, IP, attack type, ID..."
              className="
                w-full rounded-lg border border-cyber-border/50
                bg-cyber-surface/40 py-2 pl-9 pr-4
                text-sm text-cyber-bright placeholder:text-cyber-muted
                focus:border-cyber-blue/60 focus:outline-none
              "
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={15} className="text-cyber-muted" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-lg border border-cyber-border/50 bg-cyber-surface px-3 py-2 text-sm text-cyber-bright focus:border-cyber-blue/60 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-cyber-border/50 bg-cyber-surface px-3 py-2 text-sm text-cyber-bright focus:border-cyber-blue/60 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-cyber-border/50 bg-cyber-surface px-3 py-2 text-sm text-cyber-bright focus:border-cyber-blue/60 focus:outline-none"
          >
            <option value="severity">Sort: Severity</option>
            <option value="time">Sort: Time</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="border-b border-cyber-border/50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-cyber-bright">Active Security Events</h2>
          <span className="text-sm text-cyber-muted">
            {filtered.length} of {ALL_ALERTS.length} alerts
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldAlert size={40} className="mb-3 text-cyber-muted" />
            <p className="text-cyber-muted">No alerts match your current filters.</p>
            <button
              onClick={() => { setSearch(''); setFilterSeverity('All'); setFilterStatus('All'); }}
              className="mt-3 text-sm text-cyber-blue hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            {filtered.map((alert) => (
              <div
                key={alert.id}
                className="border-b border-cyber-border/30 p-6 hover:bg-cyber-surface/40 transition-colors"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${statusDotStyles[alert.status]}`} />

                      <h3 className="font-semibold text-cyber-bright">{alert.title}</h3>

                      <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${severityStyles[alert.severity]}`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-cyber-muted">{alert.description}</p>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-cyber-muted">
                      <span>ID: <span className="font-mono text-cyber-bright">{alert.id}</span></span>
                      <span>IP: <span className="font-mono text-cyber-bright">{alert.sourceIp}</span></span>
                      <span>Type: <span className="text-cyber-bright">{alert.attackType}</span></span>
                      <span>{alert.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${statusStyles[alert.status]}`}>
                      {alert.status}
                    </span>

                    <button
                      onClick={() => navigate(`/alerts/${alert.id}`)}
                      className="flex items-center gap-2 rounded-lg border border-cyber-blue/40 px-4 py-2 text-sm text-cyber-blue hover:bg-cyber-blue/10 transition-all"
                    >
                      View Details
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, highlight }) {
  const borderColor = {
    red: 'border-cyber-red/30',
    yellow: 'border-cyber-yellow/30',
    green: 'border-cyber-green/30',
  }[highlight] ?? 'border-cyber-border/50';

  return (
    <div className={`glass-card rounded-xl p-5 border ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-cyber-muted">{title}</p>
          <h3 className="mt-1 text-3xl font-bold text-cyber-bright">{value}</h3>
        </div>
        {icon}
      </div>
    </div>
  );
}