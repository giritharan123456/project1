import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiUserGroup, HiSearch, HiDownload, HiChartBar } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { exportToCSV } from '../../utils/export';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function HRMeetingParticipation() {
  const navigate = useNavigate();
  const { users, dashboardMetrics } = useApp();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const employees = users
    .filter((u) => u.role === 'employee' || u.role === 'host')
    .map((u) => {
      const attended = u.meetingsAttended || 0;
      const total = attended + (u.meetingsHosted || 0);
      const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;
      return {
        id: u.id,
        name: u.name,
        department: u.department,
        meetingsAttended: attended,
        totalMeetings: total,
        meetingsHosted: u.meetingsHosted || 0,
        attendanceRate,
        avgDuration: 35,
        participation: attendanceRate,
      };
    });

  const deptStats = Object.values(
    employees.reduce((acc, e) => {
      if (!acc[e.department]) acc[e.department] = { department: e.department, attendanceSum: 0, participationSum: 0, meetingsHosted: 0, count: 0 };
      acc[e.department].attendanceSum += e.attendanceRate;
      acc[e.department].participationSum += e.participation;
      acc[e.department].meetingsHosted += e.meetingsHosted;
      acc[e.department].count += 1;
      return acc;
    }, {})
  ).map((d) => ({
    department: d.department,
    avgAttendance: Math.round(d.attendanceSum / d.count),
    avgParticipation: Math.round(d.participationSum / d.count),
    meetingsHeld: d.meetingsHosted,
  }));

  const avgParticipation = employees.length ? Math.round(employees.reduce((s, e) => s + e.participation, 0) / employees.length) : 0;

  const filtered = employees.filter(e =>
    (departmentFilter === 'all' || e.department === departmentFilter) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Meeting Participation - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Participation</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Track employee meeting attendance and engagement</p>
        </div>
        <Button variant="primary" icon={HiDownload} onClick={() => exportToCSV(employees, 'participation-report.csv')}>Export Report</Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Active Employees</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{dashboardMetrics.avgAttendance}%</p><p className="text-sm text-gray-500 dark:text-slate-400">Avg Attendance Rate</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{avgParticipation}%</p><p className="text-sm text-gray-500 dark:text-slate-400">Avg Participation Score</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardMetrics.meetingsThisWeek}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Meetings This Month</p></Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Participation Details</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="all">All Departments</option>
                {[...new Set(employees.map(e => e.department))].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-slate-400">Employee</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-slate-400">Department</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-500 dark:text-slate-400">Attended/Total</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-500 dark:text-slate-400">Attendance %</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-500 dark:text-slate-400">Avg Duration</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-500 dark:text-slate-400">Participation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={emp.name} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-white">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-600 dark:text-slate-400">{emp.department}</td>
                    <td className="py-3 px-2 text-center text-gray-900 dark:text-white">{emp.meetingsAttended}/{emp.totalMeetings}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`font-medium ${emp.attendanceRate >= 90 ? 'text-emerald-600' : emp.attendanceRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                        {emp.attendanceRate}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-600 dark:text-slate-400">{emp.avgDuration}min</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full" style={{ width: `${emp.participation}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{emp.participation}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><HiChartBar className="w-4 h-4" /> Department Stats</h3>
            <div className="space-y-3">
              {deptStats.map((d) => (
                <div key={d.department} className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-700/30">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{d.department}</p>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-slate-400">
                    <span>Attendance: {d.avgAttendance}%</span>
                    <Badge variant={d.avgAttendance >= 90 ? 'success' : d.avgAttendance >= 80 ? 'warning' : 'danger'} size="xs">{d.meetingsHeld} meetings</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="primary" fullWidth size="sm" icon={HiDownload} onClick={() => exportToCSV(deptStats, 'department-stats.csv')}>Export Attendance</Button>
              <Button variant="outline" fullWidth size="sm" icon={HiChartBar} onClick={() => navigate('/app/analytics')}>View Analytics</Button>
              <Button variant="secondary" fullWidth size="sm" icon={HiUserGroup} onClick={() => navigate('/app/team')}>Employee Directory</Button>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
