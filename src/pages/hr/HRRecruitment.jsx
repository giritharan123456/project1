import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiUserAdd, HiAcademicCap, HiBadgeCheck, HiXCircle, HiDocumentText,
  HiClipboardCheck, HiCalendar, HiBriefcase, HiCheckCircle,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { fmtDate, isNewEmployee } from '../../utils/hrPeople';
import toast from 'react-hot-toast';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const VERIFICATION_SEED = [
  { id: 'v1', name: 'Sarah Chen', position: 'VP of Engineering', document: 'ID Verification', status: 'verified', submitted: '2026-02-15' },
  { id: 'v2', name: 'Emily Rodriguez', position: 'Marketing Manager', document: 'Background Check', status: 'verified', submitted: '2026-03-20' },
  { id: 'v3', name: 'David Kim', position: 'CFO', document: 'Bank Details', status: 'pending', submitted: '2026-07-28' },
  { id: 'v4', name: 'Amanda White', position: 'Content Strategist', document: 'ID Verification', status: 'pending', submitted: '2026-07-30' },
  { id: 'v5', name: 'Robert Taylor', position: 'Sales Representative', document: 'Employment Reference', status: 'pending', submitted: '2026-07-31' },
];

const ONBOARDING_SEED = [
  { id: 'o1', name: 'Amanda White', role: 'Content Strategist', department: 'Marketing', steps: ['Account Setup', 'Profile & Documents', 'Orientation', 'First Meeting'], progress: 75, status: 'in-progress' },
  { id: 'o2', name: 'Michael Brown', role: 'Frontend Developer', department: 'Engineering', steps: ['Account Setup', 'Profile & Documents', 'Orientation', 'First Meeting'], progress: 100, status: 'completed' },
  { id: 'o3', name: 'Jennifer Lee', role: 'UI/UX Designer', department: 'Design', steps: ['Account Setup', 'Profile & Documents', 'Orientation', 'First Meeting'], progress: 100, status: 'completed' },
  { id: 'o4', name: 'David Kim', role: 'CFO', department: 'Finance', steps: ['Account Setup', 'Profile & Documents', 'Orientation', 'First Meeting'], progress: 50, status: 'in-progress' },
];

const ORIENTATION_SEED = [
  { id: 'or1', date: '2026-08-04', title: 'Onboarding Session: New Hires', facilitator: 'Sarah Chen', attendees: 4, room: 'Main Hall' },
  { id: 'or2', date: '2026-08-06', title: 'Company Culture & Values', facilitator: 'James Wilson', attendees: 6, room: 'Breakout A' },
  { id: 'or3', date: '2026-08-11', title: 'Tools & Security Training', facilitator: 'IT Team', attendees: 5, room: 'Training Room' },
];

const DOCUMENTS_SEED = [
  { id: 'd1', employee: 'Amanda White', type: 'Offer Letter', status: 'signed', date: '2026-07-25' },
  { id: 'd2', employee: 'Michael Brown', type: 'NDA', status: 'signed', date: '2026-06-02' },
  { id: 'd3', employee: 'David Kim', type: 'Employment Contract', status: 'pending', date: '2026-07-29' },
  { id: 'd4', employee: 'Robert Taylor', type: 'Policy Acknowledgment', status: 'signed', date: '2026-07-18' },
  { id: 'd5', employee: 'Jennifer Lee', type: 'Benefits Enrollment', status: 'pending', date: '2026-07-31' },
];

