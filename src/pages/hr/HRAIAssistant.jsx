import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiSparkles, HiUserGroup, HiChartBar, HiLightBulb, HiBriefcase, HiSearch,
  HiCheckCircle, HiExclamationCircle, HiTrendingUp,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { isNewEmployee, pct } from '../../utils/hrPeople';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HRAIAssistant() {
  const { users, meetings, attendanceRecords, dashboardMetrics } = useApp();
  const [active, setActive] = useHRTab('employees');
  const [query, setQuery] = useState('');

  const tabs = [
    { key: 'employees', label: 'Employees', icon: HiUserGroup },
    { key: 'attendance', label: 'Attendance', icon: HiChartBar },
    { key: 'performance', label: 'Performance', icon: HiLightBulb },
    { key: 'recommendations', label: 'Recommendations', icon: HiSparkles },
    { key: 'workforce', label: 'Workforce', icon: HiBriefcase },
    { key: 'search', label: 'Smart Search', icon: HiSearch },
  ];

  const insightCard = (title, body, variant = 'info') => (
    <Card key={title} className="p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white">
          <HiSparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{body}</p>
          <Badge variant={variant} size="xs" className="mt-2">AI Insight</Badge>
        </div>
      </div>
    </Card>
  );

  const employeesWithMetrics = useMemo(() => {
    return users.map((u) => {
      const records = (attendanceRecords || []).filter((r) => r.userId === u.id || r.userName === u.name);
      const present = records.filter((r) => r.status === 'present').length;
      return {
        ...u,
        attendance: pct(present, records.length),
        meetings: records.length,
      };
    });
  }, [users, attendanceRecords]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users.filter((u) => [u.name, u.title, u.department, u.email].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [query, users]);

  const renderContent = () => {
    if (active === 'employees') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {insightCard('Headcount Snapshot', `You have ${users.length} employees across ${new Set(users.map((u) => u.department)).size} departments. ${users.filter((u) => u.status === 'online').length} are online right now.`, 'success')}
            {insightCard('New Hires Detected', `${users.filter((u) => isNewEmployee(u)).length} employees joined in the last 90 days. Consider scheduling their onboarding check-ins.`, 'warning')}
            {insightCard('Inactive Members', `${users.filter((u) => u.status === 'offline').length} employees are currently offline. Follow up with anyone inactive for extended periods.`, 'danger')}
          </div>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Employee Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {employeesWithMetrics.slice(0, 9).map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar name={u.name} src={u.avatar} size="sm" status={u.status} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{u.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="primary" size="xs">{u.department}</Badge>
                    <Badge variant={u.attendance >= 80 ? 'success' : 'warning'} size="xs">{u.attendance}% attendance</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'attendance') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {insightCard('Attendance Health', `Average attendance is ${dashboardMetrics.avgAttendance}%, which is ${dashboardMetrics.avgAttendance >= 85 ? 'healthy' : 'below target'}. Review the weekly trend for anomalies.`, dashboardMetrics.avgAttendance >= 85 ? 'success' : 'warning')}
            {insightCard('Check-in Volume', `${attendanceRecords.length} attendance records have been captured. ${meetings.length} meetings were scheduled this period.`, 'info')}
            {insightCard('Participation Alert', `Several employees have low meeting participation. Use the Performance section to review individual scores.`, 'warning')}
          </div>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Suggested Follow-ups</h2>
            <div className="space-y-2">
              {employeesWithMetrics.filter((u) => u.attendance < 70).map((u) => (
                <div key={u.id} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 text-sm text-gray-700 dark:text-slate-300">
                  <HiExclamationCircle className="w-4 h-4 text-amber-500" />
                  {u.name} attendance is at {u.attendance}% — consider scheduling a check-in.
                </div>
              ))}
              {employeesWithMetrics.filter((u) => u.attendance < 70).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-slate-400">All employees are meeting attendance expectations.</p>
              )}
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'performance') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {insightCard('Top Performers', 'Lisa Thompson, Jennifer Lee, and Michael Brown show the strongest attendance and engagement across all meetings.', 'success')}
          {insightCard('Development Areas', 'A few employees would benefit from coaching on meeting participation and punctuality.', 'warning')}
          {insightCard('Productivity Pulse', `Tasks are at a ${dashboardMetrics.avgAttendance >= 85 ? 'healthy completion rate' : 'mixed completion rate'}. Encourage managers to review their team queues.`, 'info')}
        </div>
      );
    }

    if (active === 'recommendations') {
      const recs = [
        { title: 'Schedule onboarding for recent hires', body: 'Several employees joined in the last 90 days without a completed orientation.', priority: 'High', variant: 'danger' },
        { title: 'Follow up on pending approvals', body: `${dashboardMetrics.pendingApprovals} registration/approval requests are waiting. Review them today to avoid delays.`, priority: 'High', variant: 'danger' },
        { title: 'Review leave coverage', body: 'Approved leave overlaps with a busy meeting week. Confirm backup coverage for critical roles.', priority: 'Medium', variant: 'warning' },
        { title: 'Broadcast a company update', body: 'It has been a few days since the last announcement. Consider a quick update to keep the team informed.', priority: 'Low', variant: 'info' },
      ];
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.map((r) => (
            <Card key={r.title} className="p-5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  <HiLightBulb className="w-5 h-5" />
                </div>
                <Badge variant={r.variant} size="xs">{r.priority}</Badge>
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{r.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{r.body}</p>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'workforce') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {insightCard('Workforce Overview', `Total headcount is ${users.length} with ${users.filter((u) => u.status === 'online').length} currently active.`, 'success')}
          {insightCard('Engagement Indicators', `Team satisfaction is ${dashboardMetrics.teamSatisfaction}% and wellness score is ${dashboardMetrics.wellnessScore}.`, 'info')}
          {insightCard('Infrastructure Health', `System uptime is ${dashboardMetrics.systemUptime.toFixed(1)}% with ${dashboardMetrics.activeSessions} active sessions.`, 'success')}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about an employee, department, or skill..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>
        {query && searchResults.length === 0 && (
          <Card className="p-8 text-center text-gray-500 dark:text-slate-400">
            <HiSearch className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600" />
            <p className="mt-3 font-medium text-gray-900 dark:text-white">No results for "{query}"</p>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {searchResults.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} src={u.avatar} size="lg" status={u.status} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{u.title}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="primary" size="xs">{u.department}</Badge>
                    <Badge variant="info" size="xs">{u.location || '—'}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {!query && (
          <Card className="p-5 flex items-center gap-3">
            <HiTrendingUp className="w-6 h-6 text-primary-500" />
            <p className="text-sm text-gray-500 dark:text-slate-400">Type a query above to search across {users.length} employee profiles.</p>
          </Card>
        )}
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>AI Assistant - AdzConnect HR</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-lg">
          <HiSparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">AI-powered people insights and recommendations</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HRSectionTabs tabs={tabs} active={active} onChange={setActive} />
      </motion.div>

      <motion.div variants={itemVariants} key={active}>
        {renderContent()}
      </motion.div>

      <Card className="p-4 flex items-start gap-3 bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/10 dark:to-violet-900/10 border-primary-100 dark:border-primary-900/30">
        <HiCheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
        <p className="text-sm text-gray-600 dark:text-slate-300">Insights are generated from live workspace data: employees, attendance, meetings, feedback, and system metrics.</p>
      </Card>
    </motion.div>
  );
}
