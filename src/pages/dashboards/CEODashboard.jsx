import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiTrendingUp, HiCurrencyDollar, HiStar, HiLightningBolt,
  HiUserGroup, HiChartBar,
  HiArrowSmUp, HiArrowSmDown, HiSparkles, HiFlag,
  HiGlobe, HiCog, HiSpeakerphone,
  HiDownload, HiDocumentText,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import LineChartCard from '../../components/charts/LineChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import Sparkline from '../../components/charts/Sparkline';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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



const topPriorities = [
  { id: 1, title: 'Q3 Product Launch', deadline: 'Aug 15', status: 'On Track', owner: 'Sarah C.', variant: 'success' },
  { id: 2, title: 'Hiring — Sr. Engineers', deadline: 'Sep 1', status: 'At Risk', owner: 'HR Team', variant: 'warning' },
  { id: 3, title: 'Market Expansion EU', deadline: 'Q4 2026', status: 'Planning', owner: 'Mike J.', variant: 'info' },
  { id: 4, title: 'Security Audit', deadline: 'Aug 30', status: 'On Track', owner: 'Ops', variant: 'success' },
];

const companyGrowthTrend = [
  { week: 'W1', growth: 40 },
  { week: 'W2', growth: 55 },
  { week: 'W3', growth: 62 },
  { week: 'W4', growth: 78 },
  { week: 'W5', growth: 90 },
  { week: 'W6', growth: 127 },
];

const revenueBreakdown = [
  { label: 'Product', value: 42 },
  { label: 'Services', value: 28 },
  { label: 'Subscriptions', value: 18 },
  { label: 'Other', value: 12 },
];

const financialTrend = [
  { month: 'Feb', revenue: 220, profit: 52 },
  { month: 'Mar', revenue: 260, profit: 61 },
  { month: 'Apr', revenue: 245, profit: 58 },
  { month: 'May', revenue: 290, profit: 70 },
  { month: 'Jun', revenue: 320, profit: 78 },
  { month: 'Jul', revenue: 345, profit: 84 },
];

const kpisVsTarget = [
  { label: 'Revenue Growth', current: 18, target: 20, suffix: '%' },
  { label: 'EBITDA Margin', current: 24, target: 25, suffix: '%' },
  { label: 'NPS', current: 62, target: 60, suffix: '' },
  { label: 'Employee Retention', current: 91, target: 90, suffix: '%' },
  { label: 'Meeting Efficiency', current: 82, target: 85, suffix: '%' },
  { label: 'Operational Health', current: 94, target: 90, suffix: '%' },
];

function FinancialTrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600 dark:text-slate-300">{p.name}: ${p.value}K</p>
      ))}
    </div>
  );
}

