import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiClock, HiUserGroup, HiVideoCamera, HiStar, HiTrendingUp, HiArrowSmUp, HiArrowSmDown, HiDownload,
  HiDocumentReport, HiCalendar, HiViewGrid, HiMicrophone, HiHome,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdayOf = (dateStr) => (dateStr ? DAY_NAMES[new Date(`${dateStr}T12:00:00`).getDay()] : 'Mon');

const TYPE_LABELS = { scheduled: 'Scheduled', instant: 'Instant', recurring: 'Recurring', breakout: 'Breakout' };

export default function HostAnalytics() {
  const navigate = useNavigate();
  const { meetings, attendanceRecords, recordings, dashboardMetrics } = useApp();
  const [timeRange, setTimeRange] = useState('week');

  const factor = timeRange === 'week' ? 1 : timeRange === 'month' ? 4.3 : 13;

  const baseStats = useMemo(() => {
    const totalDuration = meetings.reduce((s, m) => s + (m.duration || 0), 0);
    const totalParticipants = meetings.reduce((s, m) => s + (m.participants?.length || 0), 0);
    return {
      totalMeetings: meetings.length,
      totalDuration: Math.round(totalDuration / 60),
      avgParticipants: meetings.length ? (totalParticipants / meetings.length).toFixed(1) : '0.0',
      avgRating: dashboardMetrics.teamSatisfaction,
      recordingsCount: recordings.length,
      attendanceRate: attendanceRecords.length
        ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
        : 0,
    };
  }, [meetings, recordings, attendanceRecords, dashboardMetrics.teamSatisfaction]);

  const stats = {
    totalMeetings: Math.round(baseStats.totalMeetings * factor),
    totalDuration: Math.round(baseStats.totalDuration * factor),
    avgParticipants: baseStats.avgParticipants,
    avgRating: baseStats.avgRating,
    recordingsCount: Math.round(baseStats.recordingsCount * factor),
    attendanceRate: baseStats.attendanceRate,
  };

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const acc = Object.fromEntries(days.map(d => [d, { meetings: 0, duration: 0, attendees: 0 }]));
    meetings.forEach(m => {
      const d = weekdayOf(m.date);
      if (acc[d]) {
        acc[d].meetings += 1;
        acc[d].duration += m.duration || 0;
        acc[d].attendees += m.participants?.length || 0;
      }
    });
    return days.map(d => ({ day: d, ...acc[d] }));
  }, [meetings]);

  const chartData = weeklyData.map((d) => ({ ...d, meetings: Math.max(1, Math.round(d.meetings * factor)) }));

  const typeData = useMemo(() => {
    const counts = {};
    meetings.forEach(m => { const t = m.type || 'scheduled'; counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => {
      const ofType = meetings.filter(m => (m.type || 'scheduled') === type);
      const avgDuration = Math.round(ofType.reduce((s, m) => s + (m.duration || 0), 0) / count);
      return { type: TYPE_LABELS[type] || type, count: Math.round(count * factor), avgDuration };
    });
  }, [meetings, factor]);

  const statCards = [
    { label: 'Total Meetings', value: stats.totalMeetings, change: 12, icon: HiVideoCamera, color: 'primary' },
    { label: 'Total Duration', value: `${stats.totalDuration}h`, change: 8, icon: HiClock, color: 'emerald' },
    { label: 'Avg Participants', value: stats.avgParticipants, change: 5, icon: HiUserGroup, color: 'violet' },
    { label: 'Avg Rating', value: stats.avgRating, change: 0.3, icon: HiStar, color: 'amber' },
    { label: 'Recordings', value: stats.recordingsCount, change: 15, icon: HiMicrophone, color: 'rose' },
    { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, change: 4, icon: HiTrendingUp, color: 'teal' },
  ];

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Meetings', stats.totalMeetings],
      ['Total Duration (h)', stats.totalDuration],
      ['Avg Participants', stats.avgParticipants],
      ['Avg Rating', stats.avgRating],
      ['Recordings', stats.recordingsCount],
      ['Attendance Rate (%)', stats.attendanceRate],
      ...chartData.map((d) => [`Meetings - ${d.day}`, d.meetings]),
      ...typeData.map((t) => [`Type - ${t.type}`, t.count]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `host-analytics-${timeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickActions = [
    { label: 'View Reports', icon: HiDocumentReport, color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10', onClick: () => navigate('/app/reports') },
    { label: 'Team Calendar', icon: HiCalendar, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10', onClick: () => navigate('/app/calendar/team') },
    { label: 'Manage Meetings', icon: HiViewGrid, color: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10', onClick: () => navigate('/app/meetings') },
    { label: 'View Recordings', icon: HiMicrophone, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10', onClick: () => navigate('/app/recordings') },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Host Analytics - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Host Analytics</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Meeting performance and hosting insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={HiHome} onClick={() => navigate('/app/dashboard/host')}>Dashboard</Button>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <Button variant="outline" size="sm" icon={HiDownload} onClick={handleExport}>Export</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button key={action.label} onClick={action.onClick} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 text-left">
            <span className={`p-2 rounded-lg ${action.color}`}>
              <action.icon className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const isUp = stat.change >= 0;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                <span className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isUp ? <HiArrowSmUp className="w-3 h-3" /> : <HiArrowSmDown className="w-3 h-3" />} {Math.abs(stat.change)}%
              </div>
            </Card>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Quarterly'} Meeting Activity</h3>
          <div className="space-y-3">
            {chartData.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="w-10 text-sm font-medium text-gray-500 dark:text-slate-400">{d.day}</span>
                <div className="flex-1"><div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${(d.meetings / Math.max(...chartData.map((x) => x.meetings))) * 100}%` }} /></div></div>
                <span className="text-sm text-gray-900 dark:text-white w-12 text-right">{d.meetings}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Meeting Types</h3>
            <Button size="xs" variant="ghost" icon={HiViewGrid} onClick={() => navigate('/app/meetings')}>View all</Button>
          </div>
          <div className="space-y-3">
            {typeData.map((m) => (
              <div key={m.type} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div><p className="font-medium text-gray-900 dark:text-white text-sm">{m.type}</p><p className="text-xs text-gray-500 dark:text-slate-400">{m.avgDuration} min avg</p></div>
                <Badge variant="primary" size="sm">{m.count} meetings</Badge>
              </div>
            ))}
            {typeData.length === 0 && <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No meetings yet</p>}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