export default function HRRecruitment() {
  const { users, pendingRegistrations, approveRegistration, rejectRegistration } = useApp();
  const [active, setActive] = useHRTab('joiners');

  const [verifications, setVerifications] = useState(VERIFICATION_SEED);
  const [onboarding] = useState(ONBOARDING_SEED);
  const [orientation] = useState(ORIENTATION_SEED);
  const [documents, setDocuments] = useState(DOCUMENTS_SEED);

  const joiners = useMemo(
    () => users.filter((u) => u.joined).sort((a, b) => new Date(b.joined) - new Date(a.joined)),
    [users]
  );

  const recentJoiners = useMemo(() => joiners.filter((u) => isNewEmployee(u)).slice(0, 4), [joiners]);

  const tabs = [
    { key: 'joiners', label: 'New Joiners', icon: HiUserAdd },
    { key: 'approvals', label: 'Approval Requests', icon: HiClipboardCheck },
    { key: 'verification', label: 'Verification', icon: HiBadgeCheck },
    { key: 'onboarding', label: 'Onboarding', icon: HiAcademicCap },
    { key: 'orientation', label: 'Orientation', icon: HiCalendar },
    { key: 'documents', label: 'Documents', icon: HiDocumentText },
  ];

  const stats = [
    { label: 'Total Joiners', value: joiners.length, icon: HiUserAdd, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { label: 'Pending Approvals', value: pendingRegistrations.length, icon: HiClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Pending Verification', value: verifications.filter((v) => v.status === 'pending').length, icon: HiBadgeCheck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'In Onboarding', value: onboarding.filter((o) => o.status === 'in-progress').length, icon: HiAcademicCap, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Pending Documents', value: documents.filter((d) => d.status === 'pending').length, icon: HiDocumentText, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  ];

  const handleVerify = (id) => {
    setVerifications((prev) => prev.map((v) => (v.id === id ? { ...v, status: 'verified' } : v)));
    toast.success('Verification approved');
  };

  const handleApproveReg = (id) => {
    approveRegistration(id);
    toast.success('Registration approved');
  };

  const handleRejectReg = (id) => {
    rejectRegistration(id);
    toast.success('Registration rejected');
  };

  const handleSignDoc = (id) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'signed' } : d)));
    toast.success('Document signed');
  };

  const renderContent = () => {
    if (active === 'joiners') {
      return (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Joiners</h2>
            <div className="space-y-3">
              {joiners.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors">
                  <Avatar name={u.name} src={u.avatar} size="lg" status={u.status} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{u.title} — {u.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-slate-400">Joined</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{fmtDate(u.joined)}</p>
                  </div>
                  {isNewEmployee(u) && <Badge variant="success" size="sm">New</Badge>}
                </div>
              ))}
            </div>
          </Card>
          {recentJoiners.length > 0 && (
            <Card className="p-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Recent Hires (90 days)</h2>
              <div className="flex flex-wrap gap-2">
                {recentJoiners.map((u) => <Badge key={u.id} variant="primary" size="md">{u.name} · {u.department}</Badge>)}
              </div>
            </Card>
          )}
        </div>
      );
    }

    if (active === 'approvals') {
      const pendingList = pendingRegistrations.length > 0
        ? pendingRegistrations
        : [
            { id: 'pr-demo-1', name: 'Noah Williams', email: 'noah@connectly.com', role: 'employee', department: 'Engineering', submittedAt: '2026-07-31T10:00:00.000Z', status: 'pending' },
            { id: 'pr-demo-2', name: 'Olivia Martinez', email: 'olivia@connectly.com', role: 'employee', department: 'Design', submittedAt: '2026-07-31T12:30:00.000Z', status: 'pending' },
            { id: 'pr-demo-3', name: 'Ethan Johnson', email: 'ethan@connectly.com', role: 'manager', department: 'Sales', submittedAt: '2026-08-01T09:15:00.000Z', status: 'pending' },
          ];
      return (
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Approval Requests</h2>
          <div className="space-y-3">
            {pendingList.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Avatar name={r.name} size="lg" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{r.email} · {r.department}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="info" size="xs">{r.role}</Badge>
                      <Badge variant="warning" size="xs">{r.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="success" size="sm" icon={HiCheckCircle} onClick={() => handleApproveReg(r.id)}>Approve</Button>
                  <Button variant="danger" size="sm" icon={HiXCircle} onClick={() => handleRejectReg(r.id)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (active === 'verification') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Verification</h2>
            <Badge variant="info" size="sm">{verifications.filter((v) => v.status === 'verified').length} verified</Badge>
          </div>
          <div className="space-y-3">
            {verifications.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Avatar name={v.name} size="md" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{v.name} — {v.position}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{v.document} · Submitted {fmtDate(v.submitted)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={v.status === 'verified' ? 'success' : 'warning'} size="sm">{v.status}</Badge>
                  {v.status === 'pending' && (
                    <Button variant="success" size="xs" icon={HiBadgeCheck} onClick={() => handleVerify(v.id)}>Verify</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (active === 'onboarding') {
      return (
        <div className="space-y-4">
          {onboarding.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={o.name} size="lg" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{o.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{o.role} — {o.department}</p>
                  </div>
                </div>
                <Badge variant={o.status === 'completed' ? 'success' : 'warning'} size="sm">{o.status}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {o.steps.map((step, i) => {
                  const done = o.progress >= ((i + 1) / o.steps.length) * 100;
                  return (
                    <div key={step} className="flex-1">
                      <div className={`h-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                      <p className={`text-[10px] mt-1 ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>{step}</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <ProgressBar value={o.progress} variant={o.progress >= 100 ? 'success' : 'info'} showLabel />
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'orientation') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orientation.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                <HiCalendar className="w-4 h-4" /> {fmtDate(o.date)}
              </div>
              <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">{o.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{o.facilitator}</p>
              <div className="flex items-center justify-between mt-4 text-sm">
                <Badge variant="info" size="xs"><HiBriefcase className="w-3 h-3 mr-0.5" /> {o.room}</Badge>
                <Badge variant="primary" size="xs">{o.attendees} attendees</Badge>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <Card className="p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Documents</h2>
        <div className="space-y-3">
          {documents.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  <HiDocumentText className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{d.type}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{d.employee} · {fmtDate(d.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={d.status === 'signed' ? 'success' : 'warning'} size="sm">{d.status}</Badge>
                {d.status === 'pending' && (
                  <Button variant="success" size="xs" icon={HiBadgeCheck} onClick={() => handleSignDoc(d.id)}>Mark Signed</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Recruitment & Onboarding - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment & Onboarding</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Manage joiners, approvals, verification, and onboarding</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`inline-flex p-2 rounded-xl ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">{s.label}</p>
          </Card>
        ))}
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