export default function CEODashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, createInstantMeeting, userNotifications, unreadNotifications, markAllNotificationsRead, users, notifications, meetings, attendanceRecords } = useApp();
  const navigate = useNavigate();

  const deptComparisonFallback = useMemo(() => users.length > 0
     ? Object.values(
           users.reduce((acc, u) => {
             const dept = u.department || 'General';
             if (!acc[dept]) {
               acc[dept] = {
                 name: dept,
                 growth: Math.floor(Math.random() * 20) + 10,
                 satisfaction: Math.round((Math.random() * 1 + 3) * 10) / 10,
                 meetings: Math.floor(Math.random() * 100),
                 efficiency: Math.floor(Math.random() * 30) + 70,
               };
             }
             acc[dept].growth = Math.min(100, acc[dept].growth + Math.floor(Math.random() * 10));
             return acc;
           }, {})
        )
     : (
         [
           { name: 'Engineering', growth: 34, satisfaction: 4.9, meetings: 89, efficiency: 96 },
           { name: 'Design', growth: 28, satisfaction: 4.7, meetings: 56, efficiency: 88 },
           { name: 'Marketing', growth: 22, satisfaction: 4.5, meetings: 42, efficiency: 85 },
           { name: 'Operations', growth: 16, satisfaction: 4.3, meetings: 28, efficiency: 79 },
         ]
      ), [users]);

  const fallbackAnnouncements = useMemo(() => notifications.length > 0
    ? notifications
        .filter(n => n.type === 'announcement' || n.type === 'update')
        .slice(0, 3)
        .map((n, i) => ({
          id: n.id,
          title: n.title,
          date: n.time ? new Date(n.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Jul ${28 - i}`,
          author: n.sender || 'Admin',
          badge: n.priority === 'urgent' ? 'Urgent' : i === 0 ? 'New' : 'Announcement',
        }))
    : [
        { id: 1, title: 'New Benefits Package', date: 'Jul 28', author: 'HR', badge: 'New' },
        { id: 2, title: 'Q3 Company Offsite', date: 'Jul 25', author: 'Events', badge: 'Upcoming' },
        { id: 3, title: 'Product Milestone v3.0', date: 'Jul 22', author: 'Engineering', badge: 'Announcement' },
      ], [notifications]);

  const reportLibrary = useMemo(() => users.length > 0
    ? [
        {
          id: 1,
          name: 'Quarterly Board Report',
          file: 'quarterly-board-report.csv',
          rows: [
            { Metric: 'Revenue', Value: `$${Math.round(dashboardMetrics.revenueImpact / 1000000)}M` },
            { Metric: 'Headcount', Value: users.length.toString() },
            { Metric: 'NPS', Value: dashboardMetrics.npsScore.toString() },
          ],
        },
        {
          id: 2,
          name: 'Annual Financial Statement',
          file: 'annual-financial-statement.csv',
          rows: [
            { Metric: 'Total Revenue', Value: `$${Math.round(dashboardMetrics.revenueImpact / 1000000)}M` },
            { Metric: 'Net Income', Value: `$${Math.round(dashboardMetrics.revenueImpact * 0.4 / 1000000)}M` },
            { Metric: 'Total Assets', Value: `$${Math.round(dashboardMetrics.revenueImpact * 1.5 / 1000000)}M` },
          ],
        },
        {
          id: 3,
          name: 'Executive Summary',
          file: 'executive-summary.csv',
          rows: [
            { Metric: 'Company Growth', Value: `${dashboardMetrics.companyGrowth}%` },
            { Metric: 'Team Satisfaction', Value: dashboardMetrics.teamSatisfaction.toString() },
            { Metric: 'Churn Rate', Value: `${dashboardMetrics.churnRate}%` },
          ],
        },
      ].slice(0, 3)
    : [
        {
          id: 1,
          name: 'Quarterly Board Report',
          file: 'quarterly-board-report.csv',
          rows: [{ Metric: 'Revenue', Value: '$4.2M' }, { Metric: 'Headcount', Value: '212' }, { Metric: 'NPS', Value: '62' }],
        },
        {
          id: 2,
          name: 'Annual Financial Statement',
          file: 'annual-financial-statement.csv',
          rows: [{ Metric: 'Total Revenue', Value: '$16.8M' }, { Metric: 'Net Income', Value: '$3.9M' }, { Metric: 'Total Assets', Value: '$42.1M' }],
        },
        {
          id: 3,
          name: 'Executive Summary',
          file: 'executive-summary.csv',
          rows: [{ Metric: 'Company Growth', Value: '127%' }, { Metric: 'Team Satisfaction', Value: '4.8' }, { Metric: 'Churn Rate', Value: '0.9%' }],
        },
        {
          id: 4,
          name: 'P&L Summary',
          file: 'pnl-summary.csv',
          rows: [{ Metric: 'Revenue', Value: '$3.2M' }, { Metric: 'Operating Expenses', Value: '$2.1M' }, { Metric: 'Net Profit', Value: '$840K' }],
        },
        {
          id: 5,
          name: 'Cap Table',
          file: 'cap-table.csv',
          rows: [
            { Metric: 'Common Shares', Value: '12,500,000' },
            { Metric: 'Preferred Shares', Value: '2,100,000' },
            { Metric: 'Options Reserved', Value: '1,200,000' },
          ],
        },
      ], [users, dashboardMetrics]);

  const deptComparison = useMemo(() => {
    const map = {};
    users.forEach(u => {
      const name = u.department || 'General';
      if (!map[name]) map[name] = { count: 0, meetings: 0 };
      map[name].count += 1;
    });
    meetings.forEach(m => {
      const host = users.find(u => u.id === m.host);
      if (host && map[host.department]) map[host.department].meetings += 1;
    });
    const entries = Object.entries(map).sort((a, b) => b[1].count - a[1].count);
    const totalMeetings = Math.max(1, entries.reduce((s, [, v]) => s + v.meetings, 0));
    const recordsByDept = {};
    attendanceRecords.forEach(r => {
      const dept = r.department || 'General';
      if (!recordsByDept[dept]) recordsByDept[dept] = { present: 0, total: 0 };
      recordsByDept[dept].total += 1;
      if (r.status === 'present') recordsByDept[dept].present += 1;
    });
    if (!entries.length) return deptComparisonFallback;
    return entries.map(([name, v]) => ({
      name,
      growth: Math.round((v.meetings / totalMeetings) * 40) + 12,
      satisfaction: dashboardMetrics.teamSatisfaction,
      meetings: v.meetings,
      efficiency: recordsByDept[name] ? Math.round((recordsByDept[name].present / recordsByDept[name].total) * 100) : dashboardMetrics.avgAttendance,
    }));
  }, [users, meetings, attendanceRecords, dashboardMetrics.teamSatisfaction, dashboardMetrics.avgAttendance, deptComparisonFallback]);

  const deptGrowthData = useMemo(() => deptComparison.map(d => d.count), [deptComparison]);
  const deptGrowthLabels = useMemo(() => deptComparison.map(d => d.name), [deptComparison]);

  const announcements = useMemo(() => {
    const live = notifications
      .filter(n => n.type === 'announcement')
      .slice(0, 3)
      .map((n, i) => ({
        id: n.id,
        title: n.title,
        date: n.time ? new Date(n.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        author: n.sender || 'Admin',
        badge: n.priority === 'urgent' ? 'Urgent' : i === 0 ? 'New' : 'Announcement',
      }));
    return live.length ? live : fallbackAnnouncements;
  }, [notifications, fallbackAnnouncements]);

  const ceoStats = [
    { label: 'Company Growth', value: `${dashboardMetrics.companyGrowth}%`, icon: HiTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', change: 'YoY', up: true, sparkline: [40, 55, 62, 78, 90, 105, 127] },
    { label: 'Revenue Impact', value: `$${(dashboardMetrics.revenueImpact / 1000000).toFixed(1)}M`, icon: HiCurrencyDollar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', change: '+18%', up: true, sparkline: [1.2, 1.5, 1.8, 2.0, 2.2, 2.3, 2.4] },
    { label: 'Team Satisfaction', value: `${dashboardMetrics.teamSatisfaction}`, icon: HiStar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', change: '+0.3', up: true, sparkline: [3.8, 4.0, 4.2, 4.4, 4.5, 4.7, 4.8] },
    { label: 'Meeting Efficiency', value: `${dashboardMetrics.avgAttendance}%`, icon: HiLightningBolt, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', change: '+5%', up: true, sparkline: [72, 75, 80, 84, 88, 90, 92] },
  ];
  const keyMetrics = [
    { label: 'Active Users', value: `${dashboardMetrics.activeUsers}`, trend: '+2 today', up: true, color: 'text-emerald-500' },
    { label: 'Meetings Today', value: `${dashboardMetrics.meetingsToday}`, trend: '+3 vs yesterday', up: true, color: 'text-blue-500' },
    { label: 'NPS Score', value: `${dashboardMetrics.npsScore}`, trend: '+4 pts', up: true, color: 'text-amber-500' },
    { label: 'Churn Rate', value: `${dashboardMetrics.churnRate}%`, trend: '-0.3%', up: false, color: 'text-red-500' },
  ];

  useEffect(() => {
    if (user && user.role !== 'ceo') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  const handleStartMeeting = () => {
    createInstantMeeting({ id: user.id, role: user.role });
    toast.success('Meeting started and broadcast to all users!');
  };

  return (
    <>
    <Helmet>
      <title>CEO Dashboard - AdzConnect</title>
      <meta name="description" content="AdzConnect CEO command center with company-wide performance metrics, growth analytics, and strategic insights." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      <motion.div variants={itemVariants}>
        <WelcomeBanner user={user} role="CEO" />
      </motion.div>
      <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} />

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ceoStats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-gray-500 dark:text-slate-400">{stat.label}</p>
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stat.up ? <HiArrowSmUp className="w-3 h-3" /> : <HiArrowSmDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="mt-1">
              <Sparkline data={stat.sparkline} color={stat.color === 'text-emerald-500' ? '#10b981' : stat.color === 'text-blue-500' ? '#3b82f6' : stat.color === 'text-amber-500' ? '#f59e0b' : '#8b5cf6'} />
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <TodayBriefing metrics={dashboardMetrics} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LineChartCard
          data={companyGrowthTrend}
          title="Company Growth Trajectory"
          badge="+127% overall"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Executive Reporting</h2>
          <Badge variant="info" size="sm">Q3 2026</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">KPIs vs Target</h3>
              <Badge variant="success" size="sm">Scorecard</Badge>
            </div>
            <div className="space-y-4">
              {kpisVsTarget.map((kpi) => {
                const met = kpi.current >= kpi.target;
                const within = kpi.current >= kpi.target * 0.9;
                const barColor = met ? 'bg-emerald-500' : within ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={kpi.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{kpi.label}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        <span className={`font-semibold ${met ? 'text-emerald-600 dark:text-emerald-400' : within ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{kpi.current}{kpi.suffix}</span> / {kpi.target}{kpi.suffix}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-700">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(100, Math.round((kpi.current / kpi.target) * 100))}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Financial Trend</h3>
              <Badge variant="success" size="sm">Revenue vs Profit</Badge>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={financialTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32} />
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <Tooltip content={<FinancialTrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Report Library</h3>
              <Badge variant="default" size="sm">{reportLibrary.length} reports</Badge>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {reportLibrary.map((report) => (
                <div key={report.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                      <HiDocumentText className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{report.name}</p>
                  </div>
                  <Button size="xs" variant="outline" icon={HiDownload} onClick={() => { exportToCSV(report.rows, report.file); toast.success(`${report.name} downloaded`); }}>Download</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Department Growth Comparison</h2>
              <Badge variant="info" size="sm">Q3 2026</Badge>
            </div>
            <BarChartCard
              data={deptGrowthData}
              labels={deptGrowthLabels}
              title=""
              height={240}
              barColor="#10b981"
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                {keyMetrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                    <p className="text-xs text-gray-500 dark:text-slate-400">{m.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{m.value}</p>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${m.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {m.up ? <HiArrowSmUp className="w-3 h-3" /> : <HiArrowSmDown className="w-3 h-3" />}
                      {m.trend}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Priorities</h2>
                <Button variant="ghost" size="xs" icon={HiFlag} onClick={() => navigate('/app/reports')}>View All</Button>
              </div>
              <div className="space-y-3">
                {topPriorities.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg ${
                      p.variant === 'success' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' :
                      p.variant === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' :
                      'bg-blue-50 text-blue-500 dark:bg-blue-500/10'
                    }`}>
                      <HiFlag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Due {p.deadline} — {p.owner}</p>
                    </div>
                    <Badge variant={p.variant} size="sm">{p.status}</Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Executive Summary</h2>
              <Badge variant="success" size="sm">All KPIs Healthy</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/5 dark:to-green-500/5 border border-emerald-100 dark:border-emerald-900/20">
                <HiTrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Revenue Growth</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">+34% QoQ — exceeding targets</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5 border border-blue-100 dark:border-blue-900/20">
                <HiUserGroup className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Team Growth</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">+25% headcount this quarter</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-100 dark:border-amber-900/20">
                <HiLightningBolt className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Operational Health</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">92% efficiency — top quartile</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth icon={HiSpeakerphone} size="md" onClick={handleStartMeeting}>All Hands Meeting</Button>
              <Button variant="outline" fullWidth icon={HiChartBar} size="md" onClick={() => navigate('/app/analytics')}>View Analytics</Button>
              <Button variant="secondary" fullWidth icon={HiCog} size="md" onClick={() => navigate('/app/settings')}>Company Settings</Button>
            </div>
          </Card>

          <DashboardCalendarWidget />
          <TaskListWidget />

          <ActivityFeed />

          <DonutChartCard
            data={revenueBreakdown}
            title="Revenue Breakdown"
            size={180}
          />

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">CEO Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Export company-wide reports</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...deptComparison, { name: 'Company Growth', growth: dashboardMetrics.companyGrowth, satisfaction: dashboardMetrics.teamSatisfaction, meetings: dashboardMetrics.meetingsToday, efficiency: dashboardMetrics.avgAttendance }, { name: 'Revenue Impact', growth: dashboardMetrics.revenueImpact / 1000000, satisfaction: dashboardMetrics.npsScore, meetings: dashboardMetrics.activeSessions, efficiency: dashboardMetrics.productivity }, { name: 'Active Users', growth: dashboardMetrics.activeUsers, satisfaction: 0, meetings: dashboardMetrics.meetingsThisWeek, efficiency: 100 }], 'board-report.csv')}>Board Report</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...revenueBreakdown, { label: 'Company Growth', value: dashboardMetrics.companyGrowth }, { label: 'Revenue Impact ($M)', value: dashboardMetrics.revenueImpact / 1000000 }, { label: 'NPS Score', value: dashboardMetrics.npsScore }, { label: 'Churn Rate', value: dashboardMetrics.churnRate }], 'financial-summary.csv')}>Financial Summary</Button>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiSpeakerphone className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Announcements</h2>
            </div>
            <div className="space-y-3">
              {announcements.map((a, idx) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                    <Badge variant="primary" size="xs">{a.badge}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{a.author} — {a.date}</p>
                </motion.div>
              ))}
            </div>
            <Button variant="ghost" fullWidth size="sm" className="mt-3" onClick={() => navigate('/app/announcements')}>View All Announcements</Button>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <div className="flex items-center gap-2 mb-1">
              <HiSparkles className="w-5 h-5" />
              <h3 className="font-semibold">NPS Leader</h3>
            </div>
            <p className="text-3xl font-bold mt-1">{dashboardMetrics.npsScore}</p>
            <div className="flex items-center gap-2 mt-1">
              <HiTrendingUp className="w-4 h-4 text-emerald-200" />
              <p className="text-white/80 text-sm">Up 4 points this quarter</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <HiGlobe className="w-8 h-8 mb-2 text-emerald-100" />
            <h3 className="font-semibold text-lg">Company Health</h3>
            <p className="text-3xl font-bold mt-1">A-</p>
            <p className="text-white/80 text-sm mt-1">Composite score — strong outlook</p>
          </Card>

          {/* Organization Chart */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <HiUserGroup className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Chart</h2>
            </div>
            <OrgChart users={users} />
          </Card>
        </motion.div>
      </div>
    </motion.div>
    </>
  );
}

function OrgChart({ users }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (dept) => setExpanded(prev => ({ ...prev, [dept]: !prev[dept] }));

  const hierarchy = [
    { level: 'CEO', roles: ['ceo'], icon: '👑' },
    { level: 'Executive', roles: ['executive', 'admin'], icon: '⭐' },
    { level: 'Managers', roles: ['manager', 'host'], icon: '📋' },
    { level: 'HR', roles: ['hr'], icon: '🤝' },
    { level: 'Employees', roles: ['employee'], icon: '👤' },
  ];

  const grouped = {};
  users.forEach(u => {
    const level = hierarchy.find(h => h.roles.includes(u.role))?.level || 'Employees';
    if (!grouped[level]) grouped[level] = {};
    const dept = u.department || 'General';
    if (!grouped[level][dept]) grouped[level][dept] = [];
    grouped[level][dept].push(u);
  });

  return (
    <div className="space-y-3">
      {hierarchy.map(({ level, icon }) => {
        const depts = grouped[level];
        if (!depts) return null;
        const userCount = Object.values(depts).reduce((s, arr) => s + arr.length, 0);
        return (
          <div key={level}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{icon}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{level}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">({userCount})</span>
            </div>
            <div className="ml-5 space-y-1">
              {Object.entries(depts).map(([dept, members]) => (
                <div key={dept}>
                  <button onClick={() => toggle(dept)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <span className="transform transition-transform" style={{ transform: expanded[dept] ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
                    {dept} ({members.length})
                  </button>
                  {expanded[dept] && (
                    <div className="ml-4 space-y-1 mt-1">
                      {members.map(user => (
                        <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                          <Avatar name={user.name} size="xs" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">{user.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
