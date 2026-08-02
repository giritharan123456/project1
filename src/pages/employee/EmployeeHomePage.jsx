import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiVideoCamera, HiCalendar, HiClock, HiUserGroup,
  HiCheckCircle, HiChartBar, HiStar,
  HiPlusCircle, HiViewGrid,
  HiArrowSmUp, HiArrowSmDown, HiDownload, HiOfficeBuilding,
  HiSparkles, HiUpload, HiDocument,
  HiQuestionMarkCircle, HiBadgeCheck, HiExclamationCircle,
  HiFolder, HiSearch, HiBell, HiChat, HiUsers, HiFilm,
  HiDocumentText, HiUser, HiCog, HiLogout, HiLightningBolt,
  HiExternalLink, HiChevronRight, HiClipboardCheck,
  HiHome, HiTrendingUp, HiFlag,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import WelcomeBanner from '../../components/dashboard/WelcomeBanner';
import NotificationCenter from '../../components/common/NotificationCenter';
import DashboardCalendarWidget from '../../components/dashboard/DashboardCalendarWidget';
import TaskListWidget from '../../components/dashboard/TaskListWidget';
import MeetingCountdown from '../../components/dashboard/MeetingCountdown';
import AreaChartCard from '../../components/charts/AreaChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import ActivityFeed from '../../components/common/ActivityFeed';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function EmployeeHomePage() {
  const { user } = useAuth();
  const { dashboardMetrics, meetings, attendanceRecords, tasks, userNotifications, unreadNotifications, activityLog, users, announcements, markNotificationRead, markAllNotificationsRead, createInstantMeeting } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const upcomingMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return meetings
      .filter(m => (m.participants?.includes(user?.id) || m.host === user?.id) && ['live', 'upcoming'].includes(m.status))
      .filter(m => m.date >= today)
      .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))
      .slice(0, 5);
  }, [meetings, user]);

  const recentActivity = useMemo(() => {
    return activityLog.slice(0, 8).map(entry => ({
      id: entry.id,
      action: entry.action || 'System event',
      target: entry.type || 'system',
      time: new Date(entry.timestamp).toLocaleString(),
      icon: HiClock,
      color: 'text-emerald-500',
    }));
  }, [activityLog]);

  const myTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && (t.assignedTo === user?.email || t.assignedTo === user?.id || t.assignedTo === 'You')).slice(0, 5);
  }, [tasks, user]);

  const myMeetings = useMemo(() => {
    return meetings
      .filter(m => m.participants?.includes(user?.id) || m.host === user?.id)
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
      .slice(0, 4);
  }, [meetings, user]);

  const nextMeeting = useMemo(() => {
    const now = Date.now();
    return meetings
      .filter(m => m.participants?.includes(user?.id) || m.host === user?.id)
      .map(m => ({ meeting: m, target: new Date(`${m.date}T${m.time || '00:00'}`).getTime() }))
      .filter(m => !Number.isNaN(m.target))
      .sort((a, b) => a.target - b.target)
      .find(m => m.target >= now)?.meeting || null;
  }, [meetings, user]);

  const liveMeeting = useMemo(() => meetings.find(m => m.status === 'live' && m.participants?.includes(user?.id)) || null, [meetings, user]);

  const handleStartMeeting = () => {
    if (meetings.filter(m => m.host === user?.id && m.status === 'live').length >= 2) {
      toast.error('Maximum concurrent live meetings limit reached (2)');
      return;
    }
    const meeting = createInstantMeeting({ id: user?.id || 'u7', role: user?.role || 'employee' });
    toast.success('Meeting started and broadcast to all users!');
    if (meeting) navigate(`/app/meeting/lobby/${meeting.id}`);
  };

  const teamMembers = useMemo(() => {
    return users.filter(u => u.id !== user?.id).slice(0, 5).map(u => ({
      id: u.id,
      name: u.name,
      status: u.status === 'online' ? 'online' : u.status === 'away' ? 'away' : 'busy',
      role: u.title || u.role,
    }));
  }, [users, user]);

  const defaultWeeklyAttendance = [
    { label: 'Mon', value: 85 }, { label: 'Tue', value: 92 },
    { label: 'Wed', value: 78 }, { label: 'Thu', value: 95 },
    { label: 'Fri', value: 88 }, { label: 'Sat', value: 45 }, { label: 'Sun', value: 20 },
  ];

  const weeklyAttendance = useMemo(() => {
    if (attendanceRecords.length > 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      attendanceRecords.forEach(r => {
        const idx = (new Date(r.joinTime).getDay() + 6) % 7;
        counts[idx] += 1;
      });
      return days.map((label, i) => ({ label, value: counts[i] }));
    }
    return defaultWeeklyAttendance;
  }, [attendanceRecords]);

  const taskDistribution = useMemo(() => {
    const categories = [
      { label: 'Design Tasks', tags: ['design'] },
      { label: 'Meetings', tags: ['meeting'] },
      { label: 'Development', tags: ['code', 'report', 'engineering'] },
      { label: 'Documentation', tags: ['docs', 'documentation'] },
      { label: 'Reviews', tags: ['review'] },
      { label: 'Email', tags: ['email'] },
    ];
    return categories
      .map(c => ({ label: c.label, value: tasks.filter(t => t.tags?.some(tag => c.tags.includes(tag.toLowerCase()))).length }))
      .filter(c => c.value > 0);
  }, [tasks]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-6" role="status" aria-label="Loading home">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
        <span className="sr-only">Loading complete</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Home - Employee Dashboard - AdzConnect</title>
        <meta name="description" content="Your personalized employee home with recent activity, announcements, and upcoming events." />
      </Helmet>
      <ErrorBoundary title="Home Error" message="Failed to load home content. Please try again.">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6 p-6">
        <motion.div variants={itemVariants} className="flex flex-wrap items-start justify-between gap-4">
          <WelcomeBanner user={user} role="Employee" />
          <div className="flex items-center gap-3">
            <NotificationCenter notifications={userNotifications} unreadCount={unreadNotifications} onMarkRead={markAllNotificationsRead} onMarkReadOne={markNotificationRead} />
            <Button variant="secondary" size="sm" icon={HiSearch} onClick={() => navigate('/app/search')}>Search</Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Meetings Today', value: dashboardMetrics.meetingsToday || upcomingMeetings.length || 3, icon: HiVideoCamera, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', href: '/app/meetings' },
            { label: 'Pending Tasks', value: dashboardMetrics.tasksPending || myTasks.length || 7, icon: HiClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', href: '/app/tasks' },
            { label: 'Unread Notifications', value: unreadNotifications || 5, icon: HiBell, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', href: '/app/notifications' },
            { label: 'Team Online', value: teamMembers.filter(m => m.status === 'online').length || 4, icon: HiUserGroup, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', href: '/app/team' },
          ].map((stat) => (
            <Card key={stat.label} hover onClick={() => navigate(stat.href)}>
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-400 dark:text-slate-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiFlag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Priorities</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Pending Tasks', value: myTasks.length || 7, icon: HiClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', to: '/app/tasks' },
              { label: 'Unread Notifications', value: unreadNotifications || 5, icon: HiBell, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', to: '/app/notifications' },
              { label: 'Meetings This Week', value: myMeetings.length || 8, icon: HiVideoCamera, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', to: '/app/meetings' },
              { label: 'My Files', value: dashboardMetrics.filesCount || 12, icon: HiFolder, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', to: '/app/files' },
              { label: 'My Reports', value: dashboardMetrics.reportsGenerated || 45, icon: HiDocumentText, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', to: '/app/analytics/personal' },
            ].map((item) => (
              <Card key={item.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(item.to)}>
                <div className={`inline-flex p-2.5 rounded-xl ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{item.label}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiHome className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Overview</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Welcome Back, {user?.name || 'Employee'}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">Here is your personalized dashboard overview for today.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <p className="text-xs text-gray-500 dark:text-slate-400">Attendance Rate</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{dashboardMetrics.avgAttendance}%</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <p className="text-xs text-gray-500 dark:text-slate-400">Tasks Completed</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{dashboardMetrics.tasksCompleted}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <p className="text-xs text-gray-500 dark:text-slate-400">Messages Sent</p>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400">{dashboardMetrics.messagesSent}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <p className="text-xs text-gray-500 dark:text-slate-400">Meetings This Week</p>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{dashboardMetrics.meetingsThisWeek}</p>
                </div>
              </div>
            </Card>
            <DashboardCalendarWidget />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {nextMeeting ? (
                <MeetingCountdown targetDate={nextMeeting.date} targetTime={nextMeeting.time} label={`Next: ${nextMeeting.title}`} />
              ) : liveMeeting ? (
                <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/app/meeting/lobby/${liveMeeting.id}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-medium uppercase tracking-wide opacity-90">Live now</span>
                  </div>
                  <p className="text-sm font-semibold truncate">{liveMeeting.title}</p>
                  <p className="text-xs opacity-90 mt-1">Join the meeting that's currently in progress.</p>
                  <Button variant="secondary" size="sm" className="mt-3" icon={HiVideoCamera} onClick={() => navigate(`/app/meeting/lobby/${liveMeeting.id}`)}>Join</Button>
                </Card>
              ) : (
                <Card className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 text-white hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/app/calendar')}>
                  <div className="flex items-center gap-2 mb-2">
                    <HiCalendar className="w-4 h-4" />
                    <span className="text-xs font-medium opacity-90">My Day</span>
                  </div>
                  <p className="text-sm opacity-90">No upcoming meetings scheduled. Tap to check your calendar or schedule a new meeting.</p>
                </Card>
              )}
            </div>
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="primary" fullWidth icon={HiVideoCamera} size="md" onClick={handleStartMeeting}>Start Meeting</Button>
                <Button variant="outline" fullWidth icon={HiPlusCircle} size="md" onClick={() => navigate('/app/join')}>Join Meeting</Button>
                <Button variant="secondary" fullWidth icon={HiCalendar} size="md" onClick={() => navigate('/app/calendar')}>View Schedule</Button>
                <Button variant="ghost" fullWidth icon={HiSearch} size="md" onClick={() => navigate('/app/search')}>Search</Button>
              </div>
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiBell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Announcements</h2>
          </div>
          <div className="space-y-3">
            {(announcements || []).slice(0, 3).map((announcement) => (
              <Card key={announcement.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/announcements')}>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shrink-0">
                    <HiBadgeCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{announcement.title || 'Announcement'}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{announcement.description || 'No description available'}</p>
                  </div>
                  <HiChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
                </div>
              </Card>
            ))}
            {(!announcements || announcements.length === 0) && (
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">No announcements at this time</p>
              </Card>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiClock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Meetings</h2>
            <Button variant="ghost" size="xs" onClick={() => navigate('/app/meetings')}>View All</Button>
          </div>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/app/meeting/${meeting.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 shrink-0">
                    <HiVideoCamera className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{meeting.title}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{meeting.date} at {meeting.time}</p>
                  </div>
                  <Badge variant="primary" size="sm">{meeting.status || 'Upcoming'}</Badge>
                </div>
              </Card>
            ))}
            {upcomingMeetings.length === 0 && (
              <Card className="p-4 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">No upcoming meetings</p>
                <div className="mt-2 space-y-2">
                  <Card className="p-3 text-left cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/app/meeting/m1')}>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"><HiVideoCamera className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 dark:text-white truncate">Weekly Engineering Standup</p><p className="text-xs text-gray-400 dark:text-slate-500">Today, 09:00</p></div>
                      <Badge variant="primary" size="sm">Live</Badge>
                    </div>
                  </Card>
                  <Card className="p-3 text-left cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/app/meeting/m2')}>
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"><HiVideoCamera className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 dark:text-white truncate">Product Strategy Q3 Planning</p><p className="text-xs text-gray-400 dark:text-slate-500">Today, 14:00</p></div>
                      <Badge variant="warning" size="sm">Upcoming</Badge>
                    </div>
                  </Card>
                </div>
                <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate('/app/join')}>Join a Meeting</Button>
              </Card>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiFlag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Tasks</h2>
            <Button variant="ghost" size="xs" onClick={() => navigate('/app/tasks')}>View All</Button>
          </div>
          <TaskListWidget />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiTrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <ActivityFeed />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiSparkles className="w-5 h-5 text-violet-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <HiLightningBolt className="w-5 h-5 text-violet-500" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">AI Recommendations</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Based on your activity, here are some suggestions to improve your productivity.</p>
              <div className="mt-3 space-y-2">
                {[
                  'Review your pending tasks before the next meeting',
                  'Schedule time for focused work this afternoon',
                  'Check the latest announcements from your team',
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                    <HiBadgeCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <HiChartBar className="w-5 h-5 text-violet-500" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Weekly Analytics</h3>
              </div>
              <AreaChartCard data={weeklyAttendance} title="Weekly Meeting Attendance" badge="This Week" height={160} />
            </Card>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiUserGroup className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-4 text-center hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/app/team?user=${member.id}`)}>
                <Avatar name={member.name} size="md" status={member.status} />
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">{member.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
                <span className={`inline-block w-2 h-2 rounded-full mt-1 ${member.status === 'online' ? 'bg-emerald-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'}`} />
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
      </ErrorBoundary>
    </>
  );
}