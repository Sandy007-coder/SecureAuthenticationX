import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  ShieldAlert,
  Lock,
  Activity,
  Clock,
  Eye,
  TrendingUp,
} from 'lucide-react';

import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import SecurityCard from '../components/SecurityCard.jsx';
import LoginActivityTable from '../components/LoginActivityTable.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import AlertBanner from '../components/AlertBanner.jsx';

import { useAuth } from '../App.jsx';
import { adminApi } from '../services/api.js';

function resolveStatus(eventType = '') {
  const type = eventType.toUpperCase();
  if (type === 'LOGIN_SUCCESS') return 'success';
  if (type.includes('FAILURE') || type.includes('DENIED')) return 'failed';
  if (type.includes('LOCKED') || type.includes('WHILE_LOCKED')) return 'suspicious';
  return 'pending';
}

function mapLogToActivity(entry) {
  return {
    id: entry.id,
    user: entry.username || entry.email,
    ip: entry.ip_address,
    location: 'Unknown',
    device: 'unknown',
    status: resolveStatus(entry.event_type),
    timestamp: entry.timestamp,
  };
}

export default function Dashboard() {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [statsError, setStatsError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setLoadingStats(false);
      setLoadingActivity(false);
      return;
    }

    let mounted = true;

    const loadDashboardStats = async () => {
      try {
        const { data } = await adminApi.getStats();
        if (mounted) setStats(data.stats);
      } catch {
        if (mounted) setStatsError('Unable to load statistics. Try refreshing the page.');
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    const loadLoginActivity = async () => {
      try {
        const { data } = await adminApi.getLogs({ limit: 10 });
        if (mounted) setActivity((data.logs ?? []).map(mapLogToActivity));
      } catch {
        if (mounted) setActivity([]);
      } finally {
        if (mounted) setLoadingActivity(false);
      }
    };

    loadDashboardStats();
    loadLoginActivity();

    return () => { mounted = false; };
  }, [isAdmin]);

  const currentTimestamp = useMemo(
    () =>
      new Date().toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((previous) => !previous)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 space-y-6 animate-fade-in">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-cyber-bright">
                Welcome back,{' '}
                <span className="neon-text">{user?.username || 'Operator'}</span>
              </h1>

              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-mono-code text-cyber-muted">
                <Clock size={13} />
                {currentTimestamp} · All systems nominal
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-green">
                <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse" />
                Secure
              </span>

              <span className="badge-blue">
                <Eye size={11} />
                Monitoring
              </span>
            </div>
          </div>

          {isAdmin && (
            <>
              {statsError && (
                <AlertBanner
                  type="danger"
                  title="Unable to Load Statistics"
                  message={statsError}
                />
              )}

              {loadingStats ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner message="Loading analytics…" />
                </div>
              ) : stats && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SecurityCard
                    icon={<Users size={20} />}
                    label="Total Users"
                    value={stats.users?.total ?? '—'}
                    sub={`${stats.users?.active ?? 0} active`}
                    accent="blue"
                  />

                  <SecurityCard
                    icon={<ShieldAlert size={20} />}
                    label="Failed Attempts"
                    value={stats.users?.total_failed_attempts ?? '—'}
                    sub="Across all accounts"
                    accent="red"
                  />

                  <SecurityCard
                    icon={<Lock size={20} />}
                    label="Locked Accounts"
                    value={stats.users?.locked ?? '—'}
                    sub="Require manual review"
                    accent="yellow"
                  />

                  <SecurityCard
                    icon={<Activity size={20} />}
                    label="Events (24h)"
                    value={stats.logs?.last_24h ?? '—'}
                    sub={`${stats.logs?.total ?? 0} total logged`}
                    accent="green"
                  />
                </div>
              )}

              <section className="glass-card border border-cyber-border/60 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-cyber-blue" />
                    <h2 className="text-base font-semibold text-cyber-bright">
                      Recent Login Activity
                    </h2>
                  </div>

                  <span className="badge-blue text-xs font-mono-code">
                    Live Feed
                  </span>
                </div>

                <LoginActivityTable
                  activities={activity}
                  loading={loadingActivity}
                />
              </section>
            </>
          )}

          {!isAdmin && (
            <div className="glass-card border border-cyber-border/60 p-10 text-center">
              <Eye size={42} className="mx-auto mb-4 text-cyber-blue opacity-50" />
              <h2 className="text-base font-semibold text-cyber-bright">
                You're securely authenticated
              </h2>
              <p className="mt-2 text-sm text-cyber-muted">
                Use the sidebar to navigate to your profile, alerts, or security settings.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}