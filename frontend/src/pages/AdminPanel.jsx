import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Lock,
  RefreshCw,
  ShieldAlert,
  Unlock,
  Users,
} from 'lucide-react';

import AlertBanner from '../components/AlertBanner.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Navbar from '../components/Navbar.jsx';
import SecurityCard from '../components/SecurityCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { adminApi } from '../services/api.js';

const TABLE_HEADERS = ['Event', 'User', 'IP Address', 'Time', 'Severity'];

function resolveSeverity(eventType = '') {
  const type = eventType.toUpperCase();

  if (type.includes('LOCKED') || type.includes('BREACH')) return 'critical';
  if (type.includes('FAILURE') || type.includes('DENIED') || type.includes('INACTIVE')) return 'high';
  if (type.includes('CHANGED') || type.includes('UPDATED') || type.includes('ROLE')) return 'medium';
  return 'low';
}

const SEVERITY_STYLES = {
  critical: 'badge-red',
  high: 'badge-red',
  medium: 'badge-yellow',
  low: 'badge-blue',
};

function formatTime(timestamp) {
  if (!timestamp) return '—';
  const parts = timestamp.split(' ');
  return parts.length > 1 ? parts[1] : timestamp;
}

export default function AdminPanel() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [lockedAccounts, setLockedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [unlockingId, setUnlockingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const loadDashboardData = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setLoadError('');

    try {
      const [statsResult, logsResult, lockedResult] = await Promise.allSettled([
        adminApi.getStats(),
        adminApi.getLogs({ limit: 10 }),
        adminApi.getLockedAccounts(),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data.stats);
      } else {
        setLoadError('Some dashboard data could not be loaded.');
      }

      setSecurityLogs(
        logsResult.status === 'fulfilled' ? logsResult.value.data.logs ?? [] : []
      );

      setLockedAccounts(
        lockedResult.status === 'fulfilled'
          ? lockedResult.value.data.locked_accounts ?? []
          : []
      );
    } catch {
      setLoadError('Failed to load admin dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleUnlock = async (userId, email) => {
    setUnlockingId(userId);
    setActionMessage('');

    try {
      await adminApi.unlockAccount(userId);
      setActionMessage(`Account for ${email} has been unlocked.`);
      setLockedAccounts((prev) => prev.filter((acc) => acc.id !== userId));
      // Refresh stats so the "locked accounts" count updates
      loadDashboardData(true);
    } catch {
      setActionMessage(`Failed to unlock account for ${email}.`);
    } finally {
      setUnlockingId(null);
    }
  };

  const criticalCount = securityLogs.filter(
    (entry) => resolveSeverity(entry.event_type) === 'critical'
  ).length;

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg">
      <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          sidebarOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />

        <main className="flex-1 space-y-6 overflow-y-auto px-4 py-6 lg:px-8 animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-cyber-bright">
                Admin <span className="neon-text">Control Panel</span>
              </h1>
              <p className="mt-0.5 font-mono-code text-sm text-cyber-muted">
                System-wide security analytics and management
              </p>
            </div>

            <button
              type="button"
              disabled={isRefreshing}
              onClick={() => loadDashboardData(true)}
              className="btn-cyber gap-2 py-2 text-xs"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {loadError && (
            <AlertBanner type="danger" title="Data Load Error" message={loadError} />
          )}

          {actionMessage && (
            <AlertBanner type="info" title="Action Result" message={actionMessage} autoDismiss />
          )}

          {!isLoading && criticalCount > 0 && (
            <AlertBanner
              type="danger"
              title={`${criticalCount} Critical Event${criticalCount > 1 ? 's' : ''} Detected`}
              message="Review the security event log below for account lockouts and breach indicators."
            />
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner message="Loading admin data…" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SecurityCard
                icon={<Users size={20} />}
                label="Total Users"
                value={stats?.users?.total ?? '—'}
                sub={`${stats?.users?.active ?? 0} active`}
                accent="blue"
              />

              <SecurityCard
                icon={<ShieldAlert size={20} />}
                label="Failed Attempts"
                value={stats?.users?.total_failed_attempts ?? '—'}
                sub="Across all accounts"
                accent="red"
              />

              <SecurityCard
                icon={<Lock size={20} />}
                label="Locked Accounts"
                value={stats?.users?.locked ?? '—'}
                sub="Pending review"
                accent="yellow"
              />

              <SecurityCard
                icon={<Activity size={20} />}
                label="Events (24h)"
                value={stats?.logs?.last_24h ?? '—'}
                sub={`${stats?.logs?.total ?? 0} total logged`}
                accent="green"
              />
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <section className="glass-card border border-cyber-border/60 p-6 xl:col-span-2">
                <div className="mb-5 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-cyber-red" />
                  <h2 className="text-base font-semibold text-cyber-bright">
                    Recent Security Events
                  </h2>
                  <span className="badge-red ml-auto font-mono-code text-xs">
                    {criticalCount} critical
                  </span>
                </div>

                {securityLogs.length === 0 ? (
                  <p className="py-8 text-center text-sm text-cyber-muted">
                    No security events recorded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-cyber-border/50">
                          {TABLE_HEADERS.map((header) => (
                            <th
                              key={header}
                              className="pb-3 pr-4 text-left font-mono-code text-xs font-semibold uppercase tracking-widest text-cyber-muted"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-cyber-border/30">
                        {securityLogs.map((entry) => {
                          const severity = resolveSeverity(entry.event_type);
                          return (
                            <tr key={entry.id} className="transition-colors hover:bg-cyber-blue/5">
                              <td className="py-3 pr-4 font-mono-code text-xs text-cyber-accent">
                                {entry.event_type}
                              </td>

                              <td className="max-w-[160px] truncate py-3 pr-4 text-xs text-cyber-text">
                                {entry.username || entry.email}
                              </td>

                              <td className="py-3 pr-4 font-mono-code text-xs text-cyber-blue">
                                {entry.ip_address}
                              </td>

                              <td className="py-3 pr-4 font-mono-code text-xs text-cyber-muted">
                                {formatTime(entry.timestamp)}
                              </td>

                              <td className="py-3">
                                <span className={SEVERITY_STYLES[severity]}>
                                  {severity}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="glass-card border border-cyber-yellow/30 p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Lock size={18} className="text-cyber-yellow" />
                  <h2 className="text-base font-semibold text-cyber-bright">
                    Locked Accounts
                  </h2>
                  <span className="badge-yellow ml-auto font-mono-code text-xs">
                    {lockedAccounts.length}
                  </span>
                </div>

                {lockedAccounts.length === 0 ? (
                  <p className="py-8 text-center text-sm text-cyber-muted">
                    No locked accounts.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {lockedAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="
                          rounded-lg border border-cyber-border/50
                          bg-cyber-surface/60 px-4 py-3
                          transition-colors hover:border-cyber-yellow/40
                        "
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-cyber-bright">
                            {account.username}
                          </p>

                          <button
                            type="button"
                            disabled={unlockingId === account.id}
                            onClick={() => handleUnlock(account.id, account.email)}
                            className="
                              flex flex-shrink-0 items-center gap-1
                              rounded-md border border-cyber-green/40
                              px-2 py-1 text-xs text-cyber-green
                              transition-colors hover:bg-cyber-green/10
                              disabled:opacity-50
                            "
                          >
                            <Unlock size={12} className={unlockingId === account.id ? 'animate-pulse' : ''} />
                            Unlock
                          </button>
                        </div>

                        <p className="truncate text-xs text-cyber-muted">
                          {account.email}
                        </p>

                        <p className="mt-1 text-xs text-cyber-muted">
                          {account.failed_attempts} failed attempts
                        </p>

                        <p className="mt-1 font-mono-code text-xs text-cyber-muted">
                          Locked until {account.lock_until}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}