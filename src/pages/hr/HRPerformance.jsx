import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  HiChartBar, HiUserGroup, HiCheckCircle, HiHeart, HiStar, HiChatAlt2,
  HiThumbUp,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import BarChartCard from '../../components/charts/BarChartCard';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { pct, avg } from '../../utils/hrPeople';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const KUDOS_SEED = [
  { id: 'k1', from: 'Sarah Chen', to: 'Lisa Thompson', message: 'Great job leading the microservices migration design!', type: 'Achievement' },
  { id: 'k2', from: 'Emily Rodriguez', to: 'Amanda White', message: 'The new campaign content is outstanding.', type: 'Praise' },
  { id: 'k3', from: 'Alex Morgan', to: 'David Kim', message: 'Excellent quarterly planning and forecasting.', type: 'Leadership' },
  { id: 'k4', from: 'James Wilson', to: 'Michael Brown', message: 'Thank you for the quick PR reviews all week.', type: 'Support' },
];

export default function HRPerformance() {
  const navigate = useNavigate();
  const { users, attendanceRecords, meetings, tasks, recordings, dashboardMetrics } = useApp();
  const [active, setActive] = useHRTab('performance');

  const employees = useMemo(() => users.filter((u) => u.role === 'employee' || u.role === 'host'), [users]);

  const perUser = useMemo(() => {
    return employees.map((u) => {
      const records = (attendanceRecords || []).filter((r) => r.userId === u.id || r.userName === u.name);
      const present = records.filter((r) => r.status === 'present').length;
      const total = records.length;
      const attendance = pct(present, total);
      const participation = pct(records.length, (meetings || []).length);
      const presence = u.status === 'online' ? 100 : u.status === 'away' ? 70 : 40;
      const engagement = Math.round(attendance * 0.4 + participation * 0.3 + presence * 0.3);
      const performance = Math.round(attendance * 0.6 + engagement * 0.4);
      return {
        id: u.id,
        name: u.name,
        department: u.department,
        attendance,
        participation,
        engagement,
        performance,
        meetingsAttended: records.length,
        meetingsHosted: u.meetingsHosted || 0,
      };
    });
  }, [employees, attendanceRecords, meetings]);

  const taskStats = useMemo(() => {
    const list = tasks || [];
    return {
      total: list.length,
      completed: list.filter((t) => t.completed || t.status === 'done').length,
      inProgress: list.filter((t) => t.status === 'in-progress').length,
      todo: list.filter((t) => t.status === 'todo').length,
      overdue: list.filter((t) => t.dueDate && (t.dueDate === 'Today' || t.dueDate === 'Tomorrow' || /^Jul/i.test(t.dueDate) || /^Aug/i.test(t.dueDate)) && !t.completed).length,
    };
  }, [tasks]);

  const feedback = useMemo(() => {
    const rated = (recordings || []).filter((r) => Number(r.rating) > 0);
    const avgRating = rated.length ? avg(rated.map((r) => Number(r.rating))) : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: rated.filter((r) => Number(r.rating) === star).length,
    }));
    return { rated, avgRating, distribution, total: rated.length };
  }, [recordings]);

  const deptPerformance = useMemo(() => {
    const map = {};
    perUser.forEach((u) => {
      if (!map[u.department]) map[u.department] = { performance: [], engagement: [] };
      map[u.department].performance.push(u.performance);
      map[u.department].engagement.push(u.engagement);
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      performance: Math.round(avg(v.performance)),
      engagement: Math.round(avg(v.engagement)),
    }));
  }, [perUser]);

  const tabs = [
    { key: 'performance', label: 'Performance', icon: HiChartBar },
    { key: 'participation', label: 'Participation', icon: HiUserGroup },
    { key: 'productivity', label: 'Productivity', icon: HiCheckCircle },
    { key: 'engagement', label: 'Engagement', icon: HiHeart },
    { key: 'recognition', label: 'Recognition', icon: HiThumbUp },
    { key: 'feedback', label: 'Feedback', icon: HiChatAlt2 },
  ];

  const rateColor = (v) => (v >= 85 ? 'text-emerald-600' : v >= 70 ? 'text-amber-600' : 'text-red-600');

  const renderContent = () => {
    if (active === 'performance') {
      return (
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Performance Scores</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Employee</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Department</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Attendance</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Participation</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Engagement</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {perUser.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 dark:border-slate-700/50">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={u.name} size="xs" />
                          <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600 dark:text-slate-400">{u.department}</td>
                      <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{u.attendance}%</td>
                      <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{u.participation}%</td>
                      <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{u.engagement}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-semibold ${rateColor(u.performance)}`}>{u.performance}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Department Performance</h2>
            <BarChartCard data={deptPerformance.map((d) => d.performance)} labels={deptPerformance.map((d) => d.name)} title="Avg Performance by Department" barColor="#8b5cf6" height={200} />
          </Card>
        </div>
      );
    }

    if (active === 'participation') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Participation</h2>
            <Button variant="primary" size="sm" icon={HiUserGroup} onClick={() => navigate('/app/hr/participation')}>Open Full Report</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {perUser.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div className="flex items-center gap-2.5 mb-2">
                  <Avatar name={u.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{u.meetingsAttended} attended · {u.meetingsHosted} hosted</p>
                  </div>
                </div>
                <ProgressBar value={u.participation} variant={u.participation >= 70 ? 'success' : u.participation >= 50 ? 'warning' : 'danger'} />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{u.participation}% participation</p>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (active === 'productivity') {
      const max = Math.max(taskStats.total, 1);
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Tasks</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{taskStats.completed}</p><p className="text-sm text-gray-500 dark:text-slate-400">Completed</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p><p className="text-sm text-gray-500 dark:text-slate-400">In Progress</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{taskStats.overdue}</p><p className="text-sm text-gray-500 dark:text-slate-400">At Risk / Due Soon</p></Card>
          </div>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Task Completion</h2>
            <ProgressBar value={taskStats.completed} max={max} variant="gradient" size="lg" showLabel />
          </Card>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Tasks</h2>
            <div className="space-y-2">
              {(tasks || []).slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-2">
                    <HiCheckCircle className={`w-4 h-4 ${t.completed ? 'text-emerald-500' : 'text-gray-300 dark:text-slate-600'}`} />
                    <span className={`text-sm ${t.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{t.title}</span>
                  </div>
                  <Badge variant={t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'info'} size="xs">{t.priority || 'low'}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'engagement') {
      const avgEngagement = Math.round(avg(perUser.map((u) => u.engagement)));
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4"><p className="text-2xl font-bold text-teal-600">{avgEngagement}%</p><p className="text-sm text-gray-500 dark:text-slate-400">Avg Engagement</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{dashboardMetrics.teamSatisfaction}%</p><p className="text-sm text-gray-500 dark:text-slate-400">Team Satisfaction</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-violet-600">{dashboardMetrics.wellnessScore}</p><p className="text-sm text-gray-500 dark:text-slate-400">Wellness Score</p></Card>
            <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{dashboardMetrics.activeSessions}</p><p className="text-sm text-gray-500 dark:text-slate-400">Active Sessions</p></Card>
          </div>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {perUser.map((u) => (
                <div key={u.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Avatar name={u.name} size="sm" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                  </div>
                  <ProgressBar value={u.engagement} variant={u.engagement >= 80 ? 'success' : u.engagement >= 60 ? 'warning' : 'danger'} />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{u.engagement}% engagement</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'recognition') {
      return (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recognition & Kudos</h2>
          <div className="space-y-3">
            {KUDOS_SEED.map((k) => (
              <div key={k.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={k.from} size="sm" />
                    <p className="text-sm text-gray-500 dark:text-slate-400"><span className="font-medium text-gray-900 dark:text-white">{k.from}</span> → {k.to}</p>
                  </div>
                  <Badge variant="primary" size="xs">{k.type}</Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{k.message}</p>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-3xl font-bold text-amber-500">{feedback.avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <HiStar key={s} className={`w-4 h-4 ${s <= Math.round(feedback.avgRating) ? 'text-amber-400' : 'text-gray-300 dark:text-slate-600'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{feedback.total} rated recordings</p>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              {feedback.distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-gray-500 dark:text-slate-400">{d.star}★</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${feedback.total ? pct(d.count, feedback.total) : 0}%` }} />
                  </div>
                  <span className="w-6 text-xs text-gray-500 dark:text-slate-400">{d.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Feedback</h2>
          <div className="space-y-3">
            {feedback.rated.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No feedback yet</p>
            ) : feedback.rated.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.title}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <HiStar key={s} className={`w-3.5 h-3.5 ${s <= Number(r.rating) ? 'text-amber-400' : 'text-gray-300 dark:text-slate-600'}`} />
                    ))}
                  </div>
                </div>
                {r.review && <p className="text-sm text-gray-600 dark:text-slate-400 mt-1.5">"{r.review}"</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Performance & Engagement - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance & Engagement</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Employee performance, participation, productivity, and feedback</p>
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
