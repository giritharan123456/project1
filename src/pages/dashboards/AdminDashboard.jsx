import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiUserGroup, HiVideoCamera, HiServer, HiCloudUpload,
  HiUsers, HiMail, HiCog,
  HiDocumentText, HiCreditCard, HiArrowSmUp, HiArrowSmDown,
  HiPlusCircle, HiDownload, HiExclamationCircle, HiCheck,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import BarChartCard from '../../components/charts/BarChartCard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import Modal from '../../components/ui/Modal';
import ActivityFeed from '../../components/common/ActivityFeed';
import NotificationCenter from '../../components/common/NotificationCenter';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import TodayBriefing from '../../components/dashboard/TodayBriefing';
import DashboardCalendarWidget from '../../components/dashboard/DashboardCalendarWidget';
import TaskListWidget from '../../components/dashboard/TaskListWidget';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};



const relativeTime = (iso) => {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const userDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const roleSummary = [
  { label: 'Administrators', role: 'admin' },
  { label: 'Executives', role: 'executive' },
  { label: 'Managers', role: 'manager' },
  { label: 'HR', role: 'hr' },
  { label: 'Hosts', role: 'host' },
  { label: 'Employees', role: 'employee' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, userNotifications, unreadNotifications, markNotificationRead, broadcastEmergencyAlert, users, activityLog, pendingRegistrations, approveRegistration, rejectRegistration } = useApp();
  const navigate = useNavigate();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');

  const dailyNewUsers = useMemo(() => {
    const daily = users.reduce((acc, u, i) => {
      const index = i % 7;
      acc[index] += 1;
      return acc;
    }, [0, 0, 0, 0, 0, 0, 0]);
    return daily;
  }, [users]);

  const systemResources = useMemo(() => [
    { label: 'CPU', value: dashboardMetrics.cpuUsage || 45 },
    { label: 'Memory', value: dashboardMetrics.memoryUsage || 62 },
    { label: 'Storage', value: dashboardMetrics.storageUsed || 31 },
    { label: 'Network', value: dashboardMetrics.networkUsage || 28 },
    { label: 'Database', value: dashboardMetrics.databaseConnections || 54 },
  ], [dashboardMetrics]);

  const billingInvoices = useMemo(() => dashboardMetrics.billingInvoices?.length > 0
    ? dashboardMetrics.billingInvoices.map(inv => ({
        id: inv.id || `INV-${2026}-${Math.random().toString(36).substr(2, 3)}`,
        date: inv.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: `$${inv.amount || 299}.00`,
        status: inv.status || (Math.random() > 0.7 ? 'pending' : 'paid'),
      }))
    : [
        { id: 'INV-2026-008', date: 'Aug 1, 2026', amount: '$299.00', status: 'pending' },
        { id: 'INV-2026-007', date: 'Jul 1, 2026', amount: '$299.00', status: 'paid' },
        { id: 'INV-2026-006', date: 'Jun 1, 2026', amount: '$299.00', status: 'paid' },
        { id: 'INV-2026-005', date: 'May 1, 2026', amount: '$299.00', status: 'paid' },
      ], [dashboardMetrics]);

  const usageLimits = useMemo(() => [
    { label: 'Seats', used: dashboardMetrics.seatsUsed || 10, limit: dashboardMetrics.seatsLimit || 25 },
    { label: 'Storage', used: dashboardMetrics.storageUsed || 31, limit: dashboardMetrics.storageLimit || 100 },
    { label: 'Monthly Meeting Minutes', used: dashboardMetrics.meetingMinutesUsed || 64, limit: dashboardMetrics.meetingMinutesLimit || 100 },
  ], [dashboardMetrics]);

  const liveActivityLog = useMemo(() => activityLog.slice(0, 5).map(entry => ({
    id: entry.id,
    user: users.find(u => u.id === entry.user)?.name || entry.user,
    action: entry.action || entry.type || 'event',
    target: entry.type ? entry.type.charAt(0).toUpperCase() + entry.type.slice(1) : 'System',
    time: relativeTime(entry.timestamp),
  })), [activityLog, users]);

  const livePendingInvitations = useMemo(() => pendingRegistrations.slice(0, 5).map(reg => ({
    id: reg.id,
    email: reg.email,
    role: reg.role || 'employee',
    sent: reg.submittedAt ? relativeTime(reg.submittedAt) : 'recently',
  })), [pendingRegistrations]);

  const liveUserRoleDist = useMemo(() => {
    const groups = [
      { label: 'Employees', roles: ['employee'] },
      { label: 'Managers', roles: ['manager', 'host'] },
      { label: 'Admins', roles: ['admin'] },
      { label: 'HR', roles: ['hr'] },
      { label: 'Executives', roles: ['ceo', 'executive'] },
    ];
    return groups.map(g => ({ label: g.label, value: users.filter(u => g.roles.includes(u.role)).length }));
  }, [users]);

  const handleEmergencyBroadcast = () => {
    if (!emergencyTitle.trim() || !emergencyMessage.trim()) { toast.error('Title and message are required'); return; }
    broadcastEmergencyAlert({ title: emergencyTitle, message: emergencyMessage });
    setEmergencyTitle('');
    setEmergencyMessage('');
    setShowEmergencyModal(false);
    toast.success('Emergency alert sent to all users!');
  };
  const adminStats = [
    { label: 'Total Users', value: `${dashboardMetrics.totalEmployees}`, icon: HiUserGroup, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', change: '+2', up: true },
    { label: 'Active Today', value: `${dashboardMetrics.activeUsers}`, icon: HiUsers, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', change: '60%', up: true },
    { label: 'Meetings Today', value: `${dashboardMetrics.meetingsToday}`, icon: HiVideoCamera, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', change: '+18%', up: true },
    { label: 'System Uptime', value: `${dashboardMetrics.systemUptime.toFixed(1)}%`, icon: HiCloudUpload, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', change: '31%', up: false },
  ];

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <>
    <Helmet>
      <title>Admin Dashboard - AdzConnect</title>
      <meta name="description" content="AdzConnect admin dashboard for system management, user oversight, analytics, and configuration." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      <motion.div variants={itemVariants}>
        <WelcomeBanner user={user} role="Admin" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.up ? <HiArrowSmUp className="w-3 h-3" /> : <HiArrowSmDown className="w-3 h-3" />}
                {stat.change}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <TodayBriefing metrics={dashboardMetrics} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:order-2 lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChartCard
              data={dailyNewUsers}
              labels={userDayLabels}
              title="New Users This Week"
              barColor="#3b82f6"
              height={200}
            />

            <AreaChartCard
              data={systemResources}
              title="System Resource Usage"
              badge="Current %"
              height={200}
            />
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent User Activity</h2>
              <Button variant="ghost" size="sm" icon={HiDocumentText} onClick={() => navigate('/app/admin/logs')}>View Logs</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Action</th>
                    <th className="pb-3 font-medium">Target</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {liveActivityLog.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={a.user} size="xs" />
                          <span className="font-medium text-gray-900 dark:text-white">{a.user}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-slate-400">{a.action}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-slate-400">{a.target}</td>
                      <td className="py-3 text-gray-400 dark:text-slate-500">{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <ActivityFeed />

          <DonutChartCard
            data={liveUserRoleDist}
            title="User Role Distribution"
            size={180}
          />
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Admin Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Export system analytics</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...liveActivityLog, { label: 'Active Users', value: dashboardMetrics.activeUsers }, { label: 'Meetings Today', value: dashboardMetrics.meetingsToday }, { label: 'System Uptime', value: `${dashboardMetrics.systemUptime.toFixed(1)}%` }, { label: 'Active Sessions', value: dashboardMetrics.activeSessions }], 'system-audit-log.csv')}>Audit Log</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...systemResources, { label: 'Active Users', value: dashboardMetrics.activeUsers }, { label: 'Total Employees', value: dashboardMetrics.totalEmployees }, { label: 'Pending Approvals', value: dashboardMetrics.pendingApprovals }, { label: 'Response Time', value: `${dashboardMetrics.responseTime}ms` }], 'system-resources.csv')}>Resource Usage</Button>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center gap-2 mb-2">
              <HiServer className="w-5 h-5" />
              <h3 className="font-semibold">Platform Uptime</h3>
            </div>
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-white/80 text-sm mt-1">Last 30 days — All systems nominal</p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:order-1 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Invitations</h2>
              <Badge variant="warning" size="sm">{livePendingInvitations.length} pending</Badge>
            </div>
            <div className="space-y-3">
              {livePendingInvitations.map((inv) => (
                <div key={inv.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                      <HiMail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inv.email}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{inv.role} — Submitted {inv.sent}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="xs" className="flex-1" icon={HiCheck} onClick={() => { approveRegistration(inv.id); toast.success(`Invitation approved for ${inv.email}`); }}>Approve</Button>
                    <Button variant="ghost" size="xs" className="flex-1" onClick={() => { rejectRegistration(inv.id); toast.success(`Invitation cancelled for ${inv.email}`); }}>Cancel</Button>
                  </div>
                </div>
              ))}
              {livePendingInvitations.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No pending invitations</p>
              )}
              <Button variant="outline" fullWidth size="sm" icon={HiPlusCircle} onClick={() => navigate('/app/admin/users')}>New Invitation</Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth icon={HiUserGroup} size="md" onClick={() => navigate('/app/admin/users')}>Invite Users</Button>
              <Button variant="outline" fullWidth icon={HiCog} size="md" onClick={() => navigate('/app/admin/settings')}>System Settings</Button>
              <Button variant="secondary" fullWidth icon={HiDocumentText} size="md" onClick={() => navigate('/app/admin/logs')}>View Logs</Button>
              <Button variant="secondary" fullWidth icon={HiCreditCard} size="md" onClick={() => setShowBillingModal(true)}>Manage Billing</Button>
              <Button variant="danger" fullWidth icon={HiExclamationCircle} size="md" onClick={() => setShowEmergencyModal(true)}>Emergency Broadcast</Button>
            </div>
          </Card>

          <Modal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} title="Emergency Broadcast" size="sm" role="alertdialog">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Title</label>
                <input type="text" value={emergencyTitle} onChange={(e) => setEmergencyTitle(e.target.value)} placeholder="Emergency alert title" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Message</label>
                <textarea value={emergencyMessage} onChange={(e) => setEmergencyMessage(e.target.value)} placeholder="Describe the emergency..." rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
              <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                <HiExclamationCircle className="w-4 h-4 flex-shrink-0" />
                This will be sent to every user with urgent priority.
              </p>
              <Button variant="danger" fullWidth onClick={handleEmergencyBroadcast}>Send Emergency Broadcast</Button>
            </div>
          </Modal>

          {/* Billing Modal */}
          <Modal isOpen={showBillingModal} onClose={() => setShowBillingModal(false)} title="Billing & Usage" size="md"
            footer={<>
              <Button variant="secondary" size="sm" onClick={() => setShowBillingModal(false)}>Close</Button>
              <Button variant="primary" size="sm" icon={HiCreditCard} onClick={() => toast.success('Plan upgrade initiated — our team will reach out')}>Upgrade Plan</Button>
            </>}>
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Enterprise Plan</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">$299/month · Billed annually · Next payment Sep 1, 2026</p>
                  </div>
                  <Badge variant="primary" size="sm"><HiCheck className="w-3 h-3" /> Active</Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Usage</h4>
                <div className="space-y-3">
                  {usageLimits.map((u) => {
                    const pct = Math.min(100, Math.round((u.used / u.limit) * 100));
                    return (
                      <div key={u.label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-slate-400">{u.label}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{u.used} / {u.limit}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700">
                          <div className={`h-1.5 rounded-full ${pct >= 85 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-primary-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Invoices</h4>
                  <Badge size="sm">{billingInvoices.filter((i) => i.status === 'paid').length} paid</Badge>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-700 border border-gray-100 dark:border-slate-700 rounded-xl overflow-hidden">
                  {billingInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white">{inv.id}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{inv.amount}</span>
                        <Badge size="xs" variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                        <button onClick={() => toast.success(`${inv.id} downloaded`)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300" aria-label={`Download ${inv.id}`}>
                          <HiDownload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Visa •••• 4242</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">Expires 08/28</p>
                </div>
                <Button variant="ghost" size="xs" onClick={() => toast.success('Payment method updated')}>Update</Button>
              </div>
            </div>
          </Modal>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Access Control</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/permissions')}>Manage</Button>
            </div>
            <div className="space-y-2">
              {roleSummary.map((r) => {
                const count = users.filter(u => u.role === r.role).length;
                return (
                  <div key={r.role} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                    <span className="text-sm text-gray-600 dark:text-slate-400">{r.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <DashboardCalendarWidget />
          <TaskListWidget />

          <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markNotificationRead} />
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
