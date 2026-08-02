import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiOfficeBuilding, HiUserGroup, HiUser, HiUsers, HiChartSquareBar,
  HiDownload,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import useHRTab from '../../hooks/useHRTab';
import { exportToCSV } from '../../utils/export';
import { groupBy, deptColor, ROLE_BADGE, isActiveEmployee } from '../../utils/hrPeople';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const LEAD_ROLES = ['manager', 'admin', 'executive', 'ceo', 'hr'];

export default function HRTeamManagement() {
  const { users } = useApp();
  const [active, setActive] = useHRTab('departments');

  const members = useMemo(() => users, [users]);
  const managers = useMemo(() => members.filter((u) => LEAD_ROLES.includes(u.role)), [members]);

  const departmentData = useMemo(() => {
    const groups = groupBy(members, (u) => u.department || 'General');
    return Object.entries(groups)
      .map(([name, list]) => {
        const manager = list.find((u) => LEAD_ROLES.includes(u.role));
        return { name, count: list.length, active: list.filter(isActiveEmployee).length, manager: manager?.name || '—', list };
      })
      .sort((a, b) => b.count - a.count);
  }, [members]);

  const reporting = useMemo(() => {
    const rows = [];
    departmentData.forEach((d) => {
      if (d.manager === '—') return;
      d.list.forEach((u) => {
        if (u.name === d.manager) return;
        rows.push({ department: d.name, manager: d.manager, report: u.name, role: ROLE_BADGE[u.role]?.label || u.role });
      });
    });
    return rows;
  }, [departmentData]);

  const tabs = [
    { key: 'departments', label: 'Departments', icon: HiOfficeBuilding },
    { key: 'members', label: 'Members', icon: HiUserGroup },
    { key: 'managers', label: 'Managers', icon: HiUser },
    { key: 'reporting', label: 'Reporting Lines', icon: HiUsers },
    { key: 'hierarchy', label: 'Org Hierarchy', icon: HiChartSquareBar },
  ];

  const renderContent = () => {
    if (active === 'departments') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentData.map((d, i) => (
            <Card key={d.name} className="p-5">
              <div className={`w-10 h-10 rounded-xl ${deptColor(i)} flex items-center justify-center text-white`}>
                <HiOfficeBuilding className="w-5 h-5" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{d.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{d.count} members · {d.active} active</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                <span className="text-sm text-gray-500 dark:text-slate-400">Manager</span>
                <Badge variant="primary" size="xs">{d.manager}</Badge>
              </div>
              <div className="mt-3 flex -space-x-2">
                {d.list.slice(0, 6).map((u) => (
                  <div key={u.id} className="rounded-full ring-2 ring-white dark:ring-slate-800">
                    <Avatar name={u.name} size="xs" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'members') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Members</h2>
            <Badge variant="primary" size="sm">{members.length} total</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                <Avatar name={u.name} src={u.avatar} size="md" status={u.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.title}</p>
                  <div className="flex gap-1.5 mt-1">
                    <Badge variant="primary" size="xs">{u.department}</Badge>
                    <Badge variant="info" size="xs">{ROLE_BADGE[u.role]?.label || u.role}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (active === 'managers') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managers.map((u) => (
            <Card key={u.id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} src={u.avatar} size="lg" status={u.status} />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{u.title}</p>
                  <Badge variant="info" size="xs" className="mt-1">{ROLE_BADGE[u.role]?.label || u.role}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-slate-400">
                <p>Department: {u.department}</p>
                <p>Reports: {departmentData.find((d) => d.manager === u.name)?.count || 0} members</p>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'reporting') {
      return (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reporting Lines</h2>
            <Button variant="outline" size="sm" icon={HiDownload} onClick={() => exportToCSV(reporting, 'reporting-lines.csv')}>Export</Button>
          </div>
          <div className="space-y-4">
            {departmentData.filter((d) => d.manager !== '—').map((d) => (
              <div key={d.name}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="primary" size="sm">{d.name}</Badge>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">→ {d.manager}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.list.filter((u) => u.name !== d.manager).map((u) => (
                    <span key={u.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                      {u.name} <span className="text-gray-400">({ROLE_BADGE[u.role]?.label || u.role})</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      );
    }

    const levels = [
      { label: 'Executive Leadership', color: 'border-rose-300 dark:border-rose-800', users: members.filter((u) => ['ceo', 'admin', 'executive'].includes(u.role)) },
      { label: 'Managers & Leads', color: 'border-amber-300 dark:border-amber-800', users: members.filter((u) => ['manager', 'hr'].includes(u.role)) },
      { label: 'Team Members', color: 'border-teal-300 dark:border-teal-800', users: members.filter((u) => !LEAD_ROLES.includes(u.role)) },
    ];

    return (
      <div className="space-y-4">
        {levels.map((level) => (
          <Card key={level.label} className={`p-5 border-l-4 ${level.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">{level.label}</h3>
              <Badge variant="primary" size="sm">{level.users.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {level.users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/30">
                  <Avatar name={u.name} src={u.avatar} size="sm" status={u.status} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{u.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Team Management - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Departments, members, managers, and reporting structure</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Total Members</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-violet-600">{departmentData.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Departments</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{managers.length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Managers & Leads</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-teal-600">{members.filter(isActiveEmployee).length}</p><p className="text-sm text-gray-500 dark:text-slate-400">Active Members</p></Card>
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
