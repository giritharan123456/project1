import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { HiChartBar, HiUserGroup, HiUser, HiOfficeBuilding, HiHeart, HiBriefcase } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import BarChartCard from '../../components/charts/BarChartCard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { groupBy, pct } from '../../utils/hrPeople';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HRAnalytics() {
  const { users, meetings, attendanceRecords, recordings, dashboardMetrics } = useApp();
  const [active, setActive] = useHRTab('hr');

  const tabs = [
    { key: 'hr', label: 'HR Analytics', icon: HiUserGroup },
    { key: 'attendance', label: 'Attendance Analytics', icon: HiChartBar },
    { key: 'employee', label: 'Employee Analytics', icon: HiUser },
    { key: 'department', label: 'Department Analytics', icon: HiOfficeBuilding },
    { key: 'engagement', label: 'Engagement Analytics', icon: HiHeart },
    { key: 'workforce', label: 'Workforce Analytics', icon: HiBriefcase },
  ];

  const deptData = useMemo(() => {
    const groups = groupBy(users, (u) => u.department || 'General');
    return Object.entries(groups).map(([name, list]) => ({ label: name, value: list.length })).sort((a, b) => b.value - a.value);
  }, [users]);

  const meetingCountByType = useMemo(() => {
    const groups = groupBy(meetings || [], (m) => m.type || 'scheduled');
    return Object.entries(groups).map(([type, list]) => ({ label: type, value: list.length }));
  }, [meetings]);

  const attendanceRateByMeeting = useMemo(() => {
    return (meetings || []).map((m) => {
      const recorded = (attendanceRecords || []).filter((r) => r.meetingId === m.id);
      const present = recorded.filter((r) => r.status === 'present').length;
      return { label: m.title.split(':')[0], value: recorded.length ? pct(present, recorded.length) : 0 };
    }).filter((d) => d.value > 0);
  }, [meetings, attendanceRecords]);

  const monthlyHiring = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const groups = groupBy(users.filter((u) => u.joined), (u) => new Date(u.joined).toLocaleString('default', { month: 'short' }));
    return months.map((m) => ({ label: m, value: (groups[m] || []).length }));
  }, [users]);

  const feedbackData = useMemo(() => {
    const rated = (recordings || []).filter((r) => Number(r.rating) > 0);
    return [5, 4, 3, 2, 1].map((star) => ({ label: `${star} Star`, value: rated.filter((r) => Number(r.rating) === star).length }));
  }, [recordings]);

  const renderContent = () => {
    if (active === 'hr') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaChartCard data={monthlyHiring} title="Monthly Hiring Trend" badge="2026" height={220} />
          <DonutChartCard data={deptData} title="Headcount by Department" size={180} />
          <BarChartCard data={meetingCountByType.map((m) => m.value)} labels={meetingCountByType.map((m) => m.label)} title="Meetings by Type" barColor="#14b8a6" height={200} />
          <DonutChartCard data={feedbackData} title="Feedback Ratings" size={180} />
        </div>
      );
    }

    if (active === 'attendance') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{dashboardMetrics.avgAttendance}%</p><p className="text-sm text-gray-500 dark:text-slate-400">Avg Attendance</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{(attendanceRecords || []).length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Check-ins</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{(meetings || []).length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Meetings</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-violet-600">{dashboardMetrics.meetingsThisWeek}</p><p className="text-sm text-gray-500 dark:text-slate-400">Meetings This Month</p></Card>
          </div>
          <BarChartCard data={attendanceRateByMeeting.map((d) => d.value)} labels={attendanceRateByMeeting.map((d) => d.label)} title="Attendance Rate by Meeting" barColor="#10b981" height={260} />
        </div>
      );
    }

    if (active === 'employee') {
      const roles = ['employee', 'host', 'manager', 'hr', 'executive', 'admin', 'ceo'];
      const roleData = roles.map((r) => ({ label: r, value: users.filter((u) => u.role === r).length })).filter((d) => d.value > 0);
      const online = users.filter((u) => u.status === 'online').length;
      const away = users.filter((u) => u.status === 'away').length;
      const offline = users.filter((u) => u.status === 'offline').length;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Employees</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{online}</p><p className="text-sm text-gray-500 dark:text-slate-400">Online</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{away}</p><p className="text-sm text-gray-500 dark:text-slate-400">Away</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-red-600">{offline}</p><p className="text-sm text-gray-500 dark:text-slate-400">Offline</p></Card>
          </div>
          <DonutChartCard data={roleData} title="Employees by Role" size={180} />
        </div>
      );
    }

    if (active === 'department') {
      const total = users.length || 1;
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DonutChartCard data={deptData} title="Headcount by Department" size={200} />
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Department Breakdown</h3>
            <div className="space-y-3">
              {deptData.map((d) => (
                <div key={d.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-slate-300">{d.label}</span>
                    <span className="text-gray-500 dark:text-slate-400">{d.value} ({pct(d.value, total)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct(d.value, total)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'engagement') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5">
            <p className="text-3xl font-bold text-teal-600">{dashboardMetrics.teamSatisfaction}%</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Team Satisfaction</p>
          </Card>
          <Card className="p-5">
            <p className="text-3xl font-bold text-violet-600">{dashboardMetrics.wellnessScore}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Wellness Score</p>
          </Card>
          <Card className="p-5">
            <p className="text-3xl font-bold text-blue-600">{dashboardMetrics.activeSessions}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Active Sessions</p>
          </Card>
          <Card className="lg:col-span-3 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Feedback Ratings</h3>
            <DonutChartCard data={feedbackData} title="Feedback Ratings" size={180} />
          </Card>
        </div>
      );
    }

    const total = users.length || 1;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p><p className="text-sm text-gray-500 dark:text-slate-400">Workforce</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{dashboardMetrics.newRegistrations}</p><p className="text-sm text-gray-500 dark:text-slate-400">New Hires (MTD)</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{dashboardMetrics.systemUptime.toFixed(1)}%</p><p className="text-sm text-gray-500 dark:text-slate-400">System Uptime</p></Card>
          <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{dashboardMetrics.pendingApprovals}</p><p className="text-sm text-gray-500 dark:text-slate-400">Pending Approvals</p></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AreaChartCard data={monthlyHiring} title="Workforce Growth" badge="2026" height={220} />
          <BarChartCard data={deptData.map((d) => d.value)} labels={deptData.map((d) => d.label)} title="Workforce by Department" barColor="#f59e0b" height={220} />
        </div>
        <Card className="p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Workforce Snapshot</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Active team across {deptData.length} departments</p>
          </div>
          <Badge variant="success" size="md">{users.filter((u) => u.status === 'online').length} online now</Badge>
        </Card>
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Analytics - AdzConnect HR</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">People, attendance, engagement, and workforce analytics</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HRSectionTabs tabs={tabs} active={active} onChange={setActive} />
      </motion.div>

      <motion.div variants={itemVariants} key={active}>
        {renderContent()}
      </motion.div>
    </motion.div>
  );
}
