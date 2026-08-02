import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiClock, HiUserGroup, HiBriefcase,
  HiChartBar, HiGlobe,
  HiTrendingUp,
  HiArrowSmUp, HiArrowSmDown, HiCalendar,
  HiDocumentReport, HiDownload,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { exportToCSV } from '../../utils/export';
import BarChartCard from '../../components/charts/BarChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import ActivityFeed from '../../components/common/ActivityFeed';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import TodayBriefing from '../../components/dashboard/TodayBriefing';
import DashboardCalendarWidget from '../../components/dashboard/DashboardCalendarWidget';
import TaskListWidget from '../../components/dashboard/TaskListWidget';
import NotificationCenter from '../../components/common/NotificationCenter';
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



const topDepartments = [
  { name: 'Engineering', score: 94, meetings: 89, efficiency: 96 },
  { name: 'Design', score: 91, meetings: 56, efficiency: 88 },
  { name: 'Marketing', score: 87, meetings: 42, efficiency: 85 },
  { name: 'Operations', score: 82, meetings: 28, efficiency: 79 },
];

const formatMeetingTime = (t) => {
  if (!t) return '—';
  const parts = String(t).split(':');
  if (parts.length < 2) return t;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${m} ${ampm}`;
};

const formatMeetingDate = (d) => {
  if (!d) return '—';
  const today = new Date().toISOString().split('T')[0];
  if (d === today) return 'Today';
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (d === tomorrow) return 'Tomorrow';
  return new Date(`${d}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ExecutiveDashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, userNotifications, unreadNotifications, markAllNotificationsRead, meetings, users } = useApp();
  const navigate = useNavigate();

  const collabData = useMemo(() => users.length > 0
     ? Object.values(
           users.reduce((acc, u) => {
             const dept = u.department || 'General';
             const level = [u.role, u.title].filter(Boolean).join(' / ');
             const key = level ? `${dept} × ${level}` : dept;
             if (!acc[key]) {
               acc[key] = {
                 dept: key,
                 value: Math.floor(Math.random() * 40) + 30,
                 color: ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500'][Math.floor(Math.random() * 5)],
               };
             }
             acc[key].value = Math.min(100, acc[key].value + Math.floor(Math.random() * 10));
             return acc;
           }, {})
        )
     : (
         [
           { dept: 'Eng × Design', value: 85, color: 'bg-blue-500' },
           { dept: 'Eng × Product', value: 72, color: 'bg-indigo-500' },
           { dept: 'Design × Mktg', value: 64, color: 'bg-violet-500' },
           { dept: 'Product × Sales', value: 58, color: 'bg-purple-500' },
           { dept: 'Eng × Ops', value: 45, color: 'bg-pink-500' },
         ]
      ), [users]);

  const collabScores = useMemo(() => users.length > 0
     ? Object.values(
           users.reduce((acc, u) => {
             const dept = u.department || 'General';
             const level = [u.role, u.title].filter(Boolean).join(' / ');
             const key = level ? `${dept} × ${level}` : dept;
             if (!acc[key]) {
               acc[key] = Math.floor(Math.random() * 40) + 30;
             }
             acc[key] = Math.min(100, acc[key] + Math.floor(Math.random() * 10));
             return acc;
           }, {})
        )
     : ([
         85,
         72,
         64,
         58,
         45,
       ]), [users]);

  const collabLabels = useMemo(() => users.length > 0
     ? Object.values(
           users.reduce((acc, u) => {
             const dept = u.department || 'General';
             const level = [u.role, u.title].filter(Boolean).join(' / ');
             const key = level ? `${dept} × ${level}` : dept;
             if (!acc[key]) {
               acc[key] = key;
             }
             return acc;
           }, {})
        )
     : [
         'Eng × Design',
         'Eng × Product',
         'Design × Mktg',
         'Product × Sales',
         'Eng × Ops',
       ], [users]);

  const meetingTypeDist = useMemo(() => users.length > 0
     ? meetings.length > 0
         ? Object.entries(
               meetings.reduce((acc, m) => {
                 const type = m.type || m.category || 'Internal';
                 if (!acc[type]) acc[type] = 0;
                 acc[type] += 1;
                 return acc;
               }, {})
             ).map(([label, value]) => ({ label, value }))
         : []
     : [
         { label: 'Internal', value: 45 },
         { label: 'Client', value: 28 },
         { label: 'Strategy', value: 15 },
         { label: 'Review', value: 12 },
       ], [users, meetings]);

  const quarterlyGrowth = useMemo(() => dashboardMetrics.companyGrowth > 0
     ? [
         { label: 'Q1', value: Math.max(0, dashboardMetrics.companyGrowth - 50) },
         { label: 'Q2', value: Math.max(0, dashboardMetrics.companyGrowth - 35) },
         { label: 'Q3', value: Math.max(0, dashboardMetrics.companyGrowth - 20) },
         { label: 'Q4', value: dashboardMetrics.companyGrowth },
       ]
  : [
          { label: 'Q1', value: 12 },
          { label: 'Q2', value: 18 },
          { label: 'Q3', value: 24 },
          { label: 'Q4', value: 30 },
        ], [dashboardMetrics.companyGrowth]);

  const execMeetings = useMemo(() => {
    return meetings
      .filter(m => (m.participants?.includes(user?.id) || m.host === user?.id) && ['live', 'upcoming'].includes(m.status))
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        title: m.title,
        date: formatMeetingDate(m.date),
        time: formatMeetingTime(m.time),
        attendees: m.participants?.length || 0,
      }));
  }, [meetings, user]);
  const execStats = [
    { label: 'Meetings This Week', value: `${dashboardMetrics.meetingsThisWeek}`, icon: HiVideoCamera, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-500/10', change: '+18%', up: true },
    { label: 'Active Sessions', value: `${dashboardMetrics.activeSessions}`, icon: HiClock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', change: '+12%', up: true },
    { label: 'Reports Generated', value: `${dashboardMetrics.reportsGenerated}`, icon: HiBriefcase, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', change: '+32%', up: true },
    { label: 'System Uptime', value: `${dashboardMetrics.systemUptime.toFixed(1)}%`, icon: HiGlobe, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10', change: '+8%', up: true },
  ];

  useEffect(() => {
    if (user && user.role !== 'executive') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <>
    <Helmet>
      <title>Executive Dashboard - AdzConnect</title>
      <meta name="description" content="AdzConnect executive dashboard with high-level company metrics, meeting insights, and strategic analytics." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <WelcomeBanner user={user} role="Executive" />
        <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {execStats.map((stat) => (
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

      <TodayBriefing metrics={dashboardMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChartCard
              data={collabScores}
              labels={collabLabels}
              title="Cross-Dept Collaboration"
              barColor="#3b82f6"
              height={220}
            />

            <DonutChartCard
              data={meetingTypeDist}
              title="Meeting Type Distribution"
              size={180}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Exec Meetings</h2>
                <Badge variant="warning" size="sm">{execMeetings.length} scheduled</Badge>
              </div>
              <div className="space-y-3">
                {execMeetings.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{m.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><HiCalendar className="w-3 h-3" />{m.date}</span>
                      <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{m.time}</span>
                      <span className="flex items-center gap-1"><HiUserGroup className="w-3 h-3" />{m.attendees}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <AreaChartCard
              data={quarterlyGrowth}
              title="Quarterly Growth %"
              badge="2026"
              height={200}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth icon={HiChartBar} size="md" onClick={() => navigate('/app/analytics')}>View Analytics</Button>
              <Button variant="outline" fullWidth icon={HiCalendar} size="md" onClick={() => navigate('/app/schedule')}>Schedule Strategy</Button>
              <Button variant="secondary" fullWidth icon={HiDocumentReport} size="md" onClick={() => navigate('/app/reports')}>Review Reports</Button>
            </div>
          </Card>

          <DashboardCalendarWidget />
          <TaskListWidget />

          <ActivityFeed />

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Rankings</h2>
            <div className="space-y-3">
              {topDepartments.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-slate-500'
                  }`}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{d.meetings} meetings — {d.efficiency}% eff.</p>
                  </div>
                  <Badge variant={d.score >= 90 ? 'success' : d.score >= 80 ? 'info' : 'warning'} size="sm">{d.score}%</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Executive Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Export business intelligence</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...topDepartments, { name: 'Active Users', score: dashboardMetrics.activeUsers, meetings: dashboardMetrics.meetingsToday, efficiency: dashboardMetrics.avgAttendance }, { name: 'System Uptime', score: Math.round(dashboardMetrics.systemUptime), meetings: dashboardMetrics.activeSessions, efficiency: dashboardMetrics.productivity }, { name: 'Reports Generated', score: dashboardMetrics.reportsGenerated, meetings: 0, efficiency: 100 }], 'company-analytics.csv')}>Company Analytics</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...collabData, { dept: 'Active Users', value: dashboardMetrics.activeUsers, color: 'bg-cyan-500' }, { dept: 'Active Sessions', value: dashboardMetrics.activeSessions, color: 'bg-teal-500' }, { dept: 'System Uptime', value: Math.round(dashboardMetrics.systemUptime), color: 'bg-emerald-500' }, { dept: 'Reports Generated', value: dashboardMetrics.reportsGenerated, color: 'bg-blue-500' }], 'department-collab.csv')}>Dept Summary</Button>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-slate-700 to-slate-900 text-white">
            <HiTrendingUp className="w-8 h-8 mb-2 text-emerald-300" />
            <h3 className="font-semibold text-lg">Revenue Impact</h3>
            <p className="text-3xl font-bold mt-1">$1.8M</p>
            <p className="text-white/80 text-sm mt-1">Meeting-driven revenue this quarter</p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}
