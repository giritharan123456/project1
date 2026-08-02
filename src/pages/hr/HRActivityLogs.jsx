import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiClock, HiUser, HiUserGroup, HiClipboardCheck, HiDownload,
  HiVideoCamera, HiChat, HiCheckCircle, HiBell, HiShieldCheck,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { exportToCSV } from '../../utils/export';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TYPE_META = {
  meeting: { label: 'Meeting', icon: HiVideoCamera, variant: 'primary' },
  message: { label: 'Message', icon: HiChat, variant: 'info' },
  task: { label: 'Task', icon: HiCheckCircle, variant: 'success' },
  notification: { label: 'Notification', icon: HiBell, variant: 'warning' },
  approval: { label: 'Approval', icon: HiClipboardCheck, variant: 'warning' },
  auth: { label: 'Auth', icon: HiShieldCheck, variant: 'danger' },
};

const SEED_ACTIVITY = [
  { id: 'hrl-1', type: 'approval', action: 'Approved registration for Olivia Martinez', user: 'James Wilson', role: 'hr', timestamp: '2026-08-01T09:20:00.000Z' },
  { id: 'hrl-2', type: 'meeting', action: 'Scheduled orientation for new hires', user: 'Sarah Chen', role: 'manager', timestamp: '2026-07-31T16:00:00.000Z' },
  { id: 'hrl-3', type: 'task', action: 'Completed onboarding checklist for Amanda White', user: 'James Wilson', role: 'hr', timestamp: '2026-07-31T14:30:00.000Z' },
  { id: 'hrl-4', type: 'notification', action: 'Sent leave approval notice', user: 'James Wilson', role: 'hr', timestamp: '2026-07-31T11:00:00.000Z' },
  { id: 'hrl-5', type: 'auth', action: 'Admin role granted to Sarah Chen', user: 'System', role: 'admin', timestamp: '2026-07-30T09:00:00.000Z' },
];

export default function HRActivityLogs() {
  const { activityLog } = useApp();
  const [active, setActive] = useHRTab('recent');

  const logs = useMemo(() => {
    const list = activityLog && activityLog.length > 0 ? activityLog : SEED_ACTIVITY;
    return [...list].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activityLog]);

  const tabs = [
    { key: 'recent', label: 'Recent Activity', icon: HiClock },
    { key: 'employees', label: 'Employee Activity', icon: HiUser },
    { key: 'hr', label: 'HR Activity', icon: HiUserGroup },
    { key: 'approvals', label: 'Approval Activity', icon: HiClipboardCheck },
  ];

  const filtered = useMemo(() => {
    if (active === 'employees') return logs.filter((l) => l.role === 'employee');
    if (active === 'hr') return logs.filter((l) => l.role === 'hr');
    if (active === 'approvals') return logs.filter((l) => l.type === 'approval');
    return logs.slice(0, 20);
  }, [logs, active]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Activity Logs - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Audit trail of employee and HR actions</p>
        </div>
        <Button variant="primary" size="sm" icon={HiDownload} onClick={() => exportToCSV(filtered, 'activity-logs.csv')}>Export Logs</Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{logs.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Events</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-primary-600">{logs.filter((l) => l.type === 'meeting').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Meeting Events</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{logs.filter((l) => l.type === 'approval').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Approvals</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{logs.filter((l) => l.type === 'task').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Task Events</p></Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HRSectionTabs tabs={tabs} active={active} onChange={setActive} />
      </motion.div>

      <motion.div variants={itemVariants} key={active}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{tabs.find((t) => t.key === active)?.label}</h2>
            <Badge variant="primary" size="sm">{filtered.length} events</Badge>
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No activity recorded</p>
            ) : filtered.map((log) => {
              const meta = TYPE_META[log.type] || TYPE_META.notification;
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <meta.icon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-slate-300">{log.action}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                        <Avatar name={log.user} size="xs" /> {log.user}
                      </div>
                      <Badge variant={meta.variant} size="xs">{meta.label}</Badge>
                      <Badge variant="default" size="xs">{log.role}</Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
