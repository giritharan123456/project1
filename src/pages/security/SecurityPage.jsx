import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiShieldCheck, HiLockClosed, HiClock,
  HiDesktopComputer, HiGlobe, HiLocationMarker,
  HiCheck, HiQrcode, HiEye, HiCamera,
  HiMicrophone, HiDeviceMobile, HiChatAlt,
  HiTrash, HiRefresh,
  HiLogin, HiFingerPrint, HiDocumentDuplicate,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Toggle from '../../components/ui/Toggle';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const sessions = [
  { id: 1, device: 'Chrome on Windows', location: 'New York, USA', time: 'Active now', active: true, browser: 'Chrome 124', ip: '192.168.1.42' },
  { id: 2, device: 'Safari on iPhone', location: 'New York, USA', time: '2h ago', active: false, browser: 'Safari 17', ip: '192.168.1.58' },
  { id: 3, device: 'Firefox on Mac', location: 'Boston, USA', time: '1d ago', active: false, browser: 'Firefox 126', ip: '10.0.0.15' },
];

const loginHistory = [
  { date: 'Jul 30, 2026', time: '09:15 AM', device: 'Chrome / Windows', location: 'New York, USA', ip: '203.0.113.42', status: 'success' },
  { date: 'Jul 30, 2026', time: '08:30 AM', device: 'Safari / iPhone', location: 'New York, USA', ip: '203.0.113.45', status: 'success' },
  { date: 'Jul 29, 2026', time: '11:45 PM', device: 'Firefox / Mac', location: 'Boston, USA', ip: '198.51.100.10', status: 'success' },
  { date: 'Jul 29, 2026', time: '06:12 PM', device: 'Chrome / Windows', location: 'New York, USA', ip: '203.0.113.42', status: 'success' },
  { date: 'Jul 28, 2026', time: '02:20 PM', device: 'Edge / Windows', location: 'Chicago, USA', ip: '192.0.2.88', status: 'failed' },
  { date: 'Jul 28, 2026', time: '10:05 AM', device: 'Chrome / Windows', location: 'New York, USA', ip: '203.0.113.42', status: 'success' },
  { date: 'Jul 27, 2026', time: '09:30 PM', device: 'Safari / iPhone', location: 'New York, USA', ip: '203.0.113.45', status: 'success' },
  { date: 'Jul 26, 2026', time: '07:15 AM', device: 'Chrome / Linux', location: 'San Francisco, USA', ip: '198.51.100.55', status: 'failed' },
  { date: 'Jul 25, 2026', time: '01:00 PM', device: 'Firefox / Mac', location: 'Boston, USA', ip: '198.51.100.10', status: 'success' },
  { date: 'Jul 24, 2026', time: '08:45 AM', device: 'Chrome / Windows', location: 'New York, USA', ip: '203.0.113.42', status: 'success' },
  { date: 'Jul 23, 2026', time: '11:20 PM', device: 'Safari / iPad', location: 'Los Angeles, USA', ip: '203.0.113.77', status: 'success' },
  { date: 'Jul 22, 2026', time: '03:30 PM', device: 'Chrome / Windows', location: 'New York, USA', ip: '203.0.113.42', status: 'failed' },
];

const accessLogs = [
  { timestamp: 'Jul 30, 2026 09:15:23', action: 'Meeting created', user: 'alex@connectly.io', detail: 'Team Standup (ID: 8342)', ip: '203.0.113.42' },
  { timestamp: 'Jul 30, 2026 08:30:17', action: 'User logged in', user: 'alex@connectly.io', detail: 'Chrome on Windows', ip: '203.0.113.42' },
  { timestamp: 'Jul 29, 2026 18:22:05', action: 'Screen share started', user: 'alex@connectly.io', detail: 'Meeting "Design Review"', ip: '203.0.113.42' },
  { timestamp: 'Jul 29, 2026 18:10:44', action: 'Recording started', user: 'alex@connectly.io', detail: 'Meeting "Design Review"', ip: '203.0.113.42' },
  { timestamp: 'Jul 29, 2026 17:55:00', action: 'Meeting joined', user: 'alex@connectly.io', detail: 'Design Review (ID: 8910)', ip: '203.0.113.42' },
  { timestamp: 'Jul 29, 2026 11:45:32', action: 'Password changed', user: 'alex@connectly.io', detail: 'Account security update', ip: '198.51.100.10' },
  { timestamp: 'Jul 28, 2026 14:20:18', action: 'Failed login attempt', user: 'alex@connectly.io', detail: 'Incorrect password', ip: '192.0.2.88' },
  { timestamp: 'Jul 28, 2026 10:05:11', action: 'User logged in', user: 'alex@connectly.io', detail: 'Chrome on Windows', ip: '203.0.113.42' },
];

