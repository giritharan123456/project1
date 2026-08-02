import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiUserGroup, HiVideoCamera, HiClock,
  HiCalendar, HiCheckCircle,
  HiLightningBolt,
  HiArrowSmUp, HiArrowSmDown,
  HiDocumentReport, HiChat, HiDownload, HiPlusCircle,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import LineChartCard from '../../components/charts/LineChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import RadarChartCard from '../../components/charts/RadarChartCard';
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

const meetingTrendData = [
  { week: 'W1', meetings: 18 },
  { week: 'W2', meetings: 22 },
  { week: 'W3', meetings: 20 },
  { week: 'W4', meetings: 25 },
  { week: 'W5', meetings: 28 },
  { week: 'W6', meetings: 24 },
];

const teamSkills = [
  { label: 'Frontend', value: 88 },
  { label: 'Backend', value: 72 },
  { label: 'Design', value: 85 },
  { label: 'Management', value: 78 },
  { label: 'Testing', value: 70 },
  { label: 'DevOps', value: 60 },
];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { dashboardMetrics, userNotifications, unreadNotifications, markAllNotificationsRead, addTask, users, meetings, activityLog, attendanceRecords } = useApp();
  const navigate = useNavigate();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [rsvps, setRsvps] = useState({});

  const teamMembers = useMemo(() => {
    const team = users.filter(u => u.role === 'employee');
    return team.slice(0, 4).map(u => {
      const userMeetings = meetings.filter(m => m.participants?.includes(u.id) && ['live', 'upcoming', 'ended', 'completed'].includes(m.status));
      const meetingCount = userMeetings.length;
      const hours = Math.round(userMeetings.reduce((sum, m) => sum + (m.duration || 0), 0) / 60);
      const userRecords = attendanceRecords.filter(r => r.userId === u.id);
      const rate = userRecords.length ? Math.round((userRecords.filter(r => r.status === 'present').length / userRecords.length) * 100) : dashboardMetrics.avgAttendance;
      return {
        id: u.id,
        name: u.name,
        role: u.title || u.role,
        status: u.status === 'online' ? 'online' : u.status === 'away' ? 'away' : 'busy',
        meetings: meetingCount,
        hours,
        productivity: rate,
      };
    });
  }, [users, meetings, attendanceRecords, dashboardMetrics.avgAttendance]);

  const onlineCount = useMemo(() => teamMembers.filter(m => m.status === 'online').length, [teamMembers]);
  const memberProductivity = useMemo(() => teamMembers.map(m => m.productivity), [teamMembers]);
  const memberNames = useMemo(() => teamMembers.map(m => m.name.split(' ')[0]), [teamMembers]);

  const upcomingTeamMeetings = useMemo(() => {
    const teamIds = new Set(users.filter(u => u.role === 'employee').map(u => u.id));
    return meetings
      .filter(m => ['live', 'upcoming'].includes(m.status) && (m.participants?.some(p => teamIds.has(p)) || teamIds.has(m.host)))
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        title: m.title,
        date: formatMeetingDate(m.date),
        time: formatMeetingTime(m.time),
        members: m.participants?.length || 0,
      }));
  }, [meetings, users]);

  const recentTeamActivity = useMemo(() => {
    return activityLog.slice(0, 4).map(entry => ({
      id: entry.id,
      user: users.find(u => u.id === entry.user)?.name || entry.user,
      action: entry.action || 'System event',
      target: '',
      time: relativeTime(entry.timestamp),
    }));
  }, [activityLog, users]);

  const handleRsvp = (id) => {
    setRsvps(prev => {
      const next = { ...prev, [id]: prev[id] ? null : 'accepted' };
      return next;
    });
  };

  const teamMembersForAssign = users.filter(u => u.role === 'employee' || u.id === user?.id);

  const handleAssignTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    const assignee = users.find(u => u.id === newTask.assignedTo);
    addTask({
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedBy: user?.id || 'unknown',
      dueDate: newTask.dueDate,
    });
    toast.success(`Task assigned to ${assignee?.name || 'team member'}`);
    setShowTaskModal(false);
    setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
  };
  const teamStats = [
    { label: 'Active Users', value: `${dashboardMetrics.activeUsers}`, icon: HiUserGroup, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', change: 'stable', up: true },
    { label: 'Meetings This Week', value: `${dashboardMetrics.meetingsThisWeek}`, icon: HiVideoCamera, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', change: '+15%', up: true },
    { label: 'Tasks Completed', value: `${dashboardMetrics.tasksCompleted}`, icon: HiClock, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10', change: '+8%', up: true },
    { label: 'Productivity', value: `${dashboardMetrics.productivity}%`, icon: HiLightningBolt, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', change: '+5%', up: true },
  ];

  useEffect(() => {
    if (user && user.role !== 'manager') {
      navigate(`/app/dashboard/${user.role}`);
    }
  }, [user, navigate]);

  return (
    <>
    <Helmet>
      <title>Manager Dashboard - AdzConnect</title>
      <meta name="description" content="AdzConnect manager dashboard for team oversight, meeting analytics, and performance tracking." />
    </Helmet>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <WelcomeBanner user={user} role="Manager" />
        <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamStats.map((stat) => (
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
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Member Availability</h2>
              <Badge variant="success" size="sm">{onlineCount} online</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={m.name} size="md" status={m.status} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{m.role}</p>
                    </div>
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.status === 'online' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      m.status === 'busy' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{m.meetings}</p>
                      <p className="text-gray-500 dark:text-slate-400">Meetings</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{m.hours}h</p>
                      <p className="text-gray-500 dark:text-slate-400">Hours</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{m.productivity}%</p>
                      <p className="text-gray-500 dark:text-slate-400">Prod.</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LineChartCard
              data={meetingTrendData}
              title="Meeting Trends"
              badge="+33% since W1"
            />

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Team Meetings</h2>
              <div className="space-y-3">
                {upcomingTeamMeetings.map((m, idx) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500">
                      <HiVideoCamera className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{m.date} at {m.time} — {m.members} members</p>
                    </div>
                    {rsvps[m.id] ? (
                      <Badge variant="success" size="sm">Confirmed</Badge>
                    ) : (
                      <Button variant="ghost" size="xs" icon={HiCheckCircle} onClick={() => { handleRsvp(m.id); toast.success(rsvps[m.id] ? 'RSVP cancelled' : 'RSVP confirmed!'); }}>RSVP</Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Team Activity</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/meeting-history')}>View All</Button>
            </div>
            <div className="space-y-3">
              {recentTeamActivity.map((a, idx) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Avatar name={a.user} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{a.user}</span>
                      {' '}{a.action.toLowerCase()}{' '}
                      <span className="text-gray-500 dark:text-slate-400">{a.target}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-slate-500 shrink-0">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth icon={HiCalendar} size="md" onClick={() => navigate('/app/schedule')}>Schedule Team Meeting</Button>
              <Button variant="outline" fullWidth icon={HiDocumentReport} size="md" onClick={() => navigate('/app/reports')}>Review Reports</Button>
              <Button variant="secondary" fullWidth icon={HiChat} size="md" onClick={() => navigate('/app/chat')}>Message Team</Button>
              <Button variant="gradient" fullWidth icon={HiPlusCircle} size="md" onClick={() => setShowTaskModal(true)}>Assign Task</Button>
            </div>
          </Card>

          <DashboardCalendarWidget />
          <TaskListWidget />

          <ActivityFeed />

          <BarChartCard
            data={memberProductivity}
            labels={memberNames}
            title="Team Productivity %"
            barColor="#6366f1"
            height={200}
          />
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Report</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">Export team analytics</p>
            <div className="flex flex-col gap-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...teamMembers, { id: 5, name: 'Active Users', role: 'System', status: 'online', meetings: dashboardMetrics.activeUsers, hours: dashboardMetrics.activeSessions, productivity: dashboardMetrics.productivity }, { id: 6, name: 'Meetings This Week', role: 'System', status: 'online', meetings: dashboardMetrics.meetingsThisWeek, hours: dashboardMetrics.meetingsToday, productivity: dashboardMetrics.avgAttendance }, { id: 7, name: 'Tasks Completed', role: 'System', status: 'online', meetings: dashboardMetrics.tasksCompleted, hours: dashboardMetrics.pendingApprovals, productivity: 100 }], 'team-performance.csv')}>Team Report</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV([...meetingTrendData, { week: 'Active Users', meetings: dashboardMetrics.activeUsers }, { week: 'Meetings Today', meetings: dashboardMetrics.meetingsToday }, { week: 'Productivity', meetings: dashboardMetrics.productivity }, { week: 'Avg Attendance', meetings: dashboardMetrics.avgAttendance }], 'meeting-analytics.csv')}>Meeting Analytics</Button>
            </div>
          </Card>
          <RadarChartCard
            data={teamSkills}
            title="Team Skill Coverage"
            size={220}
          />

          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <HiLightningBolt className="w-8 h-8 mb-2 text-indigo-100" />
            <h3 className="font-semibold text-lg">Team Efficiency</h3>
            <p className="text-3xl font-bold mt-1">92%</p>
            <p className="text-white/80 text-sm mt-1">Top quartile — keep it up!</p>
          </Card>
        </motion.div>
      </div>
    </motion.div>

    <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' }); }} title="Assign Task" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Task Title *</label>
          <input type="text" value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter task title" className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
          <textarea value={newTask.description} onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the task..." rows={3} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Assign To *</label>
          <select value={newTask.assignedTo} onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Select a team member...</option>
            {teamMembersForAssign.map((m) => (
              <option key={m.id} value={m.id}>{m.name} — {m.role} ({m.department})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Due Date *</label>
          <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
        <Button variant="secondary" size="sm" onClick={() => { setShowTaskModal(false); setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' }); }}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleAssignTask}>Assign Task</Button>
      </div>
    </Modal>
    </>
  );
}
