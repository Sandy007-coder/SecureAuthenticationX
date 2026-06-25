import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Globe,
  User,
  Clock,
  Server,
  CheckCircle,
  MapPin,
  Activity,
  FileText,
  Lock,
  Eye,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ALERTS = {
  'ALRT-1001': {
    id: 'ALRT-1001',
    title: 'Brute-Force Attack Detected',
    severity: 'Critical',
    status: 'Open',
    sourceIp: '203.0.113.42',
    target: 'admin@secureauthx.com',
    time: '2 minutes ago',
    timestamp: '2024-06-11 14:32:01 UTC',
    attackType: 'Credential Attack',
    geo: { country: 'Russia', city: 'Moscow', lat: '55.7558° N', lon: '37.6173° E' },
    affectedAsset: 'Auth Server — node-auth-01.internal',
    riskScore: 94,
    mitre: { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access' },
    description:
      'Multiple failed authentication attempts were detected from a single external IP address within a short period. 18 failed login attempts recorded in under 10 minutes targeting the admin account.',
    recommendation:
      'Block source IP immediately, enable rate limiting on login endpoint, review authentication logs, enforce MFA, and rotate admin credentials.',
    evidence: [
      { type: 'Log', detail: '18 failed AUTH events from 203.0.113.42 between 14:22–14:32 UTC' },
      { type: 'Pattern', detail: 'Sequential password enumeration pattern detected' },
      { type: 'Threat Intel', detail: 'IP flagged in 3 external threat intelligence feeds' },
    ],
    timeline: [
      { time: '14:22:01 UTC', event: 'First failed login attempt from 203.0.113.42', status: 'detected' },
      { time: '14:25:14 UTC', event: 'Threshold of 5 failures crossed — low severity alert raised', status: 'alert' },
      { time: '14:30:49 UTC', event: '15 failures crossed — escalated to Critical', status: 'escalated' },
      { time: '14:32:01 UTC', event: 'Alert forwarded to SOC analyst queue', status: 'forwarded' },
      { time: '14:32:10 UTC', event: 'CyberSentinel-XDR auto-blocked IP at firewall layer', status: 'blocked' },
    ],
    rawLog: `[14:22:01] FAILED LOGIN | user=admin | ip=203.0.113.42 | reason=invalid_password
[14:22:45] FAILED LOGIN | user=admin | ip=203.0.113.42 | reason=invalid_password
[14:23:30] FAILED LOGIN | user=admin | ip=203.0.113.42 | reason=invalid_password
[14:24:10] FAILED LOGIN | user=admin | ip=203.0.113.42 | reason=invalid_password
[14:25:14] THRESHOLD_ALERT | count=5 | ip=203.0.113.42 | severity=LOW
[14:30:49] THRESHOLD_ALERT | count=15 | ip=203.0.113.42 | severity=CRITICAL
[14:32:01] ALERT_CREATED | id=ALRT-1001 | assigned=SOC_QUEUE`,
  },

  'ALRT-1002': {
    id: 'ALRT-1002',
    title: 'Unusual Location Sign-In',
    severity: 'High',
    status: 'Investigating',
    sourceIp: '45.77.182.91',
    target: 'diana@corp.io',
    time: '5 minutes ago',
    timestamp: '2024-06-11 14:29:00 UTC',
    attackType: 'Account Takeover',
    geo: { country: 'Singapore', city: 'Singapore', lat: '1.3521° N', lon: '103.8198° E' },
    affectedAsset: 'Corporate SSO — sso.corp.io',
    riskScore: 78,
    mitre: { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' },
    description:
      'A successful login occurred from Singapore for an account that has never logged in outside the US. The login bypassed MFA using a remembered device token.',
    recommendation:
      'Verify user identity via secondary channel, review login history, invalidate all active sessions, force password reset if suspicious.',
    evidence: [
      { type: 'Log', detail: 'Successful login from 45.77.182.91 (Singapore) at 14:29 UTC' },
      { type: 'Baseline', detail: 'User diana@corp.io has 180-day login history only from US IPs' },
      { type: 'Device', detail: 'Remembered device token used — MFA bypassed' },
    ],
    timeline: [
      { time: '14:28:52 UTC', event: 'Login initiated from Singapore IP 45.77.182.91', status: 'detected' },
      { time: '14:29:00 UTC', event: 'Login succeeded using remembered device token', status: 'alert' },
      { time: '14:29:03 UTC', event: 'Geo-anomaly detection triggered', status: 'escalated' },
      { time: '14:29:05 UTC', event: 'Alert created and assigned to analyst', status: 'forwarded' },
    ],
    rawLog: `[14:28:52] LOGIN_ATTEMPT | user=diana@corp.io | ip=45.77.182.91 | geo=Singapore
[14:28:53] MFA_BYPASS | method=remembered_device | token=valid
[14:29:00] LOGIN_SUCCESS | user=diana@corp.io | ip=45.77.182.91
[14:29:03] GEO_ANOMALY | user=diana@corp.io | usual_geo=US | current_geo=Singapore
[14:29:05] ALERT_CREATED | id=ALRT-1002 | severity=HIGH`,
  },

  'ALRT-1003': {
    id: 'ALRT-1003',
    title: 'Suspicious API Activity',
    severity: 'Medium',
    status: 'Resolved',
    sourceIp: '198.51.100.21',
    target: 'Public API Gateway',
    time: '20 minutes ago',
    timestamp: '2024-06-11 14:14:00 UTC',
    attackType: 'API Abuse',
    geo: { country: 'Netherlands', city: 'Amsterdam', lat: '52.3676° N', lon: '4.9041° E' },
    affectedAsset: 'API Gateway — api.secureauthx.com',
    riskScore: 45,
    mitre: { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access' },
    description:
      'An abnormal request pattern was detected against the external API endpoint. 340 requests in 60 seconds from a single IP, far exceeding the 60 req/min rate limit.',
    recommendation:
      'Review API rate limits, implement stricter throttling, add CAPTCHA for suspicious patterns, and monitor for data exfiltration attempts.',
    evidence: [
      { type: 'Log', detail: '340 API requests in 60 seconds from 198.51.100.21' },
      { type: 'Rate Limit', detail: 'Rate limit of 60 req/min exceeded by 567%' },
      { type: 'Endpoint', detail: 'Requests targeted /api/v1/users/search with enumeration pattern' },
    ],
    timeline: [
      { time: '14:13:00 UTC', event: 'Abnormal API request rate detected', status: 'detected' },
      { time: '14:13:45 UTC', event: 'Rate limit threshold breached — alert raised', status: 'alert' },
      { time: '14:14:00 UTC', event: 'IP auto-throttled by API gateway', status: 'blocked' },
      { time: '14:20:00 UTC', event: 'Analyst reviewed — no data exfiltration confirmed', status: 'forwarded' },
      { time: '14:34:00 UTC', event: 'Alert resolved — rate limit rules updated', status: 'resolved' },
    ],
    rawLog: `[14:13:00] API_FLOOD | ip=198.51.100.21 | endpoint=/api/v1/users/search | rate=340/min
[14:13:45] RATE_LIMIT_BREACH | ip=198.51.100.21 | limit=60 | actual=340
[14:14:00] AUTO_THROTTLE | ip=198.51.100.21 | action=throttled
[14:20:00] ANALYST_REVIEW | result=no_exfiltration
[14:34:00] ALERT_RESOLVED | id=ALRT-1003`,
  },

  1: {
    id: 'ALRT-1001',
    title: 'Brute-Force Attack Detected',
    severity: 'Critical',
    status: 'Open',
    sourceIp: '203.0.113.42',
    target: 'admin@secureauthx.com',
    time: '2 minutes ago',
    timestamp: '2024-06-11 14:32:01 UTC',
    attackType: 'Credential Attack',
    geo: { country: 'Russia', city: 'Moscow', lat: '55.7558° N', lon: '37.6173° E' },
    affectedAsset: 'Auth Server — node-auth-01.internal',
    riskScore: 94,
    mitre: { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access' },
    description:
      'Multiple failed authentication attempts were detected from a single external IP address within a short period. 18 failed login attempts recorded in under 10 minutes.',
    recommendation:
      'Block source IP immediately, enable rate limiting, enforce MFA, and rotate admin credentials.',
    evidence: [
      { type: 'Log', detail: '18 failed AUTH events from 203.0.113.42 between 14:22–14:32 UTC' },
      { type: 'Pattern', detail: 'Sequential password enumeration pattern detected' },
      { type: 'Threat Intel', detail: 'IP flagged in 3 external threat intelligence feeds' },
    ],
    timeline: [
      { time: '14:22:01 UTC', event: 'First failed login attempt from 203.0.113.42', status: 'detected' },
      { time: '14:30:49 UTC', event: '15 failures crossed — escalated to Critical', status: 'escalated' },
      { time: '14:32:01 UTC', event: 'Alert forwarded to SOC analyst queue', status: 'forwarded' },
      { time: '14:32:10 UTC', event: 'CyberSentinel-XDR auto-blocked IP at firewall layer', status: 'blocked' },
    ],
    rawLog: `[14:22:01] FAILED LOGIN | user=admin | ip=203.0.113.42 | reason=invalid_password
[14:30:49] THRESHOLD_ALERT | count=15 | ip=203.0.113.42 | severity=CRITICAL
[14:32:01] ALERT_CREATED | id=ALRT-1001 | assigned=SOC_QUEUE`,
  },

  2: {
    id: 'ALRT-1002',
    title: 'Unusual Location Sign-In',
    severity: 'High',
    status: 'Investigating',
    sourceIp: '45.77.182.91',
    target: 'diana@corp.io',
    time: '5 minutes ago',
    timestamp: '2024-06-11 14:29:00 UTC',
    attackType: 'Account Takeover',
    geo: { country: 'Singapore', city: 'Singapore', lat: '1.3521° N', lon: '103.8198° E' },
    affectedAsset: 'Corporate SSO — sso.corp.io',
    riskScore: 78,
    mitre: { id: 'T1078', name: 'Valid Accounts', tactic: 'Defense Evasion' },
    description:
      'A successful login occurred from Singapore for an account that has never logged in outside the US.',
    recommendation:
      'Verify user identity, review login history, invalidate all sessions, force password reset.',
    evidence: [
      { type: 'Log', detail: 'Successful login from 45.77.182.91 (Singapore) at 14:29 UTC' },
      { type: 'Baseline', detail: 'User diana@corp.io has 180-day login history only from US IPs' },
    ],
    timeline: [
      { time: '14:28:52 UTC', event: 'Login initiated from Singapore IP', status: 'detected' },
      { time: '14:29:00 UTC', event: 'Login succeeded using remembered device token', status: 'alert' },
      { time: '14:29:05 UTC', event: 'Alert created and assigned to analyst', status: 'forwarded' },
    ],
    rawLog: `[14:28:52] LOGIN_ATTEMPT | user=diana@corp.io | ip=45.77.182.91 | geo=Singapore
[14:29:00] LOGIN_SUCCESS | user=diana@corp.io | ip=45.77.182.91
[14:29:05] ALERT_CREATED | id=ALRT-1002 | severity=HIGH`,
  },
};

const severityStyles = {
  Critical: 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40',
  High: 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/40',
  Medium: 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40',
};

const statusStyles = {
  Open: 'text-cyber-red',
  Investigating: 'text-cyber-yellow',
  Resolved: 'text-cyber-green',
};

const timelineStatusStyles = {
  detected: 'bg-cyber-blue text-white',
  alert: 'bg-cyber-yellow text-black',
  escalated: 'bg-cyber-red text-white',
  forwarded: 'bg-cyber-blue/60 text-white',
  blocked: 'bg-cyber-red/80 text-white',
  resolved: 'bg-cyber-green text-black',
};

function RiskMeter({ score }) {
  const color =
    score >= 80 ? 'bg-cyber-red' : score >= 50 ? 'bg-cyber-yellow' : 'bg-cyber-blue';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-cyber-muted">
        <span>Risk Score</span>
        <span className={score >= 80 ? 'text-cyber-red' : score >= 50 ? 'text-cyber-yellow' : 'text-cyber-blue'}>
          {score} / 100
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-cyber-border/40">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function AlertDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showRawLog, setShowRawLog] = useState(false);
  const [analystNote, setAnalystNote] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState('');

  const alert = ALERTS[id];

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <ShieldAlert size={56} className="mb-4 text-cyber-red" />
        <h1 className="text-2xl font-bold text-cyber-red">Alert Not Found</h1>
        <p className="mt-2 text-cyber-muted">
          No alert with ID <span className="font-mono text-cyber-bright">"{id}"</span> exists in the system.
        </p>
        <button
          onClick={() => navigate('/alerts')}
          className="mt-6 flex items-center gap-2 rounded-lg border border-cyber-blue/30 px-5 py-2 text-cyber-blue hover:bg-cyber-blue/10"
        >
          <ArrowLeft size={16} />
          Back to Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert size={32} className="text-cyber-red" />
            <h1 className="text-3xl font-bold text-cyber-bright">Alert Investigation</h1>
          </div>
          <p className="mt-1 text-cyber-muted">
            ID: <span className="font-mono text-cyber-blue">{alert.id}</span> &nbsp;·&nbsp; {alert.timestamp}
          </p>
        </div>
        <button
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-2 rounded-lg border border-cyber-blue/30 px-4 py-2 text-cyber-blue hover:bg-cyber-blue/10 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Alerts
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold text-cyber-bright">{alert.title}</h2>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${severityStyles[alert.severity]}`}>
            {alert.severity}
          </span>
          <span className={`font-semibold ${statusStyles[alert.status]}`}>
            ● {alert.status}
          </span>
        </div>
        <p className="text-cyber-muted">{alert.description}</p>
        <RiskMeter score={alert.riskScore} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-5 text-lg font-semibold text-cyber-bright">Incident Information</h3>
          <div className="space-y-4">
            <InfoRow icon={<Server size={16} className="text-cyber-blue" />} label="SOURCE IP" value={alert.sourceIp} />
            <InfoRow icon={<User size={16} className="text-cyber-blue" />} label="TARGET ACCOUNT" value={alert.target} />
            <InfoRow icon={<Clock size={16} className="text-cyber-blue" />} label="DETECTED" value={alert.time} />
            <InfoRow icon={<AlertTriangle size={16} className="text-cyber-yellow" />} label="ATTACK TYPE" value={alert.attackType} />
            <InfoRow icon={<Activity size={16} className="text-cyber-blue" />} label="AFFECTED ASSET" value={alert.affectedAsset} />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h3 className="mb-5 text-lg font-semibold text-cyber-bright">Threat Intelligence</h3>
          <div className="space-y-4">
            <InfoRow
              icon={<Globe size={16} className="text-cyber-yellow" />}
              label="MITRE ATT&CK"
              value={`${alert.mitre.id} — ${alert.mitre.name}`}
            />
            <InfoRow
              icon={<Shield size={16} className="text-cyber-yellow" />}
              label="TACTIC"
              value={alert.mitre.tactic}
            />
            <InfoRow
              icon={<MapPin size={16} className="text-cyber-blue" />}
              label="SOURCE LOCATION"
              value={`${alert.geo.city}, ${alert.geo.country}`}
            />
            <InfoRow
              icon={<Globe size={16} className="text-cyber-muted" />}
              label="COORDINATES"
              value={`${alert.geo.lat}, ${alert.geo.lon}`}
            />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyber-bright">
          <Eye size={18} className="text-cyber-blue" />
          Forensic Evidence
        </h3>
        <div className="space-y-3">
          {alert.evidence.map((e, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-cyber-border/40 bg-cyber-surface/40 p-3"
            >
              <span className="rounded bg-cyber-blue/20 px-2 py-0.5 text-xs font-mono text-cyber-blue">
                {e.type}
              </span>
              <p className="text-sm text-cyber-muted">{e.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-cyber-bright">
          <Clock size={18} className="text-cyber-blue" />
          Investigation Timeline
        </h3>
        <div className="relative space-y-4 pl-4">
          <div className="absolute left-4 top-0 h-full w-px bg-cyber-border/40" />
          {alert.timeline.map((entry, i) => (
            <div key={i} className="relative flex gap-4 pl-6">
              <div className="absolute -left-[3px] top-1.5 h-3 w-3 rounded-full border-2 border-cyber-surface bg-cyber-blue" />
              <div className="flex-1 rounded-lg border border-cyber-border/30 bg-cyber-surface/30 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${timelineStatusStyles[entry.status]}`}
                  >
                    {entry.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs text-cyber-muted">{entry.time}</span>
                </div>
                <p className="mt-1 text-sm text-cyber-bright">{entry.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6">
        <button
          onClick={() => setShowRawLog(!showRawLog)}
          className="flex w-full items-center justify-between text-lg font-semibold text-cyber-bright"
        >
          <span className="flex items-center gap-2">
            <Terminal size={18} className="text-cyber-blue" />
            Raw Event Log
          </span>
          {showRawLog ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {showRawLog && (
          <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-4 font-mono text-xs text-cyber-green whitespace-pre-wrap border border-cyber-border/30">
            {alert.rawLog}
          </pre>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyber-bright">
          <Lock size={18} className="text-cyber-yellow" />
          Recommended Actions
        </h3>
        <p className="text-cyber-muted">{alert.recommendation}</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cyber-bright">
          <FileText size={18} className="text-cyber-blue" />
          Analyst Notes
        </h3>
        <textarea
          value={analystNote}
          onChange={(e) => setAnalystNote(e.target.value)}
          placeholder="Add investigation notes, findings, or escalation details here..."
          rows={4}
          className="
            w-full rounded-lg border border-cyber-border/50
            bg-cyber-surface/40 p-3
            text-sm text-cyber-bright placeholder:text-cyber-muted
            focus:border-cyber-blue/60 focus:outline-none
            resize-none
          "
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={investigationStatus}
            onChange={(e) => setInvestigationStatus(e.target.value)}
            className="
              rounded-lg border border-cyber-border/50
              bg-cyber-surface px-3 py-2
              text-sm text-cyber-bright
              focus:border-cyber-blue/60 focus:outline-none
            "
          >
            <option value="">Update Status...</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>

          <button
            onClick={() => {
              if (analystNote || investigationStatus) {
                alert(`Note saved. Status: ${investigationStatus || 'unchanged'}`);
              }
            }}
            className="rounded-lg bg-cyber-blue/20 px-5 py-2 text-sm font-medium text-cyber-blue hover:bg-cyber-blue/30 transition-all"
          >
            Save Note
          </button>

          <button
            onClick={() => navigate('/alerts')}
            className="rounded-lg border border-cyber-red/30 px-5 py-2 text-sm font-medium text-cyber-red hover:bg-cyber-red/10 transition-all"
          >
            Escalate Alert
          </button>
        </div>
      </div>

    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-cyber-muted">{label}</p>
        <p className="text-sm text-cyber-bright">{value}</p>
      </div>
    </div>
  );
}

function Shield({ size, className }) {
  return <ShieldAlert size={size} className={className} />;
}