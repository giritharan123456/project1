import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiDocumentText, HiUserGroup, HiUsers, HiOfficeBuilding,
  HiVideoCamera, HiDownload, HiDocument,
  HiDocumentReport, HiTable, HiX, HiEye,
  HiTrendingUp,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { exportToCSV } from '../../utils/export';
import { useApp } from '../../context/AppContext';

const reportTypes = [
  { id: 'meeting', title: 'Meeting Reports', description: 'Detailed reports of all meetings including duration, participants, and recordings', icon: HiVideoCamera, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  { id: 'attendance', title: 'Attendance Reports', description: 'Track attendance patterns, join/leave times, and participant frequency', icon: HiUserGroup, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'user', title: 'User Reports', description: 'User activity metrics, meeting habits, and engagement scores', icon: HiUsers, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  { id: 'department', title: 'Department Reports', description: 'Cross-department meeting analytics and resource utilization', icon: HiOfficeBuilding, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'activity', title: 'Activity Reports', description: 'Real-time activity logs and meeting timeline overviews', icon: HiTrendingUp, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'recording', title: 'Recording Reports', description: 'Storage usage, recording durations, and access statistics', icon: HiDocumentText, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
];

const exportOptions = [
  { id: 'pdf', label: 'Export as PDF', description: 'Portable document format for sharing', icon: HiDocument, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  { id: 'excel', label: 'Export as Excel', description: 'Spreadsheet format with raw data', icon: HiTable, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { id: 'csv', label: 'Export as CSV', description: 'Comma-separated values for data processing', icon: HiDocumentReport, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
];

const getStoredReports = () => {
  try {
    const stored = localStorage.getItem('connectly-generated-reports');
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveReport = (report) => {
  const reports = getStoredReports();
  reports.unshift(report);
  localStorage.setItem('connectly-generated-reports', JSON.stringify(reports.slice(0, 20)));
};

const samplePreviewData = [
  { metric: 'Total Meetings', value: '234', change: '+12%' },
  { metric: 'Total Hours', value: '892h', change: '+8%' },
  { metric: 'Total Participants', value: '1,247', change: '+15%' },
  { metric: 'Avg Duration', value: '38 min', change: '-2%' },
  { metric: 'Avg Participants/Meeting', value: '5.3', change: '+3%' },
  { metric: 'Recording Storage', value: '12.4 GB', change: '+22%' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const cardHover = 'hover:-translate-y-0.5 transition-all duration-200';

export default function ReportsPage() {
  const { meetings, users, attendanceRecords, recordings } = useApp();
  const recentReports = useMemo(() => getStoredReports(), []);
  const [previewReport, setPreviewReport] = useState(null);
  const [generating, setGenerating] = useState(null);

  // Generate report data based on type
  const generateReportData = useCallback((type) => {
    switch (type) {
      case 'meeting':
        return meetings.map(m => ({
          'Meeting ID': m.meetingId || m.id,
          Title: m.title,
          Type: m.type,
          Date: m.date,
          Time: m.time,
          Duration: `${m.duration} min`,
          Status: m.status,
          Host: users.find(u => u.id === m.host)?.name || m.host,
          Participants: m.participants?.length || 0,
          Recording: m.recording ? 'Yes' : 'No',
        }));
      case 'attendance':
        return attendanceRecords.map(r => ({
          'Record ID': r.id,
          Meeting: meetings.find(m => m.id === r.meetingId)?.title || r.meetingId,
          User: users.find(u => u.id === r.userId)?.name || r.userId,
          Status: r.status,
          'Join Time': r.joinTime ? new Date(r.joinTime).toLocaleString() : '—',
          'Leave Time': r.leaveTime ? new Date(r.leaveTime).toLocaleString() : '—',
          Duration: r.duration ? `${r.duration} min` : '—',
        }));
      case 'user':
        return users.map(u => {
          const userMeetings = meetings.filter(m => m.participants?.includes(u.id) || m.host === u.id);
          const userAttendance = attendanceRecords.filter(r => r.userId === u.id);
          return {
            'User ID': u.id,
            Name: u.name,
            Email: u.email,
            Role: u.role,
            Department: u.department,
            'Meetings Joined': userMeetings.length,
            'Attendance Records': userAttendance.length,
            'Present Count': userAttendance.filter(r => r.status === 'present').length,
          };
        });
      case 'department':
        const deptMap = {};
        users.forEach(u => {
          const dept = u.department || 'General';
          if (!deptMap[dept]) deptMap[dept] = { users: 0, meetings: 0, hours: 0 };
          deptMap[dept].users++;
        });
        meetings.forEach(m => {
          const host = users.find(u => u.id === m.host);
          const dept = host?.department || 'General';
          if (deptMap[dept]) {
            deptMap[dept].meetings++;
            deptMap[dept].hours += m.duration;
          }
        });
        return Object.entries(deptMap).map(([dept, data]) => ({
          Department: dept,
          Users: data.users,
          Meetings: data.meetings,
          'Total Hours': data.hours,
        }));
      case 'activity':
        return meetings.map(m => ({
          'Meeting ID': m.meetingId || m.id,
          Title: m.title,
          Date: m.date,
          Time: m.time,
          Duration: `${m.duration} min`,
          Type: m.type,
          Status: m.status,
          Host: users.find(u => u.id === m.host)?.name || m.host,
          Participants: m.participants?.length || 0,
        }));
      case 'recording':
        return recordings.map(r => ({
          'Recording ID': r.id,
          Title: r.title,
          Date: r.date,
          Duration: r.duration,
          Size: r.size,
          Host: r.host,
          URL: r.url,
        }));
      default:
        return [];
    }
  }, [meetings, users, attendanceRecords, recordings]);

  const handleGenerate = (id) => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      const newReport = {
        id: `rpt-${Date.now()}`,
        name: reportTypes.find(r => r.id === id)?.title || 'Report',
        period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        type: id,
        status: 'ready',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      saveReport(newReport);
      toast.success(`${newReport.name} generated`);
    }, 2000);
  };

  const handleExport = useCallback((format) => {
    const data = generateReportData('meeting');
    if (format === 'csv') {
      exportToCSV(data, 'meeting-report.csv');
      toast.success('CSV exported successfully');
    } else {
      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Report</title><style>body{font-family:system-ui;padding:2rem;max-width:800px;margin:0 auto}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5}h1{color:#333}</style></head><body><h1>AdzConnect Report</h1><table><thead><tr>${Object.keys(data[0] || {}).map(k => `<th>${k}</th>`).join('')}</thead><tbody>${data.map(d => `<tr>${Object.values(d).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table><p style="margin-top:2rem;color:#666;font-size:0.875rem">Generated by AdzConnect on ${new Date().toLocaleDateString()}</p></body></html>`;
      const blob = new Blob([htmlContent], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const ext = format === 'pdf' ? 'pdf' : 'xls';
      link.download = `report.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success(`Report exported as ${format.toUpperCase()}`);
    }
  }, [generateReportData]);

  const statusLabel = (status) => {
    if (status === 'ready') return <Badge variant="success">Ready</Badge>;
    return <Badge variant="warning">Generating</Badge>;
  };

  return (
    <>
    <Helmet>
      <title>Reports - AdzConnect</title>
      <meta name="description" content="Access and generate AdzConnect reports for meetings, attendance, user activity, and more." />
    </Helmet>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Generate and manage analytics reports</p>
      </motion.div>

      {/* Report Type Cards */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} hover className={cardHover}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${report.bg} ${report.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{report.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    loading={generating === report.id}
                    onClick={() => {
                      handleGenerate(report.id);
                      const data = generateReportData(report.id);
                      exportToCSV(data, `${report.id}-report.csv`);
                      toast.success(`${report.title} generated and downloaded`);
                    }}
                  >
                    {generating === report.id ? 'Generating...' : 'Generate & Download'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div variants={itemVariants}>
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {exportOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleExport(opt.id)}
                  className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                >
                  <div className={`p-2.5 rounded-xl ${opt.bg} ${opt.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
                  </div>
                  <HiDownload className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Recent Reports */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Previously generated reports</p>
            </div>
          </div>
          <div className="space-y-2">
            {recentReports.map((report) => {
              const reportMeta = reportTypes.find((r) => r.id === report.type);
              const Icon = reportMeta?.icon || HiDocumentText;
              const color = reportMeta?.color || 'text-gray-500';
              const bg = reportMeta?.bg || 'bg-gray-100 dark:bg-gray-700';
              return (
                <div
                  key={report.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <div className={`p-2.5 rounded-xl ${bg} ${color} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{report.name}</h3>
                      {statusLabel(report.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      {report.period} &middot; Generated {report.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="xs"
                      variant="ghost"
                      icon={HiEye}
                      onClick={() => setPreviewReport(report)}
                    >
                      Preview
                    </Button>
                    {report.status === 'ready' && (
                      <Button size="xs" variant="ghost" icon={HiDownload} onClick={() => {
                        const csv = `Report,Type,Period,Generated\n"${report.name}","${report.type}","${report.period}","${report.date}"`;
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.csv`; a.click();
                        URL.revokeObjectURL(url);
                        toast.success(`${report.name} downloaded`);
                      }}>Download</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewReport(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{previewReport.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{previewReport.period}</p>
                </div>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-700">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Metric</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Value</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePreviewData.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-slate-700/50">
                          <td className="px-6 py-3.5 text-gray-700 dark:text-slate-300 font-medium">{row.metric}</td>
                          <td className="px-6 py-3.5 text-right text-gray-900 dark:text-white font-semibold">{row.value}</td>
                          <td className="px-6 py-3.5 text-right">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${row.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                              {row.change}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-700">
                <Button variant="ghost" onClick={() => setPreviewReport(null)}>Close</Button>
                <Button variant="primary" icon={HiDownload} onClick={() => handleExport('csv')}>Download Report</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
