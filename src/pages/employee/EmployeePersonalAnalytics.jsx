import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiClock, HiVideoCamera, HiUserGroup, HiCheckCircle, HiChartBar, HiArrowSmUp, HiArrowSmDown, HiChevronDown, HiChat, HiArrowRight, HiChevronRight } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EmployeePersonalAnalytics() {
  const { getCurrentUser, users, tasks, meetings: allMeetings, messages, attendanceRecords, dashboardMetrics } = useApp();
  const me = getCurrentUser();
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState(null);

  const myTasks = tasks.filter((t) => t.assignedTo === me?.name || (t.assignedTo === 'You' && me));
  const tasksCompleted = myTasks.filter((t) => t.completed).length;

  const myAttendance = attendanceRecords.filter((r) => r.userId === me?.id);
  const attended = myAttendance.length > 0 ? myAttendance.length : (me?.meetingsAttended || 0);
  const presentCount = myAttendance.filter((r) => r.status !== 'absent').length;
  const attendanceRate = myAttendance.length > 0
    ? Math.round((presentCount / myAttendance.length) * 100)
    : dashboardMetrics.avgAttendance;

  const recordedDurations = myAttendance.map((r) => r.duration || 0).filter((d) => d > 0);
  const avgDuration = recordedDurations.length
    ? Math.round(recordedDurations.reduce((s, d) => s + d, 0) / recordedDurations.length)
    : dashboardMetrics.avgDuration || 30;

  const now = new Date().getTime();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
  const inWindow = (ts, start, end) => { const t = new Date(ts).getTime(); return Number.isFinite(t) && t >= start && t < end; };

  const recentAttendance = myAttendance.filter((r) => inWindow(r.joinTime || r.timestamp, oneWeekAgo, now));
  const priorAttendance = myAttendance.filter((r) => inWindow(r.joinTime || r.timestamp, twoWeeksAgo, oneWeekAgo));

  const recentAvgDuration = recentAttendance.length
    ? recentAttendance.reduce((s, r) => s + (r.duration || 0), 0) / recentAttendance.length
    : 0;
  const priorAvgDuration = priorAttendance.length
    ? priorAttendance.reduce((s, r) => s + (r.duration || 0), 0) / priorAttendance.length
    : 0;

  const pctChange = (recent, prior) => {
    if (prior > 0) return Math.round(((recent - prior) / prior) * 100);
    if (recent > 0) return 100;
    return 0;
  };

  const recentDone = myTasks.filter((t) => (t.completedAt || t.createdAt) && inWindow(t.completedAt || t.createdAt, oneWeekAgo, now)).length;
  const priorDone = myTasks.filter((t) => (t.completedAt || t.createdAt) && inWindow(t.completedAt || t.createdAt, twoWeeksAgo, oneWeekAgo)).length;

  const recentActivityScore = recentAttendance.length + recentDone;
  const priorActivityScore = priorAttendance.length + priorDone;

  const stats = {
    meetingsJoined: attended,
    avgDuration,
    tasksCompleted,
    avgRating: dashboardMetrics.teamSatisfaction,
    attendanceRate,
    contributions: attended + tasksCompleted,
  };

  const changes = {
    meetingsJoined: pctChange(recentAttendance.length, priorAttendance.length),
    avgDuration: pctChange(recentAvgDuration, priorAvgDuration),
    tasksCompleted: pctChange(recentDone, priorDone),
    avgRating: pctChange(recentDone, priorDone),
    attendanceRate: attendanceRate !== dashboardMetrics.avgAttendance ? Math.round(attendanceRate - dashboardMetrics.avgAttendance) : 0,
    contributions: pctChange(recentActivityScore, priorActivityScore),
  };

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const dateStrOf = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const hasAttendance = myAttendance.length > 0;

  const weeklyActivity = weekDays.map((day, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const meetingsCount = hasAttendance
      ? myAttendance.filter((r) => dateStrOf(r.joinTime || r.timestamp) === dateStr).length
      : allMeetings.filter((m) => m.date === dateStr && (m.host === me?.id || (m.participants || []).includes(me?.id))).length;
    const tasksCount = myTasks.filter((t) => dateStrOf(t.completedAt || t.createdAt) === dateStr).length;
    const messagesCount = messages.filter((msg) => dateStrOf(msg.timestamp) === dateStr && (msg.from === me?.id || msg.to === me?.id)).length;
    return {
      day,
      meetings: meetingsCount,
      tasks: tasksCount,
      messages: messagesCount,
    };
  });

  const userNameOf = (id) => {
    if (!id) return 'Unknown';
    if (id === me?.id) return 'Me';
    const u = users.find((x) => x.id === id);
    return u?.name || id;
  };

  const detailsForDay = (dayIndex) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const meetingsDetail = myAttendance
      .filter((r) => dateStrOf(r.joinTime || r.timestamp) === dateStr)
      .map((r) => {
        const mtg = allMeetings.find((m) => m.id === r.meetingId || m.meetingId === r.meetingId);
        return {
          id: r.id,
          type: 'meeting',
          title: mtg?.title || r.meetingName || `Meeting (${r.meetingId || 'unscheduled'})`,
          meta: `${new Date(r.joinTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${r.duration ? ` · ${r.duration} min` : ''}`,
          status: r.status || 'present',
          navPath: mtg ? `/app/meeting/${mtg.id}` : '/app/meetings',
        };
      });
    const tasksDetail = myTasks
      .filter((t) => dateStrOf(t.completedAt || t.createdAt) === dateStr)
      .map((t) => ({
        id: t.id,
        type: 'task',
        title: t.title,
        meta: `${t.completed || t.status === 'done' ? 'Completed' : t.status || 'Assigned'}${t.dueDate ? ` · due ${t.dueDate}` : ''}`,
        status: t.completed || t.status === 'done' ? 'done' : t.status || 'todo',
        navPath: '/app/tasks',
      }));
    const messagesDetail = messages
      .filter((msg) => dateStrOf(msg.timestamp) === dateStr && (msg.from === me?.id || msg.to === me?.id))
      .map((msg) => ({
        id: msg.id,
        type: 'message',
        title: msg.text,
        meta: msg.from === me?.id ? `You → ${userNameOf(msg.to)}` : `${userNameOf(msg.from)} → You`,
        status: 'message',
        navPath: '/app/chat',
      }));
    return [...meetingsDetail, ...tasksDetail, ...messagesDetail];
  };
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>My Analytics - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Analytics</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Personal performance and meeting insights</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[{ label: 'Meetings Joined', value: stats.meetingsJoined, change: changes.meetingsJoined, icon: HiVideoCamera, color: 'primary', to: '/app/meetings' }, { label: 'Avg Duration', value: `${stats.avgDuration}m`, change: changes.avgDuration, icon: HiClock, color: 'emerald', to: '/app/meeting-history' }, { label: 'Tasks Done', value: stats.tasksCompleted, change: changes.tasksCompleted, icon: HiCheckCircle, color: 'violet', to: '/app/tasks' }, { label: 'Rating', value: stats.avgRating, change: changes.avgRating, icon: HiChartBar, color: 'amber', to: '/app/ai' }, { label: 'Attendance', value: `${stats.attendanceRate}%`, change: changes.attendanceRate, icon: HiUserGroup, color: 'teal', to: '/app/calendar' }, { label: 'Contributions', value: stats.contributions, change: changes.contributions, icon: HiCheckCircle, color: 'rose', to: '/app/collaboration' }].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-2 mb-2"><stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} /><span className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</span></div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${stat.change > 0 ? 'text-emerald-600 dark:text-emerald-400' : stat.change < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-slate-500'}`}>{stat.change > 0 ? <HiArrowSmUp className="w-3 h-3" /> : stat.change < 0 ? <HiArrowSmDown className="w-3 h-3" /> : null} {stat.change > 0 ? '+' : ''}{stat.change}%</div>
            <button onClick={() => navigate(stat.to)} className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg py-1.5 transition-colors">
              View details <HiArrowRight className="w-3 h-3" />
            </button>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h2>
          <span className="text-xs text-gray-400 dark:text-slate-500">Tap a day for details</span>
        </div>
        <div className="space-y-3">
          {weeklyActivity.map((d, i) => {
            const details = detailsForDay(i);
            const expanded = expandedDay === d.day;
            return (
              <Card
                key={d.day}
                onClick={() => setExpandedDay(expanded ? null : d.day)}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium w-8 text-left ${expanded ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>{d.day}</span>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2"><HiVideoCamera className="w-4 h-4 text-primary-600 dark:text-primary-400" /><span className="text-gray-900 dark:text-white">{d.meetings} meetings</span></span>
                      <span className="flex items-center gap-2"><HiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /><span className="text-gray-900 dark:text-white">{d.tasks} tasks</span></span>
                      <span className="flex items-center gap-2"><HiUserGroup className="w-4 h-4 text-violet-600 dark:text-violet-400" /><span className="text-gray-900 dark:text-white">{d.messages} messages</span></span>
                    </div>
                  </div>
                  <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </div>
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-2">
                    {details.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-slate-500 py-1">No activity recorded for this day.</p>
                    ) : (
                      details.map((item) => (
                        <button
                          key={item.id || `${item.type}-${item.title}`}
                          type="button"
                          onClick={() => navigate(item.navPath)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-700/40 hover:bg-gray-100 dark:hover:bg-slate-700/70 transition-colors text-left"
                        >
                          {item.type === 'meeting' && <HiVideoCamera className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />}
                          {item.type === 'task' && <HiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
                          {item.type === 'message' && <HiChat className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{item.meta}</p>
                          </div>
                          <Badge variant={item.type === 'meeting' ? 'info' : item.type === 'task' && item.status === 'done' ? 'success' : 'default'} size="sm">
                            {item.type === 'meeting' ? (item.status === 'absent' ? 'Absent' : 'Present') : item.type === 'task' ? (item.status === 'done' ? 'Done' : item.status) : 'Message'}
                          </Badge>
                          <HiChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 flex-shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}