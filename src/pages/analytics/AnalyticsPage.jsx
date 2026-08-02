import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiCalendar, HiPresentationChartLine, HiUsers, HiClock, HiVideoCamera,
  HiDownload, HiStar, HiTrendingUp, HiChevronDown, HiDocumentReport,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/export';
import BarChartCard from '../../components/charts/BarChartCard';
import LineChartCard from '../../components/charts/LineChartCard';
import DonutChartCard from '../../components/charts/DonutChartCard';
import AreaChartCard from '../../components/charts/AreaChartCard';
import RadarChartCard from '../../components/charts/RadarChartCard';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

const timePeriods = ['Today', 'This Week', 'This Month', 'This Quarter', 'This Year', 'Custom'];

const weeklyDurationData = [
  { week: 'W1', hours: 24 },
  { week: 'W2', hours: 31 },
  { week: 'W3', hours: 28 },
  { week: 'W4', hours: 35 },
  { week: 'W5', hours: 22 },
  { week: 'W6', hours: 29 },
];

const engagementData = [
  { label: 'Week 1', value: 72 },
  { label: 'Week 2', value: 85 },
  { label: 'Week 3', value: 68 },
  { label: 'Week 4', value: 91 },
  { label: 'Week 5', value: 78 },
  { label: 'Week 6', value: 88 },
];

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const meetingTypeLabels = { scheduled: 'Scheduled', instant: 'Instant', recurring: 'Recurring', breakout: 'Breakout' };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function HeatMap({ data, days, hours, cellSize = 28 }) {
  const maxVal = Math.max(...data.flat());
  const getColor = (val) => {
    if (val === 0) return 'bg-gray-100 dark:bg-slate-700/30';
    const intensity = val / maxVal;
    if (intensity > 0.75) return 'bg-primary-700';
    if (intensity > 0.5) return 'bg-primary-500';
    if (intensity > 0.25) return 'bg-primary-300';
    return 'bg-primary-200 dark:bg-primary-800';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5" style={{ minWidth: hours.length * (cellSize + 2) }}>
        <div className="w-24 flex-shrink-0" />
        {hours.map((h) => (
          <div key={h} className="text-[9px] text-gray-400 dark:text-slate-500 text-center" style={{ width: cellSize }}>{h}</div>
        ))}
      </div>
      {days.map((day, di) => (
        <div key={day} className="flex gap-0.5 items-center mt-0.5">
          <div className="w-24 text-[10px] text-gray-500 dark:text-slate-400 text-right pr-2 flex-shrink-0">{day}</div>
          {hours.map((_, hi) => {
            const val = data[di]?.[hi] || 0;
            return (
              <div
                key={hi}
                className={`rounded-sm ${getColor(val)} transition-colors`}
                style={{ width: cellSize, height: cellSize }}
                title={`${day} ${hours[hi]}: ${val} meetings`}
              />
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[10px] text-gray-400">Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-slate-700/30" />
        <div className="w-3 h-3 rounded-sm bg-primary-200 dark:bg-primary-800" />
        <div className="w-3 h-3 rounded-sm bg-primary-300" />
        <div className="w-3 h-3 rounded-sm bg-primary-500" />
        <div className="w-3 h-3 rounded-sm bg-primary-700" />
        <span className="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  );
}

const radarData = [
  { label: 'Audio', value: 85 },
  { label: 'Video', value: 72 },
  { label: 'Screen Share', value: 60 },
  { label: 'Chat', value: 78 },
  { label: 'Recording', value: 45 },
  { label: 'Polls', value: 35 },
];

const heatMapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const heatMapHours = ['6a', '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p'];

function generateHeatMapData() {
  return heatMapDays.map(() =>
    heatMapHours.map(() => Math.floor(Math.random() * 8))
  );
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { meetings, users, attendanceRecords, dashboardMetrics, getCurrentUser } = useApp();
  const currentUser = getCurrentUser();
  const [activePeriod, setActivePeriod] = useState('This Month');
  const [heatMapData] = useState(generateHeatMapData);

  const totalMinutes = useMemo(() => meetings.reduce((s, m) => s + (m.duration || 0), 0), [meetings]);
  const uniqueParticipants = useMemo(() => new Set(meetings.flatMap((m) => m.participants || [])).size, [meetings]);

  const kpiCards = useMemo(() => [
    { label: 'Total Meetings', value: String(meetings.length), icon: HiVideoCamera, change: '+12%', changeType: 'up' },
    { label: 'Total Hours', value: `${Math.round(totalMinutes / 60)}h`, icon: HiClock, change: '+8%', changeType: 'up' },
    { label: 'Total Participants', value: String(uniqueParticipants), icon: HiUsers, change: '+15%', changeType: 'up' },
    { label: 'Avg Duration', value: meetings.length ? `${Math.round(totalMinutes / meetings.length)}min` : '0min', icon: HiPresentationChartLine, change: '-2%', changeType: 'down' },
  ], [meetings, totalMinutes, uniqueParticipants]);

  const meetingsPerDay = useMemo(() => {
    const counts = Array(7).fill(0);
    meetings.forEach((m) => {
      if (m?.date) counts[(new Date(`${m.date}T12:00:00`).getDay() + 6) % 7] += 1;
    });
    return counts;
  }, [meetings]);
  const dayLabels = weekLabels;

  const meetingTypes = useMemo(() => {
    const counts = {};
    meetings.forEach((m) => { const t = m.type || 'scheduled'; counts[t] = (counts[t] || 0) + 1; });
    return Object.entries(counts).map(([t, value]) => ({ label: meetingTypeLabels[t] || t, value }));
  }, [meetings]);

  const departmentData = useMemo(() => {
    const map = {};
    users.forEach((u) => { if (u?.department && !map[u.department]) map[u.department] = { name: u.department, meetings: 0, hours: 0, participants: 0 }; });
    meetings.forEach((m) => {
      const depts = new Set((m.participants || []).map((pid) => users.find((u) => u.id === pid)?.department).filter(Boolean));
      depts.forEach((d) => { if (map[d]) { map[d].meetings += 1; map[d].hours += m.duration || 0; } });
    });
    Object.values(map).forEach((x) => { x.participants = users.filter((u) => u.department === x.name).length; });
    return Object.values(map).filter((x) => x.meetings > 0).map((x) => ({ ...x, avgDuration: x.meetings ? `${Math.round(x.hours / x.meetings)}min` : '0min' }));
  }, [users, meetings]);

  const myMeetings = useMemo(
    () => meetings.filter((m) => m.host === currentUser?.id || m.participants?.includes(currentUser?.id)),
    [meetings, currentUser],
  );
  const myMinutes = useMemo(() => myMeetings.reduce((s, m) => s + (m.duration || 0), 0), [myMeetings]);
  const attendanceRate = useMemo(() => attendanceRecords.length
    ? Math.round((attendanceRecords.filter((r) => r.status === 'present').length / attendanceRecords.length) * 100)
    : 0, [attendanceRecords]);

  const ownDashboard = useMemo(() => (currentUser?.role ? `/app/dashboard/${currentUser.role}` : '/app/home'), [currentUser]);

  const handleExportReport = useCallback(() => {
    const csvData = [
      { metric: 'Total Meetings', value: String(meetings.length), change: '+12%', period: activePeriod },
      { metric: 'Total Hours', value: `${Math.round(totalMinutes / 60)}h`, change: '+8%', period: activePeriod },
      { metric: 'Total Participants', value: String(uniqueParticipants), change: '+15%', period: activePeriod },
      { metric: 'Avg Duration', value: meetings.length ? `${Math.round(totalMinutes / meetings.length)}min` : '0min', change: '-2%', period: activePeriod },
      ...meetingTypes.map(t => ({ metric: `Meeting Type: ${t.label}`, value: `${t.value} meetings`, change: '', period: activePeriod })),
      ...departmentData.map(d => ({ metric: `Dept: ${d.name}`, value: `${d.meetings} meetings`, change: `${d.hours}h`, period: activePeriod })),
    ];
    exportToCSV(csvData, `analytics-${activePeriod.toLowerCase().replace(/\s+/g, '-')}.csv`);
    toast.success('Analytics report exported as CSV');
  }, [activePeriod, meetings, totalMinutes, uniqueParticipants, meetingTypes, departmentData]);

  const handleChartDrillDown = useCallback((target) => {
    navigate(target);
  }, [navigate]);

  return (
    <>
    <Helmet>
      <title>Analytics - AdzConnect</title>
      <meta name="description" content="View AdzConnect analytics including meeting statistics, team performance, and usage trends." />
    </Helmet>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Track your meeting metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <HiCalendar className="w-4 h-4 text-gray-400" />
              {activePeriod}
              <HiChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </MenuButton>
            <MenuItems className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-700 rounded-xl shadow-lg border border-gray-100 dark:border-slate-600 py-1 z-10 origin-top-right">
              {timePeriods.map((p) => (
                <MenuItem key={p}>
                  {({ active }) => (
                    <button
                      onClick={() => setActivePeriod(p)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        activePeriod === p
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium'
                          : active
                            ? 'bg-gray-50 dark:bg-slate-600 text-gray-700 dark:text-slate-200'
                            : 'text-gray-700 dark:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
          <Button variant="ghost" size="sm" icon={HiDocumentReport} onClick={() => navigate('/app/reports')}>Reports</Button>
          <Button variant="ghost" size="sm" icon={HiCalendar} onClick={() => navigate('/app/calendar')}>Calendar</Button>
          <Button variant="secondary" size="sm" icon={HiDownload} onClick={handleExportReport}>Export Report</Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} hover>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 dark:text-slate-400">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${kpi.changeType === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    <HiTrendingUp className={`w-3 h-3 ${kpi.changeType === 'down' ? 'rotate-180' : ''}`} />
                    {kpi.change}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cursor-pointer" onClick={() => handleChartDrillDown('/app/meetings')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleChartDrillDown('/app/meetings')} aria-label="View meetings per day details">
          <BarChartCard data={meetingsPerDay} labels={dayLabels} title="Meetings per Day" badge={{ text: "Last 7 days", variant: "primary" }} height={220} />
        </div>
        <div className="cursor-pointer" onClick={() => handleChartDrillDown('/app/reports')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleChartDrillDown('/app/reports')} aria-label="View duration trends details">
          <LineChartCard data={weeklyDurationData} title="Duration Trends" badge={{ text: "Weekly avg", variant: "info" }} height={220} />
        </div>
      </motion.div>

      {/* Second Charts Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cursor-pointer" onClick={() => handleChartDrillDown('/app/meetings')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleChartDrillDown('/app/meetings')} aria-label="View meeting type distribution details">
          <DonutChartCard data={meetingTypes} title="Meeting Types" badge={{ text: "Distribution", variant: "warning" }} />
        </div>
        <div className="cursor-pointer" onClick={() => handleChartDrillDown('/app/participants')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleChartDrillDown('/app/participants')} aria-label="View engagement details">
          <AreaChartCard data={engagementData} title="Participant Engagement" badge={{ text: "% rate", variant: "success" }} height={220} />
        </div>
      </motion.div>

      {/* Radar Chart - Feature Usage & Heat Map */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cursor-pointer" onClick={() => handleChartDrillDown('/app/recordings')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleChartDrillDown('/app/recordings')} aria-label="View feature usage details">
          <RadarChartCard data={radarData} title="Feature Usage" badge={{ text: "Radar view", variant: "info" }} />
        </div>

        {/* Heat Map - Meeting Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Meeting Activity Heat Map</h3>
            <Badge variant="warning">Peak hours</Badge>
          </div>
          <HeatMap data={heatMapData} days={heatMapDays} hours={heatMapHours} />
        </Card>
      </motion.div>

      {/* Department Analytics */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Department Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Meeting metrics by department</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Meetings</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Hours</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Participants</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold">
                          {dept.name[0]}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-slate-300 font-medium">{dept.meetings}</td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-slate-300 font-medium">{dept.hours}h</td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-slate-300 font-medium">{dept.participants}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="default">{dept.avgDuration}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Personal Stats */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Your Personal Stats</h3>
            <Button variant="ghost" size="xs" icon={HiTrendingUp} onClick={() => navigate(ownDashboard)}>My Dashboard</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-900/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                  <HiVideoCamera className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400">Your Meetings</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{myMeetings.length}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <HiTrendingUp className="w-3 h-3" /> {attendanceRate}% attendance
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <HiClock className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400">Your Hours</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(myMinutes / 60)}h</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <HiTrendingUp className="w-3 h-3" /> +5% from last month
              </p>
            </div>
            <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                  <HiStar className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-500 dark:text-slate-400">Avg Rating</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardMetrics.teamSatisfaction}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <HiStar className="w-3 h-3" /> Top rated host
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
    </>
  );
}