const TRUSTED_DEVICES = [
  { id: 1, name: 'Work Laptop', device: 'Dell XPS 15 / Windows 11', browser: 'Chrome 124', added: 'Jan 15, 2026' },
  { id: 2, name: 'Personal iPhone', device: 'iPhone 15 Pro / iOS 18', browser: 'Safari 17', added: 'Mar 3, 2026' },
  { id: 3, name: 'Home Mac', device: 'MacBook Air / macOS 15', browser: 'Firefox 126', added: 'Apr 22, 2026' },
  { id: 4, name: 'Work Tablet', device: 'iPad Pro / iPadOS 18', browser: 'Safari 17', added: 'Jun 10, 2026' },
];

const STORAGE_KEY = 'connectly-security-prefs';

const DEFAULT_PREFS = {
  meetingPassword: true,
  waitingRoom: true,
  meetingLock: false,
  requireAuth: false,
  profileVisible: true,
  onlineVisible: true,
  showEmail: false,
  camAccess: true,
  micAccess: true,
  screenAccess: true,
  chatAccess: false,
  revokedSessions: [],
  backupCodes: ['ABCD-1234-EFGH', '5678-IJKL-9012', 'MNOP-3456-QRST', '7890-UVWX-1234', 'YZAB-5678-CDEF', '9012-GHIJ-3456'],
};

function loadPrefs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Failed to load security preferences', err);
  }
  return DEFAULT_PREFS;
}

function generateBackupCodes() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const randomSegment = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return Array.from({ length: 6 }, () => [randomSegment(), randomSegment(), randomSegment()].join('-'));
}

function getCurrentBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Chrome/')) return 'Chrome';
  if (ua.includes('Safari/')) return 'Safari';
  return 'Browser';
}

function currentDeviceEntry(role) {
  const browser = getCurrentBrowser();
  return {
    id: 'current-device',
    name: 'Current Device',
    device: `${browser} on this device`,
    browser,
    added: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    key: role,
  };
}

