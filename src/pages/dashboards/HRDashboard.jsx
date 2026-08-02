import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiUserGroup, HiUserAdd, HiCheckCircle,
  HiCalendar, HiOfficeBuilding,
  HiAcademicCap, HiBriefcase, HiHeart, HiArrowSmUp, HiArrowSmDown,
  HiPlusCircle, HiSearch, HiDownload, HiClock,
  HiBadgeCheck, HiXCircle,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import BarChartCard from '../../components/charts/BarChartCard';
import RadarChartCard from '../../components/charts/RadarChartCard';
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



const formatHireDate = (d) => {
  if (!d) return '—';
  return new Date(`${d}T12:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const DEPT_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500'];

export default function HRDashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, userNotifications, unreadNotifications, markAllNotificationsRead, users } = useApp();
  const navigate = useNavigate();

  const upcomingInterviews = useMemo(() => users.length > 0
    ? users.filter(u => u.interviews).slice(0, 3).map((u, i) => ({
        id: u.id || i + 1,
        candidate: u.name,
        position: u.title || 'Position',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        interviewer: 'Hiring Team',
      }))
    : [
        { id: 1, candidate: 'Sophia Martinez', position: 'Sr. Frontend Dev', time: '10:00 AM', date: 'Today', interviewer: 'Mike J.' },
        { id: 2, candidate: 'David Kim', position: 'Product Designer', time: '2:00 PM', date: 'Today', interviewer: 'Emily D.' },
        { id: 3, candidate: 'Aisha Patel', position: 'Backend Engineer', time: '11:00 AM', date: 'Tomorrow', interviewer: 'Sarah C.' },
      ], [users]);

  const employeeSkills = useMemo(() => users.length > 0
    ? Object.entries(
          users.reduce((acc, u) => {
            const skills = u.skills || ['Communication', 'Collaboration', 'Technical', 'Leadership', 'Reliability', 'Innovation'];
            skills.forEach(skill => {
              if (!acc[skill]) acc[skill] = 0;
              acc[skill] = Math.min(100, acc[skill] + Math.floor(Math.random() * 15));
            });
            return acc;
          }, {})
        ).map(([label, value]) => ({ label, value }))
    : ([
        { label: 'Communication', value: 85 },
        { label: 'Collaboration', value: 78 },
        { label: 'Technical', value: 72 },
        { label: 'Leadership', value: 65 },
        { label: 'Reliability', value: 90 },
        { label: 'Innovation', value: 70 },
      ]), [users]);

  const monthlyHires = useMemo(() => users.length > 0
     ? Object.entries(
           users.filter(u => u.joined && new Date(u.joined) >= new Date('2026-01-01')).reduce((acc, u) => {
             const month = new Date(u.joined).toLocaleString('default', { month: 'short' });
             if (!acc[month]) acc[month] = 0;
             acc[month] += 1;
             return acc;
           }, {})
        ).map(([label, value]) => ({ label, value }))
     : ([
         { label: 'Jan', value: 1 },
         { label: 'Feb', value: 0 },
         { label: 'Mar', value: 2 },
         { label: 'Apr', value: 1 },
         { label: 'May', value: 0 },
         { label: 'Jun', value: 1 },
         { label: 'Jul', value: 2 },
       ]), [users]);

  const departmentData = useMemo(() => {
    const counts = {};
    users.forEach(u => {
      const dept = u.department || 'General';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0) || 1;
    return entries.map(([name, count], i) => ({
      name,
      count,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
      percentage: Math.round((count / total) * 100),
    }));
  }, [users]);

  const deptHeadcountData = useMemo(() => departmentData.map(d => d.count), [departmentData]);
  const deptLabels = useMemo(() => departmentData.map(d => d.name), [departmentData]);

  const recentHires = useMemo(() => {
    return users
      .filter(u => u.joined)
      .sort((a, b) => new Date(b.joined) - new Date(a.joined))
      .slice(0, 2)
      .map(u => ({
        id: u.id,
        name: u.name,
        role: u.title,
        department: u.department,
        startDate: formatHireDate(u.joined),
        avatar: u.avatar || null,
      }));
  }, [users]);

  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-leave-requests');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' });

  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');

  const approvedLeaves = leaveRequests.filter(r => r.status === 'approved');
  const todayKey = new Date().toISOString().split('T')[0];
  const onLeaveToday = approvedLeaves.filter(r => r.startDate <= todayKey && r.endDate >= todayKey).length;
  const leaveDayCount = (type) => approvedLeaves
    .filter(r => r.type === type)
    .reduce((sum, r) => sum + Math.max(1, Math.round((new Date(r.endDate) - new Date(r.startDate)) / 86400000) + 1), 0);
  const sickLeaveDays = leaveDayCount('Sick');
  const vacationDays = leaveDayCount('Vacation');
  const personalLeaveDays = leaveDayCount('Personal');

  const handleApproveLeave = (id) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', resolvedAt: new Date().toISOString() } : r));
    toast.success('Leave request approved');
  };

  const handleDenyLeave = (id) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'denied', resolvedAt: new Date().toISOString() } : r));
    toast.success('Leave request denied');
  };

  const handleSubmitLeave = () => {
    if (!newLeave.employeeName || !newLeave.startDate || !newLeave.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    const request = {
      id: `lr${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ...newLeave,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setLeaveRequests(prev => [...prev, request]);
    toast.success('Leave request submitted to Admin');
    setShowLeaveModal(false);
    setNewLeave({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' });
  };

  // Sync to localStorage
  useEffect(() => {
    try { localStorage.setItem('connectly-leave-requests', JSON.stringify(leaveRequests)); } catch {}
  }, [leaveRequests]);
  const hrStats = [
    { label: 'Total Employees', value: `${dashboardMetrics.totalEmployees}`, icon: HiUserGroup, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10', change: '+2', up: true },
    { label: 'New Hires', value: `${dashboardMetrics.newRegistrations}`, icon: HiUserAdd, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', change: 'This month', up: true },
    { label: 'Pending Approvals', value: `${dashboardMetrics.pendingApprovals}`, icon: HiAcademicCap, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', change: 'In progress', up: true },
    { label: 'Attendance Rate', value: `${dashboardMetrics.avgAttendance}%`, icon: HiCheckCircle, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', change: '+2%', up: true },
  ];

  useEffect(() => {
    if (user && user.role !== 'hr') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <>
    <Helmet>
      <title>HR Dashboard - AdzConnect</title>
      <meta name="description" content="AdzConnect HR dashboard for employee management, attendance tracking, and team analytics." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <WelcomeBanner user={user} role="HR" />
        <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hrStats.map((stat) => (
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
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BarChartCard
              data={deptHeadcountData}
              labels={deptLabels}
              title="Department Headcount"
              barColor="#14b8a6"
              height={200}
            />

            <RadarChartCard
              data={employeeSkills}
              title="Team Skill Assessment"
              size={220}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Interviews</h2>
                <Badge variant="warning" size="sm">{upcomingInterviews.length} scheduled</Badge>
              </div>
              <div className="flex-1 space-y-3">
                {upcomingInterviews.map((inv, idx) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{inv.candidate}</p>
                      <Badge variant="info" size="sm" className="flex-shrink-0 max-w-[45%] overflow-hidden text-ellipsis whitespace-nowrap">{inv.position}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><HiCalendar className="w-3 h-3" />{inv.date}</span>
                      <span className="flex items-center gap-1"><HiClock className="w-3 h-3" />{inv.time}</span>
                      <span className="flex items-center gap-1"><HiBriefcase className="w-3 h-3" />{inv.interviewer}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Hires</h2>
                <Badge variant="success" size="sm">This month</Badge>
              </div>
              <div className="flex-1 space-y-3">
                {recentHires.map((hire, idx) => (
                  <motion.div
                    key={hire.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Avatar name={hire.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{hire.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{hire.role} — {hire.department}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="primary" size="sm">Started {hire.startDate}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="ghost" fullWidth size="sm" icon={HiSearch} className="mt-3" onClick={() => navigate('/app/team')}>View Full Directory</Button>
            </Card>
          </div>

          <AreaChartCard
            data={monthlyHires}
            title="Monthly Hiring Trend"
            badge="2026"
            height={180}
          />

          <ActivityFeed />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Snapshot</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Total Headcount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{dashboardMetrics.totalEmployees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">New Hires (MTD)</span>
                  <span className="font-semibold text-emerald-600">{dashboardMetrics.newRegistrations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Active Sessions</span>
                  <span className="font-semibold text-blue-500">{dashboardMetrics.activeSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Wellness Score</span>
                  <span className="font-semibold text-emerald-600">{dashboardMetrics.wellnessScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">System Uptime</span>
                  <span className="font-semibold text-emerald-500">{dashboardMetrics.systemUptime.toFixed(1)}%</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leave Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">On Leave Today</span>
                  <span className="font-semibold text-amber-600">{onLeaveToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Sick Leave (MTD)</span>
                  <span className="font-semibold text-red-500">{sickLeaveDays} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Vacation (MTD)</span>
                  <span className="font-semibold text-emerald-600">{vacationDays} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Personal Leave</span>
                  <span className="font-semibold text-blue-500">{personalLeaveDays} days</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Pending Requests</span>
                    <Badge variant="warning" size="sm">{pendingLeaves.length}</Badge>
                  </div>
                  {pendingLeaves.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No pending requests</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {pendingLeaves.map((r) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{r.employeeName}</span>
                            <Badge variant={r.type === 'Sick' ? 'danger' : r.type === 'Vacation' ? 'success' : 'info'} size="xs">{r.type}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{r.startDate} — {r.endDate}</p>
                          {r.reason && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Reason: {r.reason}</p>}
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleApproveLeave(r.id)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 transition-colors"><HiBadgeCheck className="w-3 h-3" />Approve</button>
                            <button onClick={() => handleDenyLeave(r.id)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors"><HiXCircle className="w-3 h-3" />Deny</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth icon={HiCalendar} size="md" onClick={() => navigate('/app/calendar')}>Schedule Interview</Button>
              <Button variant="outline" fullWidth icon={HiAcademicCap} size="md" onClick={() => navigate('/app/onboarding')}>Onboard New Hire</Button>
              <Button variant="secondary" fullWidth icon={HiOfficeBuilding} size="md" onClick={() => navigate('/app/team')}>View Directory</Button>
              <Button variant="ghost" fullWidth icon={HiPlusCircle} size="md" onClick={() => setShowLeaveModal(true)}>Request Leave</Button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-primary-600 to-violet-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">AI Insights</h2>
              <HiAcademicCap className="w-5 h-5 text-white/80" />
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                <p className="text-sm font-medium">Attendance is healthy</p>
                <p className="text-xs text-white/80 mt-0.5">Avg attendance {dashboardMetrics.avgAttendance}% — on track this month.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                <p className="text-sm font-medium">{pendingLeaves.length} leave request{pendingLeaves.length === 1 ? '' : 's'} pending</p>
                <p className="text-xs text-white/80 mt-0.5">Review them to avoid coverage gaps.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
                <p className="text-sm font-medium">{users.filter((u) => u.status === 'offline').length} employees offline</p>
                <p className="text-xs text-white/80 mt-0.5">Consider a check-in for long inactive periods.</p>
              </div>
            </div>
          </Card>

          <DashboardCalendarWidget />
          <TaskListWidget />

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">HR Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Export people analytics</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...departmentData, { name: 'Total Employees', count: dashboardMetrics.totalEmployees, color: 'bg-teal-500', percentage: 100 }, { name: 'New Hires (MTD)', count: dashboardMetrics.newRegistrations, color: 'bg-emerald-500', percentage: dashboardMetrics.newRegistrations }, { name: 'Active Sessions', count: dashboardMetrics.activeSessions, color: 'bg-blue-500', percentage: Math.round(dashboardMetrics.activeSessions / 5) }, { name: 'Wellness Score', count: dashboardMetrics.wellnessScore, color: 'bg-cyan-500', percentage: dashboardMetrics.wellnessScore }], 'headcount-report.csv')}>Headcount Report</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...monthlyHires, { label: 'Avg Attendance', value: dashboardMetrics.avgAttendance }, { label: 'Team Satisfaction', value: dashboardMetrics.teamSatisfaction }, { label: 'Pending Approvals', value: dashboardMetrics.pendingApprovals }, { label: 'System Uptime', value: `${dashboardMetrics.systemUptime.toFixed(1)}%` }], 'hiring-pipeline.csv')}>Hiring Pipeline</Button>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
            <HiHeart className="w-8 h-8 mb-2 text-teal-100" />
            <h3 className="font-semibold text-lg">Wellness Score</h3>
            <p className="text-3xl font-bold mt-1">86</p>
            <p className="text-white/80 text-sm mt-1">Employee well-being index — Up 4 pts</p>
          </Card>
        </motion.div>
      </div>
    </motion.div>

    <Modal isOpen={showLeaveModal} onClose={() => { setShowLeaveModal(false); setNewLeave({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' }); }} title="Request Leave" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Employee Name</label>
          <input type="text" value={newLeave.employeeName} onChange={(e) => setNewLeave(prev => ({ ...prev, employeeName: e.target.value }))} placeholder="Your name" className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Leave Type</label>
          <select value={newLeave.type} onChange={(e) => setNewLeave(prev => ({ ...prev, type: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="Sick">Sick</option>
            <option value="Vacation">Vacation</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Start Date</label>
            <input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave(prev => ({ ...prev, startDate: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">End Date</label>
            <input type="date" value={newLeave.endDate} onChange={(e) => setNewLeave(prev => ({ ...prev, endDate: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Reason (optional)</label>
          <textarea value={newLeave.reason} onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))} placeholder="Brief reason for leave..." rows={3} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
        <Button variant="secondary" size="sm" onClick={() => { setShowLeaveModal(false); setNewLeave({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' }); }}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSubmitLeave}>Submit Request</Button>
      </div>
    </Modal>
    </>
  );
}
