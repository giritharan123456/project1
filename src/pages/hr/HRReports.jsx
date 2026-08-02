import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiUser, HiUserGroup, HiPaperClip, HiOfficeBuilding, HiChartBar, HiHome,
  HiDownload, HiDocumentReport,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { exportToCSV } from '../../utils/export';
import { pct, avg } from '../../utils/hrPeople';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const LEAVE_SEED = [
  { id: 'lr1', Employee: 'Amanda White', Type: 'Sick', Start: '2026-08-03', End: '2026-08-03', Status: 'pending' },
  { id: 'lr2', Employee: 'Robert Taylor', Type: 'Vacation', Start: '2026-08-10', End: '2026-08-14', Status: 'pending' },
  { id: 'lr3', Employee: 'Jennifer Lee', Type: 'Personal', Start: '2026-08-05', End: '2026-08-05', Status: 'approved' },
];

export default function HRReports() {
  const { users, attendanceRecords, dashboardMetrics } = useApp();
  const [active, setActive] = useHRTab('employee');

  const [leaveData] = useState(() => {
    try {
      const stored = localStorage.getItem('connectly-leave-requests');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length) return parsed.map((r) => ({ Employee: r.employeeName, Type: r.type, Start: r.startDate, End: r.endDate, Status: r.status }));
      }
    } catch {}
    return LEAVE_SEED;
  });

  const tabs = [
    { key: 'employee', label: 'Employee Reports', icon: HiUser },
    { key: 'attendance', label: 'Attendance Reports', icon: HiUserGroup },
    { key: 'leave', label: 'Leave Reports', icon: HiPaperClip },
    { key: 'department', label: 'Department Reports', icon: HiOfficeBuilding },
    { key: 'performance', label: 'Performance Reports', icon: HiChartBar },
    { key: 'organization', label: 'Organization Reports', icon: HiHome },
  ];

  const employeeReport = useMemo(() => {
    return users.map((u) => ({
      'Employee': u.name,
      'Department': u.department || 'General',
      'Role': u.role,
      'Title': u.title,
      'Status': u.status,
      'Location': u.location || '—',
      'Joined': u.joined,
      'Meetings Hosted': u.meetingsHosted || 0,
      'Meetings Attended': u.meetingsAttended || 0,
    }));
  }, [users]);

  const attendanceReport = useMemo(() => {
    return users.map((u) => {
      const records = (attendanceRecords || []).filter((r) => r.userId === u.id || r.userName === u.name);
      const present = records.filter((r) => r.status === 'present').length;
      return {
        'Employee': u.name,
        'Department': u.department || 'General',
        'Records': records.length,
        'Present': present,
        'Attendance %': pct(present, records.length),
        'Avg Duration (min)': Math.round(avg(records.map((r) => r.duration || 0))),
      };
    });
  }, [users, attendanceRecords]);

  const departmentReport = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      const dept = u.department || 'General';
      if (!map[dept]) map[dept] = { Department: dept, Count: 0, Online: 0, Away: 0, Offline: 0, Managers: 0 };
      map[dept].Count += 1;
      map[dept][u.status === 'online' ? 'Online' : u.status === 'away' ? 'Away' : 'Offline'] += 1;
      if (['manager', 'admin', 'executive', 'ceo', 'hr'].includes(u.role)) map[dept].Managers += 1;
    });
    return Object.values(map);
  }, [users]);

  const performanceReport = useMemo(() => {
    return users.map((u) => {
      const records = (attendanceRecords || []).filter((r) => r.userId === u.id || r.userName === u.name);
      const attendance = pct(records.filter((r) => r.status === 'present').length, records.length);
      const presence = u.status === 'online' ? 100 : u.status === 'away' ? 70 : 40;
      const engagement = Math.round(attendance * 0.4 + (records.length ? 50 : 0) * 0.3 + presence * 0.3);
      return {
        'Employee': u.name,
        'Department': u.department || 'General',
        'Attendance %': attendance,
        'Engagement': engagement,
        'Performance Score': Math.round(attendance * 0.6 + engagement * 0.4),
        'Rating': 'Good',
      };
    });
  }, [users, attendanceRecords]);

  const organizationReport = useMemo(() => {
    return [
      { 'Metric': 'Total Employees', 'Value': users.length },
      { 'Metric': 'Departments', 'Value': new Set(users.map((u) => u.department)).size },
      { 'Metric': 'Online Now', 'Value': users.filter((u) => u.status === 'online').length },
      { 'Metric': 'New Hires (MTD)', 'Value': dashboardMetrics.newRegistrations },
      { 'Metric': 'Avg Attendance %', 'Value': dashboardMetrics.avgAttendance },
      { 'Metric': 'Team Satisfaction %', 'Value': dashboardMetrics.teamSatisfaction },
      { 'Metric': 'Wellness Score', 'Value': dashboardMetrics.wellnessScore },
      { 'Metric': 'Active Sessions', 'Value': dashboardMetrics.activeSessions },
    ];
  }, [users, dashboardMetrics]);

  const renderTable = (data) => {
    if (!data.length) return <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">No data available</p>;
    const headers = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              {headers.map((h) => (
                <th key={h} className="text-left py-2 px-2 font-medium text-gray-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                {headers.map((h) => (
                  <td key={h} className="py-2.5 px-2 text-gray-700 dark:text-slate-300 whitespace-nowrap">{String(row[h] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const contentMap = {
    employee: { data: employeeReport, filename: 'employee-report.csv', title: 'Employee Reports' },
    attendance: { data: attendanceReport, filename: 'attendance-report.csv', title: 'Attendance Reports' },
    leave: { data: leaveData, filename: 'leave-report.csv', title: 'Leave Reports' },
    department: { data: departmentReport, filename: 'department-report.csv', title: 'Department Reports' },
    performance: { data: performanceReport, filename: 'performance-report.csv', title: 'Performance Reports' },
    organization: { data: organizationReport, filename: 'organization-report.csv', title: 'Organization Reports' },
  };

  const current = contentMap[active];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Reports - AdzConnect HR</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">People, attendance, leave, and performance reports</p>
        </div>
        <Button variant="primary" size="sm" icon={HiDocumentReport} onClick={() => exportToCSV(current.data, current.filename)}>Export Report</Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <HRSectionTabs tabs={tabs} active={active} onChange={setActive} />
      </motion.div>

      <motion.div variants={itemVariants} key={active}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{current.title}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">{current.data.length} rows</Badge>
              <Button variant="outline" size="xs" icon={HiDownload} onClick={() => exportToCSV(current.data, current.filename)}>CSV</Button>
            </div>
          </div>
          {renderTable(current.data)}
        </Card>
      </motion.div>
    </motion.div>
  );
}
