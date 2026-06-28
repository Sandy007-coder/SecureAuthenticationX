import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Lock,
  RefreshCw,
  ShieldAlert,
  Unlock,
  Users,
  ShieldCheck,
  UserX,
  UserCheck,
} from 'lucide-react';

import AlertBanner from '../components/AlertBanner.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Navbar from '../components/Navbar.jsx';
import SecurityCard from '../components/SecurityCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { adminApi } from '../services/api.js';

const TABLE_HEADERS = ['Event', 'User', 'IP Address', 'Time', 'Severity'];

const ROLE_COLORS = {
  admin:   'text-cyber-red',
  analyst: 'text-cyber-yellow',
  viewer:  'text-cyber-accent',
  user:    'text-cyber-blue',
};

function resolveSeverity(eventType = '') {
  const type = eventType.toUpperCase();
  if (type.includes('LOCKED') || type.includes('BREACH')) return 'critical';
  if (type.includes('FAILURE') || type.includes('DENIED') || type.includes('INACTIVE')) return 'high';
  if (type.includes('CHANGED') || type.includes('UPDATED') || type.includes('ROLE')) return 'medium';
  return 'low';
}

const SEVERITY_STYLES = {
  critical: 'badge-red',
  high:     'badge-red',
  medium:   'badge-yellow',
  low:      'badge-blue',
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

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [roleMessage, setRoleMessage] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

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
      loadDashboardData(true);
    } catch {
      setActionMessage(`Failed to unlock account for ${email}.`);
    } finally {
      setUnlockingId(null);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    setRoleMessage('');
    try {
      const { data } = await adminApi.listUsers();
      setUsers(data.users ?? []);
      setUsersLoaded(true);
    } catch {
      setRoleMessage('Failed to load users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId, email, newRole) => {
    setUpdatingUserId(userId);
    setRoleMessage('');
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setRoleMessage(`Role updated to '${newRole}' for ${email}.`);
      setTimeout(() => setRoleMessage(''), 4000);
    } catch {
      setRoleMessage(`Failed to update role for ${email}.`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (userId, email, currentStatus) => {
    setUpdatingUserId(userId);
    setRoleMessage('');
    try {
      await adminApi.updateUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      );
      const action = currentStatus ? 'deactivated' : 'activated';
      setRoleMessage(`Account for ${email} has been ${action}.`);
      setTimeout(() => setRoleMessage(''), 4000);
    } catch {
      setRoleMessage(`Failed to update status for ${email}.`);
    } finally {
      setUpdatingUserId(null);
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

              {/* Security Logs */}
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
                        className="rounded-lg border border-cyber-border/50 bg-cyber-surface/60 px-4 py-3 transition-colors hover:border-cyber-yellow/40"
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-cyber-bright">
                            {account.username}
                          </p>

                          <button
                            type="button"
                            disabled={unlockingId === account.id}
                            onClick={() => handleUnlock(account.id, account.email)}
                            className="flex flex-shrink-0 items-center gap-1 rounded-md border border-cyber-green/40 px-2 py-1 text-xs text-cyber-green transition-colors hover:bg-cyber-green/10 disabled:opacity-50"
                          >
                            <Unlock size={12} className={unlockingId === account.id ? 'animate-pulse' : ''} />
                            Unlock
                          </button>
                        </div>

                        <p className="truncate text-xs text-cyber-muted">{account.email}</p>
                        <p className="mt-1 text-xs text-cyber-muted">{account.failed_attempts} failed attempts</p>
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

          {!isLoading && (
            <section className="glass-card border border-cyber-border/60 p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-cyber-bright">
                  <ShieldCheck size={18} className="text-cyber-blue" />
                  User Management
                </h2>

                <button
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="flex items-center gap-2 rounded-lg border border-cyber-blue/40 px-3 py-1.5 text-xs text-cyber-blue hover:bg-cyber-blue/10 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loadingUsers ? 'animate-spin' : ''} />
                  {usersLoaded ? 'Refresh Users' : 'Load Users'}
                </button>
              </div>

              {roleMessage && (
                <div className={`mb-4 rounded-lg border px-4 py-2 text-xs ${
                  roleMessage.startsWith('Failed')
                    ? 'border-cyber-red/30 bg-cyber-red/5 text-cyber-red'
                    : 'border-cyber-green/30 bg-cyber-green/5 text-cyber-green'
                }`}>
                  {roleMessage}
                </div>
              )}

              {!usersLoaded ? (
                <p className="py-8 text-center text-sm text-cyber-muted">
                  Click "Load Users" to view and manage all registered accounts.
                </p>
              ) : loadingUsers ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner message="Loading users…" size="sm" />
                </div>
              ) : users.length === 0 ? (
                <p className="py-8 text-center text-sm text-cyber-muted">
                  No users found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-cyber-border/50">
                        {['Username', 'Email', 'Role', 'Status', 'Last Login', 'Change Role', 'Actions'].map((h) => (
                          <th key={h} className="pb-3 pr-4 text-left font-mono-code text-xs font-semibold uppercase tracking-widest text-cyber-muted">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-cyber-border/30">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-cyber-blue/5 transition-colors">
                          <td className="py-3 pr-4 font-medium text-cyber-bright">
                            {u.username}
                          </td>

                          <td className="py-3 pr-4 text-xs text-cyber-muted">
                            {u.email}
                          </td>

                          <td className="py-3 pr-4">
                            <span className={`text-xs font-semibold ${ROLE_COLORS[u.role] ?? 'text-cyber-blue'}`}>
                              {u.role}
                            </span>
                          </td>

                          <td className="py-3 pr-4">
                            <span className={`text-xs font-medium ${u.is_active ? 'text-cyber-green' : 'text-cyber-red'}`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="py-3 pr-4 font-mono-code text-xs text-cyber-muted">
                            {u.last_login ? u.last_login.split(' ')[0] : 'Never'}
                          </td>

                          <td className="py-3 pr-4">
                            <select
                              value={u.role}
                              disabled={updatingUserId === u.id}
                              onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                              className="rounded-lg border border-cyber-border/50 bg-cyber-surface px-2 py-1 text-xs text-cyber-bright focus:border-cyber-blue/60 focus:outline-none disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="viewer">Viewer</option>
                              <option value="analyst">Analyst</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          <td className="py-3">
                            <button
                              type="button"
                              disabled={updatingUserId === u.id}
                              onClick={() => handleStatusToggle(u.id, u.email, u.is_active)}
                              className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-50 ${
                                u.is_active
                                  ? 'border-cyber-red/40 text-cyber-red hover:bg-cyber-red/10'
                                  : 'border-cyber-green/40 text-cyber-green hover:bg-cyber-green/10'
                              }`}
                            >
                              {u.is_active
                                ? <><UserX size={11} /> Deactivate</>
                                : <><UserCheck size={11} /> Activate</>
                              }
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

        </main>
      </div>
    </div>
  );
}