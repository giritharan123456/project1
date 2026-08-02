import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiUsers, HiCheckCircle, HiXCircle, HiClock, HiDownload } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';

const depts = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance', 'HR'];
const fallbackDates = ['2026-07-30', '2026-07-29', '2026-07-28', '2026-07-27', '2026-07-26'];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AttendancePage() {
  const { user } = useAuth();
  const { createInstantMeeting, attendanceRecords } = useApp();

  const attendanceRows = useMemo(() => {
    return attendanceRecords.map(r => ({
      id: r.id,
      name: r.userName || 'Unknown Member',
      status: r.status === 'absent' ? 'absent' : 'present',
      checkIn: r.status === 'absent' ? '--' : new Date(r.joinTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      checkOut: '--',
      hours: r.status === 'absent' ? '0' : (r.duration / 60).toFixed(1),
      role: r.role || r.department || 'Member',
      department: r.department || 'General',
      date: new Date(r.joinTime).toISOString().slice(0, 10),
    }));
  }, [attendanceRecords]);

  const dates = useMemo(() => {
    const fromRecords = [...new Set(attendanceRows.map(r => r.date))].sort().reverse();
    return fromRecords.length > 0 ? fromRecords : fallbackDates;
  }, [attendanceRows]);

  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedDept, setSelectedDept] = useState('all');

  const filtered = attendanceRows.filter((a) =>
    a.date === selectedDate && (selectedDept === 'all' || a.department === selectedDept)
  );
  const presentCount = filtered.filter((a) => a.status === 'present').length;
  const lateCount = filtered.filter((a) => a.status === 'late').length;
  const absentCount = filtered.filter((a) => a.status === 'absent').length;
  const totalRate = filtered.length > 0 ? Math.round((presentCount / filtered.length) * 100) : 0;

  const handleExport = () => {
    exportToCSV(filtered, 'attendance-report.csv');
    toast.success('Attendance report exported');
  };

  const handleRequestLeave = (name) => {
    toast.success(`Leave request sent to ${name}`);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Attendance - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Tracking</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Monitor daily attendance and team participation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={HiDownload} onClick={handleExport}>Export Report</Button>
          <Button variant="primary" size="sm" onClick={() => createInstantMeeting({ id: user?.id || 'u7', role: user?.role || 'employee' })}>Team Meeting</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2"><HiCheckCircle className="w-5 h-5 text-emerald-500" /><span className="text-sm text-gray-500 dark:text-slate-400">Present</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{presentCount}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2"><HiClock className="w-5 h-5 text-amber-500" /><span className="text-sm text-gray-500 dark:text-slate-400">Late</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{lateCount}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2"><HiXCircle className="w-5 h-5 text-red-500" /><span className="text-sm text-gray-500 dark:text-slate-400">Absent</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{absentCount}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2"><HiUsers className="w-5 h-5 text-primary-500" /><span className="text-sm text-gray-500 dark:text-slate-400">Attendance Rate</span></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalRate}%</p>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Attendance</h2>
          <div className="flex items-center gap-3">
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white">
              {dates.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white">
              <option value="all">All Departments</option>
              {depts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
                <th className="pb-3 font-medium px-4">Member</th>
                <th className="pb-3 font-medium px-4">Role</th>
                <th className="pb-3 font-medium px-4">Status</th>
                <th className="pb-3 font-medium px-4">Check In</th>
                <th className="pb-3 font-medium px-4">Check Out</th>
                <th className="pb-3 font-medium px-4">Hours</th>
                <th className="pb-3 font-medium px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 dark:text-slate-500">No attendance records for the selected date and department</td>
                </tr>
              ) : (
                filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 dark:border-slate-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold">{a.name.split(' ').map((n) => n[0]).join('')}</div>
                      <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-slate-400">{a.role}</td>
                  <td className="py-3 px-4">
                    <Badge variant={a.status === 'present' ? 'success' : a.status === 'late' ? 'warning' : 'danger'} size="sm">{a.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">{a.checkIn}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">{a.checkOut}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{a.hours}h</td>
                  <td className="py-3 px-4">
                    {a.status === 'absent' && <Button variant="ghost" size="xs" onClick={() => handleRequestLeave(a.name)}>Request Leave</Button>}
                    {a.status === 'late' && <Button variant="ghost" size="xs" onClick={() => handleRequestLeave(a.name)}>Note Reason</Button>}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}