export default function SecurityPage() {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  const [trustedDevices, setTrustedDevices] = useState(() => {
    const trusted = localStorage.getItem(`connectly-trusted-device-${role}`) === 'true';
    return trusted ? [currentDeviceEntry(role), ...TRUSTED_DEVICES] : TRUSTED_DEVICES;
  });
  const [rememberDevice, setRememberDevice] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [showRevokeModal, setShowRevokeModal] = useState(null);
  const [showRemoveDevice, setShowRemoveDevice] = useState(null);
  const [show2FA, setShow2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const {
    meetingPassword, waitingRoom, meetingLock, requireAuth,
    profileVisible, onlineVisible, showEmail,
    camAccess, micAccess, screenAccess, chatAccess,
    revokedSessions, backupCodes,
  } = prefs;

  const updatePrefs = (patch) => setPrefs((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (err) {
      console.error('Failed to save security preferences', err);
    }
  }, [prefs]);

  const handleRevoke = (session) => {
    updatePrefs({ revokedSessions: [...revokedSessions, session.id] });
    setShowRevokeModal(null);
    toast.success('Session revoked successfully');
  };

  const handleRefreshSessions = () => {
    toast.success('Session list refreshed');
  };

  const handleRegenerateCodes = () => {
    updatePrefs({ backupCodes: generateBackupCodes() });
    toast.success('New backup codes generated');
  };

  const handleRemoveDevice = (device) => {
    setTrustedDevices((prev) => prev.filter((d) => d.id !== device.id));
    if (device.key) {
      localStorage.removeItem(`connectly-trusted-device-${device.key}`);
    }
    setShowRemoveDevice(null);
    toast.success(`${device.name} removed from trusted devices`);
  };

  const handleActivate2FA = () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter the complete 6-digit verification code');
      return;
    }
    if (rememberDevice) {
      localStorage.setItem(`connectly-trusted-device-${role}`, 'true');
      setTrustedDevices((prev) => {
        if (prev.some((d) => d.key === role)) return prev;
        return [currentDeviceEntry(role), ...prev];
      });
    }
    toast.success(rememberDevice ? '2FA enabled and this device trusted for 30 days' : '2FA enabled successfully');
    setShow2FA(false);
    setVerificationCode('');
    setRememberDevice(false);
  };

  return (
    <>
    <Helmet>
      <title>Security - AdzConnect</title>
      <meta name="description" content="Manage your AdzConnect account security settings including passwords, two-factor authentication, and sessions." />
    </Helmet>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Security</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your account security and privacy settings</p>
      </motion.div>

      {/* Meeting Security */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><HiLockClosed className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Security</h2><p className="text-xs text-gray-500 dark:text-slate-400">Configure default security settings for your meetings</p></div>
        </div>
        <Card>
          <div className="space-y-5">
            <div className="flex items-center justify-between"><Toggle enabled={meetingPassword} onChange={(v) => updatePrefs({ meetingPassword: v })} label="Require meeting password" /><Badge variant="primary" size="sm">Recommended</Badge></div>
            <div className="flex items-center justify-between"><Toggle enabled={waitingRoom} onChange={(v) => updatePrefs({ waitingRoom: v })} label="Waiting Room" /><Badge variant="primary" size="sm">Recommended</Badge></div>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3"><HiShieldCheck className="w-5 h-5 text-emerald-500" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">Encryption</p><p className="text-xs text-gray-500 dark:text-slate-400">All meetings are end-to-end encrypted</p></div></div>
              <Badge variant="success" size="md"><HiCheck className="w-3.5 h-3.5" /> End-to-End Encrypted</Badge>
            </div>
            <div className="flex items-center justify-between"><Toggle enabled={meetingLock} onChange={(v) => updatePrefs({ meetingLock: v })} label="Auto-lock meetings after all participants join" /></div>
            <div className="flex items-center justify-between"><Toggle enabled={requireAuth} onChange={(v) => updatePrefs({ requireAuth: v })} label="Require authentication to join" /></div>
          </div>
        </Card>
      </motion.div>

      {/* Device Sessions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><HiDesktopComputer className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
            <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Device Sessions</h2><p className="text-xs text-gray-500 dark:text-slate-400">Manage your active sessions across devices</p></div>
          </div>
          <Button variant="ghost" size="sm" icon={HiRefresh} onClick={handleRefreshSessions}>Refresh</Button>
        </div>
        <Card>
          <div className="space-y-4">
            {sessions.map((session) => {
              const isRevoked = revokedSessions.includes(session.id);
              if (isRevoked) return null;
              return (
                <motion.div key={session.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${session.active ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-slate-600'}`}>
                      <HiDesktopComputer className={`w-5 h-5 ${session.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{session.device}</p>
                        {session.active && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"><HiGlobe className="w-3 h-3" />{session.browser}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400"><HiLocationMarker className="w-3 h-3" />{session.location}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">{session.time}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowRevokeModal(session)}>Revoke</Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Login History */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><HiLogin className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Login History</h2><p className="text-xs text-gray-500 dark:text-slate-400">Recent login attempts to your account</p></div>
        </div>
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Device</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">IP Address</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loginHistory.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-3 text-gray-900 dark:text-white">{entry.date}</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-slate-400">{entry.time}</td>
                    <td className="px-6 py-3"><span className="flex items-center gap-1.5 text-gray-900 dark:text-white"><HiDesktopComputer className="w-4 h-4 text-gray-400" />{entry.device}</span></td>
                    <td className="px-6 py-3 text-gray-500 dark:text-slate-400">{entry.location}</td>
                    <td className="px-6 py-3 text-gray-500 dark:text-slate-400 font-mono text-xs">{entry.ip}</td>
                    <td className="px-6 py-3">
                      {entry.status === 'success' ? (
                        <Badge variant="success" size="sm" dot>Success</Badge>
                      ) : (
                        <Badge variant="danger" size="sm" dot>Failed</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Access Logs */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center"><HiClock className="w-5 h-5 text-sky-600 dark:text-sky-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Access Logs</h2><p className="text-xs text-gray-500 dark:text-slate-400">Detailed audit trail of account activity</p></div>
        </div>
        <Card>
          <div className="space-y-2">
            {accessLogs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                    <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{log.user} — {log.detail}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 font-mono">IP: {log.ip}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Trusted Devices */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><HiDeviceMobile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trusted Devices</h2><p className="text-xs text-gray-500 dark:text-slate-400">Devices that can bypass two-factor authentication</p></div>
        </div>
        <Card>
          <div className="space-y-3">
            {trustedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 flex items-center justify-center border border-gray-200 dark:border-slate-600">
                    <HiDesktopComputer className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{device.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{device.device} · {device.browser}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">Trusted since {device.added}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" icon={HiTrash} onClick={() => setShowRemoveDevice(device)}>Remove</Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><HiFingerPrint className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h2><p className="text-xs text-gray-500 dark:text-slate-400">Add an extra layer of security to your account</p></div>
        </div>
        <Card>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Secure your account with an authenticator app</p>
              </div>
              <Button variant={show2FA ? 'outline' : 'primary'} size="sm" onClick={() => setShow2FA(!show2FA)}>
                {show2FA ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
            {show2FA && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 p-5 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 bg-white dark:bg-slate-600 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-500 flex items-center justify-center">
                    <div className="text-center">
                      <HiQrcode className="w-10 h-10 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-400 mt-1">QR Code</p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Setup Instructions</p>
                    <ol className="text-xs text-gray-500 dark:text-slate-400 space-y-1.5 list-decimal list-inside">
                      <li>Install an authenticator app (Google Authenticator, Authy)</li>
                      <li>Scan the QR code using the app</li>
                      <li>Enter the verification code from the app below</li>
                    </ol>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 font-mono bg-gray-100 dark:bg-slate-600 p-2 rounded">ORIX VN2A 5K7Q 9P3W 8M1J 4H6B</p>
                  </div>
                </div>
                <div className="max-w-xs">
                  <Input label="Verification Code" placeholder="Enter 6-digit code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)} className="rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" />
                  Remember this device for 30 days
                </label>
                <div className="flex gap-3">
                  <Button size="sm" onClick={handleActivate2FA}>Verify & Activate</Button>
                  <Button variant="secondary" size="sm" onClick={() => { setShow2FA(false); setVerificationCode(''); }}>Cancel</Button>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">Backup Codes</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Save these one-time recovery codes in a safe place in case you lose access to your authenticator app.</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {backupCodes.map((code) => (
                      <div key={code} className="flex items-center gap-1 text-xs font-mono bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded text-gray-700 dark:text-slate-300">
                        <span className="flex-1">{code}</span>
                        <button
                          onClick={() => { navigator.clipboard?.writeText(code); toast.success('Backup code copied to clipboard'); }}
                          className="p-0.5 hover:text-primary-500 transition-colors"
                          aria-label={`Copy backup code ${code}`}
                        >
                          <HiDocumentDuplicate className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline" onClick={handleRegenerateCodes}>Generate new codes</button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Privacy Settings */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center"><HiEye className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Settings</h2><p className="text-xs text-gray-500 dark:text-slate-400">Control your visibility on the platform</p></div>
        </div>
        <Card>
          <div className="space-y-5">
            <div className="flex items-center justify-between"><Toggle enabled={profileVisible} onChange={(v) => updatePrefs({ profileVisible: v })} label="Make my profile visible to others" /></div>
            <div className="flex items-center justify-between"><Toggle enabled={onlineVisible} onChange={(v) => updatePrefs({ onlineVisible: v })} label="Show my online status" /></div>
            <div className="flex items-center justify-between"><Toggle enabled={showEmail} onChange={(v) => updatePrefs({ showEmail: v })} label="Show email address to other participants" /></div>
          </div>
        </Card>
      </motion.div>

      {/* Permissions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><HiShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
          <div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Permissions</h2><p className="text-xs text-gray-500 dark:text-slate-400">Default permissions for meeting participants</p></div>
        </div>
        <Card>
          <div className="space-y-5">
            <div className="flex items-center justify-between"><Toggle enabled={camAccess} onChange={(v) => updatePrefs({ camAccess: v })} label={<span className="flex items-center gap-2"><HiCamera className="w-4 h-4" />Camera access</span>} /></div>
            <div className="flex items-center justify-between"><Toggle enabled={micAccess} onChange={(v) => updatePrefs({ micAccess: v })} label={<span className="flex items-center gap-2"><HiMicrophone className="w-4 h-4" />Microphone access</span>} /></div>
            <div className="flex items-center justify-between"><Toggle enabled={screenAccess} onChange={(v) => updatePrefs({ screenAccess: v })} label={<span className="flex items-center gap-2"><HiDesktopComputer className="w-4 h-4" />Screen share access</span>} /></div>
            <div className="flex items-center justify-between"><Toggle enabled={chatAccess} onChange={(v) => updatePrefs({ chatAccess: v })} label={<span className="flex items-center gap-2"><HiChatAlt className="w-4 h-4" />Chat access for all roles</span>} /></div>
          </div>
        </Card>
      </motion.div>

      {/* Revoke Session Modal */}
      <Modal isOpen={!!showRevokeModal} onClose={() => setShowRevokeModal(null)} title="Revoke Session" size="sm"
        footer={<><Button variant="secondary" size="sm" onClick={() => setShowRevokeModal(null)}>Cancel</Button><Button variant="danger" size="sm" onClick={() => handleRevoke(showRevokeModal)}>Revoke Session</Button></>}>
        <p className="text-sm text-gray-500 dark:text-slate-400">Are you sure you want to revoke this session? The device will be signed out immediately.</p>
      </Modal>

      {/* Remove Device Modal */}
      <Modal isOpen={!!showRemoveDevice} onClose={() => setShowRemoveDevice(null)} title="Remove Trusted Device" size="sm"
        footer={<><Button variant="secondary" size="sm" onClick={() => setShowRemoveDevice(null)}>Cancel</Button><Button variant="danger" size="sm" onClick={() => handleRemoveDevice(showRemoveDevice)}>Remove Device</Button></>}>
        <p className="text-sm text-gray-500 dark:text-slate-400">Are you sure you want to remove "{showRemoveDevice?.name}" from trusted devices?</p>
      </Modal>
    </motion.div>
    </>
  );
}
