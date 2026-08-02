import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiCalendar, HiUserGroup, HiCheckCircle, HiXCircle, HiClock,
  HiDownload, HiOfficeBuilding, HiTrendingUp,
  HiPaperClip, HiPlusCircle,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ProgressBar from '../../components/ui/ProgressBar';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { exportToCSV } from '../../utils/export';
import { fmtDate, groupBy, sum, avg, pct } from '../../utils/hrPeople';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TODAY_KEY = '2026-08-01';

const dayLabel = (dateKey) => {
  try {
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateKey;
  }
};

export default function HRAttendance() {
  const { users, meetings, attendanceRecords, dashboardMetrics } = useApp();
  const [active, setActive] = useHRTab('today');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-leave-requests');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'lr1', employeeName: 'Amanda White', type: 'Sick', startDate: '2026-08-03', endDate: '2026-08-03', reason: 'Flu symptoms', status: 'pending', submittedAt: '2026-07-31T09:00:00.000Z' },
      { id: 'lr2', employeeName: 'Robert Taylor', type: 'Vacation', startDate: '2026-08-10', endDate: '2026-08-14', reason: 'Family trip', status: 'pending', submittedAt: '2026-07-30T14:30:00.000Z' },
      { id: 'lr3', employeeName: 'Jennifer Lee', type: 'Personal', startDate: '2026-08-05', endDate: '2026-08-05', reason: 'Personal appointment', status: 'approved', submittedAt: '2026-07-28T11:00:00.000Z' },
    ];
  });

  const meetingMap = useMemo(() => {
    const map = {};
    (meetings || []).forEach((m) => { map[m.id] = m; });
    return map;
  }, [meetings]);

  const recordsWithMeeting = useMemo(() => {
    return (attendanceRecords || []).map((r) => ({ ...r, meeting: meetingMap[r.meetingId] || {} }));
  }, [attendanceRecords, meetingMap]);

  const employees = useMemo(() => users.filter((u) => u.role !== 'admin' && u.role !== 'ceo'), [users]);

  const tabs = [
    { key: 'today', label: "Today's Attendance", icon: HiCalendar },
    { key: 'daily', label: 'Daily Attendance', icon: HiUserGroup },
    { key: 'weekly', label: 'Weekly Attendance', icon: HiTrendingUp },
    { key: 'monthly', label: 'Monthly Attendance', icon: HiOfficeBuilding },
    { key: 'leave', label: 'Leave Management', icon: HiPaperClip },
    { key: 'late', label: 'Late Arrivals', icon: HiClock },
    { key: 'absent', label: 'Absent Employees', icon: HiXCircle },
    { key: 'reports', label: 'Attendance Reports', icon: HiDownload },
  ];

  const meetingName = (meetingId) => meetingMap[meetingId]?.title || 'Meeting';
  const meetingDate = (meetingId) => meetingMap[meetingId]?.date || '';

  const todayAttend = useMemo(() => {
    return employees.map((u) => ({
      id: u.id,
      name: u.name,
      department: u.department,
      avatar: u.avatar,
      status: u.status === 'online' ? 'present' : u.status === 'away' ? 'late' : 'absent',
    }));
  }, [employees]);

  const dailyData = useMemo(() => {
    const groups = groupBy([...recordsWithMeeting].sort((a, b) => (b.joinTime || '').localeCompare(a.joinTime || '')), (r) => (r.joinTime || '').slice(0, 10));
    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, list]) => ({ date, label: dayLabel(date), list }));
  }, [recordsWithMeeting]);

  const weeklyData = useMemo(() => {
    const weekRecords = recordsWithMeeting.filter((r) => {
      const d = (r.joinTime || '').slice(0, 10);
      return d >= '2026-07-27' && d <= '2026-08-02';
    });
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((d) => {
      const list = weekRecords.filter((r) => {
        const date = new Date(`${(r.joinTime || '').slice(0, 10)}T12:00:00`);
        const label = date.toLocaleDateString('en-US', { weekday: 'short' });
        return label === d;
      });
      return { day: d, present: list.length, rate: pct(list.length, weekRecords.length) };
    });
  }, [recordsWithMeeting]);

  const monthlyData = useMemo(() => {
    const monthRecords = recordsWithMeeting.filter((r) => (r.joinTime || '').startsWith('2026-07'));
    const byUser = groupBy(monthRecords, (r) => r.userId || r.userName);
    return Object.entries(byUser).map(([key, list]) => {
      const userName = list[0].userName || key;
      const present = list.filter((r) => r.status === 'present').length;
      const total = list.length;
      return { id: key, name: userName, present, total, rate: pct(present, total), avgDuration: Math.round(avg(list.map((r) => r.duration || 0))) };
    }).sort((a, b) => b.rate - a.rate);
  }, [recordsWithMeeting]);

  const lateRecords = useMemo(() => {
    return recordsWithMeeting
      .filter((r) => {
        const m = r.meeting;
        if (!m || !m.time) return false;
        const start = new Date(`${m.date}T${m.time}:00`);
        const joined = new Date(r.joinTime);
        return joined > start;
      })
      .sort((a, b) => (a.joinTime || '').localeCompare(b.joinTime || ''));
  }, [recordsWithMeeting]);

  const absentData = useMemo(() => {
    const rows = [];
    (meetings || []).forEach((m) => {
      const recorded = new Set((attendanceRecords || []).filter((r) => r.meetingId === m.id).map((r) => r.userId));
      (m.participants || []).forEach((pid) => {
        if (!recorded.has(pid)) {
          const u = users.find((x) => x.id === pid);
          if (u) rows.push({ id: `${m.id}-${pid}`, meetingId: m.id, meetingTitle: m.title, meetingDate: m.date, userId: pid, name: u.name, department: u.department });
        }
      });
    });
    return rows;
  }, [meetings, attendanceRecords, users]);

  const reportData = useMemo(() => {
    return employees.map((u) => {
      const my = recordsWithMeeting.filter((r) => (r.userId === u.id) || (r.userName === u.name));
      const present = my.filter((r) => r.status === 'present').length;
      const total = my.length;
      const late = lateRecords.filter((r) => r.userId === u.id || r.userName === u.name).length;
      const absent = absentData.filter((r) => r.userId === u.id).length;
      return {
        Employee: u.name,
        Department: u.department,
        'Meetings Attended': total,
        Present: present,
        Late: late,
        Absent: absent,
        'Attendance Rate (%)': pct(present, total + late + absent),
        'Avg Duration (min)': Math.round(avg(my.map((r) => r.duration || 0))),
      };
    });
  }, [employees, recordsWithMeeting, lateRecords, absentData]);

  const handleApproveLeave = (id) => {
    setLeaveRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved', resolvedAt: new Date().toISOString() } : r)));
    toast.success('Leave request approved');
  };

  const handleDenyLeave = (id) => {
    setLeaveRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'denied', resolvedAt: new Date().toISOString() } : r)));
    toast.success('Leave request denied');
  };

  const handleSubmitLeave = () => {
    if (!newLeave.employeeName || !newLeave.startDate || !newLeave.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    const request = {
      id: `lr${Date.now()}`,
      ...newLeave,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setLeaveRequests((prev) => [...prev, request]);
    toast.success('Leave request submitted');
    setShowLeaveModal(false);
    setNewLeave({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' });
  };

  const statusMeta = { present: { label: 'Present', variant: 'success', dot: true }, late: { label: 'Late', variant: 'warning', dot: true }, absent: { label: 'Absent', variant: 'danger', dot: true } };

  const renderContent = () => {
    if (active === 'today') {
      const meetingsToday = (meetings || []).filter((m) => m.date === TODAY_KEY);
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Status — {dayLabel(TODAY_KEY)}</h2>
              <Badge variant="info" size="sm">{todayAttend.length} employees</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {todayAttend.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{u.department}</p>
                    </div>
                  </div>
                  <Badge variant={statusMeta[u.status].variant} dot size="xs">{statusMeta[u.status].label}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Meetings Today</h3>
              {meetingsToday.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No meetings scheduled today</p>
              ) : meetingsToday.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{m.time} · {m.participants?.length || 0} participants</p>
                </div>
              ))}
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Today's Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Present</span><span className="font-semibold text-emerald-600">{todayAttend.filter((u) => u.status === 'present').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Late</span><span className="font-semibold text-amber-600">{todayAttend.filter((u) => u.status === 'late').length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Absent</span><span className="font-semibold text-red-600">{todayAttend.filter((u) => u.status === 'absent').length}</span></div>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    if (active === 'daily') {
      return (
        <div className="space-y-4">
          {dailyData.map((d) => (
            <Card key={d.date} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{d.label}</h3>
                <Badge variant="primary" size="sm">{d.list.length} records</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Employee</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Department</th>
                      <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Meeting</th>
                      <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Status</th>
                      <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.list.map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 dark:border-slate-700/50">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar name={r.userName} size="xs" />
                            <span className="font-medium text-gray-900 dark:text-white">{r.userName}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-gray-600 dark:text-slate-400">{r.department}</td>
                        <td className="py-2.5 px-2 text-gray-600 dark:text-slate-400">{meetingName(r.meetingId)}</td>
                        <td className="py-2.5 px-2 text-center">
                          <Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'} size="xs">{r.status}</Badge>
                        </td>
                        <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{r.duration || 0}min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'weekly') {
      const totalPresent = sum(weeklyData.map((d) => d.present));
      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance by Day (This Week)</h2>
            <div className="space-y-3">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="w-10 text-sm font-medium text-gray-700 dark:text-slate-300">{d.day}</span>
                  <ProgressBar value={d.present} max={Math.max(totalPresent, 1)} variant={d.present >= 8 ? 'success' : d.present >= 4 ? 'warning' : 'danger'} className="flex-1" />
                  <span className="w-8 text-right text-sm text-gray-500 dark:text-slate-400">{d.present}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Week Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Total Check-ins</span><span className="font-semibold text-gray-900 dark:text-white">{totalPresent}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Busiest Day</span><span className="font-semibold text-blue-600">{[...weeklyData].sort((a, b) => b.present - a.present)[0]?.day || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">Avg Attendance</span><span className="font-semibold text-emerald-600">{dashboardMetrics.avgAttendance}%</span></div>
            </div>
          </Card>
        </div>
      );
    }

    if (active === 'monthly') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Attendance — July 2026</h2>
            <Button variant="outline" size="sm" icon={HiDownload} onClick={() => exportToCSV(monthlyData, 'monthly-attendance.csv')}>Export</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Employee</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Present</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Total</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Rate</th>
                  <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Avg Duration</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-slate-700/50">
                    <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white">{u.name}</td>
                    <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{u.present}</td>
                    <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{u.total}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`font-medium ${u.rate >= 90 ? 'text-emerald-600' : u.rate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{u.rate}%</span>
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{u.avgDuration}min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      );
    }

    if (active === 'leave') {
      const pending = leaveRequests.filter((r) => r.status === 'pending');
      const approved = leaveRequests.filter((r) => r.status === 'approved');
      const denied = leaveRequests.filter((r) => r.status === 'denied');
      return (
        <div className="space-y-4">
          <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-6 text-sm">
              <span className="text-gray-500 dark:text-slate-400">Pending <strong className="text-amber-600 ml-1">{pending.length}</strong></span>
              <span className="text-gray-500 dark:text-slate-400">Approved <strong className="text-emerald-600 ml-1">{approved.length}</strong></span>
              <span className="text-gray-500 dark:text-slate-400">Denied <strong className="text-red-600 ml-1">{denied.length}</strong></span>
            </div>
            <Button variant="primary" size="sm" icon={HiPlusCircle} onClick={() => setShowLeaveModal(true)}>New Leave Request</Button>
          </Card>
          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <Card className="p-8 text-center text-gray-500 dark:text-slate-400">No leave requests yet</Card>
            ) : leaveRequests.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={r.employeeName} size="md" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{r.employeeName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{r.startDate} — {r.endDate}{r.reason ? ` · ${r.reason}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.type === 'Sick' ? 'danger' : r.type === 'Vacation' ? 'success' : 'info'} size="sm">{r.type}</Badge>
                    <Badge variant={r.status === 'pending' ? 'warning' : r.status === 'approved' ? 'success' : 'danger'} size="sm">{r.status}</Badge>
                    {r.status === 'pending' && (
                      <>
                        <Button variant="success" size="xs" icon={HiCheckCircle} onClick={() => handleApproveLeave(r.id)}>Approve</Button>
                        <Button variant="danger" size="xs" icon={HiXCircle} onClick={() => handleDenyLeave(r.id)}>Deny</Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (active === 'late') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Late Arrivals</h2>
            <Badge variant="warning" size="sm">{lateRecords.length} flagged</Badge>
          </div>
          {lateRecords.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No late arrivals recorded</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Employee</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Meeting</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Date</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Scheduled</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {lateRecords.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-slate-700/50">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.userName} size="xs" />
                          <span className="font-medium text-gray-900 dark:text-white">{r.userName}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-600 dark:text-slate-400">{meetingName(r.meetingId)}</td>
                      <td className="py-2.5 px-2 text-gray-600 dark:text-slate-400">{meetingDate(r.meetingId)}</td>
                      <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{r.meeting?.time || '—'}</td>
                      <td className="py-2.5 px-2 text-center text-amber-600">{(r.joinTime || '').slice(11, 16)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      );
    }

    if (active === 'absent') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Absent Employees</h2>
            <Badge variant="danger" size="sm">{absentData.length} absences</Badge>
          </div>
          <div className="space-y-2">
            {absentData.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Avatar name={a.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{a.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.meetingTitle}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{fmtDate(a.meetingDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Reports</h2>
          <Button variant="primary" size="sm" icon={HiDownload} onClick={() => exportToCSV(reportData, 'attendance-report.csv')}>Export CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Employee</th>
                <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Department</th>
                <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Attended</th>
                <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Late</th>
                <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Absent</th>
                <th className="text-center py-2 px-2 font-medium text-gray-500 dark:text-slate-400">Rate</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((r) => (
                <tr key={r.Employee} className="border-b border-gray-100 dark:border-slate-700/50">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.Employee} size="xs" />
                      <span className="font-medium text-gray-900 dark:text-white">{r.Employee}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-gray-600 dark:text-slate-400">{r.Department}</td>
                  <td className="py-2.5 px-2 text-center text-gray-600 dark:text-slate-400">{r['Meetings Attended']}</td>
                  <td className="py-2.5 px-2 text-center text-amber-600">{r.Late}</td>
                  <td className="py-2.5 px-2 text-center text-red-600">{r.Absent}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-medium ${r['Attendance Rate (%)'] >= 90 ? 'text-emerald-600' : r['Attendance Rate (%)'] >= 80 ? 'text-amber-600' : 'text-red-600'}`}>{r['Attendance Rate (%)']}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Attendance - AdzConnect HR</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Track daily, weekly, and monthly attendance, leave, and absences</p>
        </div>
        <Button variant="primary" size="sm" icon={HiPlusCircle} onClick={() => setShowLeaveModal(true)}>Request Leave</Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{todayAttend.filter((u) => u.status === 'present').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Present Today</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{todayAttend.filter((u) => u.status === 'late').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Late Today</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-red-600">{todayAttend.filter((u) => u.status === 'absent').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Absent Today</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-emerald-600">{dashboardMetrics.avgAttendance}%</p><p className="text-sm text-gray-500 dark:text-slate-400">Avg Attendance</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{leaveRequests.filter((r) => r.status === 'pending').length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Pending Leave</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-violet-600">{lateRecords.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Late Arrivals</p></Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HRSectionTabs tabs={tabs} active={active} onChange={setActive} />
      </motion.div>

      <motion.div variants={itemVariants} key={active}>
        {renderContent()}
      </motion.div>

      <Modal isOpen={showLeaveModal} onClose={() => { setShowLeaveModal(false); setNewLeave({ employeeName: '', type: 'Sick', startDate: '', endDate: '', reason: '' }); }} title="New Leave Request" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Employee Name</label>
            <input type="text" value={newLeave.employeeName} onChange={(e) => setNewLeave((prev) => ({ ...prev, employeeName: e.target.value }))} placeholder="Employee name" className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Leave Type</label>
            <select value={newLeave.type} onChange={(e) => setNewLeave((prev) => ({ ...prev, type: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="Sick">Sick</option>
              <option value="Vacation">Vacation</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Start Date</label>
              <input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">End Date</label>
              <input type="date" value={newLeave.endDate} onChange={(e) => setNewLeave((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Reason (optional)</label>
            <textarea value={newLeave.reason} onChange={(e) => setNewLeave((prev) => ({ ...prev, reason: e.target.value }))} rows={2} className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmitLeave}>Submit Request</Button>
        </div>
      </Modal>
    </motion.div>
  );
}
