import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  HiUsers, HiUserGroup, HiUserAdd, HiOfficeBuilding, HiSearch,
  HiBadgeCheck, HiXCircle, HiMail, HiPhone, HiLocationMarker, HiClock,
  HiBriefcase, HiChip, HiDownload, HiUser,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import HRSectionTabs from '../../components/hr/HRSectionTabs';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import useHRTab from '../../hooks/useHRTab';
import { exportToCSV } from '../../utils/export';
import { isActiveEmployee, isNewEmployee, groupBy, deptColor, ROLE_BADGE, fmtDate } from '../../utils/hrPeople';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_VARIANT = { online: 'success', away: 'warning', offline: 'danger' };

export default function HREmployeeDirectory() {
  const { users } = useApp();
  const { user: me } = useAuth();
  const [active, setActive] = useHRTab('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const employees = useMemo(() => users, [users]);

  const total = employees.length;
  const activeCount = employees.filter(isActiveEmployee).length;
  const inactiveCount = total - activeCount;
  const newCount = employees.filter((u) => isNewEmployee(u)).length;
  const deptCount = new Set(employees.map((u) => u.department).filter(Boolean)).size;

  const tabs = [
    { key: 'all', label: 'All Employees', icon: HiUsers },
    { key: 'departments', label: 'Departments', icon: HiOfficeBuilding },
    { key: 'teams', label: 'Teams', icon: HiUserGroup },
    { key: 'profiles', label: 'Employee Profiles', icon: HiUser },
    { key: 'new', label: 'New Employees', icon: HiUserAdd },
    { key: 'active', label: 'Active Employees', icon: HiBadgeCheck },
    { key: 'inactive', label: 'Inactive Employees', icon: HiXCircle },
    { key: 'search', label: 'Search Employees', icon: HiSearch },
  ];

  const stats = [
    { label: 'Total Employees', value: total, icon: HiUsers, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-500/10' },
    { label: 'Active', value: activeCount, icon: HiBadgeCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Inactive', value: inactiveCount, icon: HiXCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { label: 'New (90d)', value: newCount, icon: HiUserAdd, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Departments', value: deptCount, icon: HiOfficeBuilding, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  ];

  const deptData = useMemo(() => {
    const groups = groupBy(employees, (u) => u.department || 'General');
    return Object.entries(groups)
      .map(([name, list]) => ({ name, count: list.length, active: list.filter(isActiveEmployee).length, users: list }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const teamData = useMemo(() => {
    const groups = groupBy(employees, (u) => u.department || 'General');
    return Object.entries(groups).map(([name, list]) => ({ department: name, members: list }));
  }, [employees]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((u) =>
      [u.name, u.title, u.department, u.email, u.location, (u.skills || []).join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [employees, search]);

  const renderEmployeeCard = (u) => (
    <Card key={u.id} hover onClick={() => setSelected(u)} className="p-5">
      <div className="flex items-start justify-between">
        <Avatar name={u.name} src={u.avatar} size="lg" status={u.status} />
        <Badge variant={STATUS_VARIANT[u.status] || 'default'} dot size="sm">{u.status || 'unknown'}</Badge>
      </div>
      <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{u.name}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400">{u.title}</p>
      <div className="flex items-center justify-between mt-2">
        <Badge variant="primary" size="xs">{u.department || 'General'}</Badge>
        <Badge variant="info" size="xs">{ROLE_BADGE[u.role]?.label || u.role}</Badge>
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 dark:text-slate-400">
        <HiLocationMarker className="w-3.5 h-3.5" /> {u.location || '—'}
      </div>
      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-slate-400">
        <HiClock className="w-3.5 h-3.5" /> Joined {fmtDate(u.joined)}
      </div>
    </Card>
  );

  const renderContent = () => {
    if (active === 'all') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map(renderEmployeeCard)}
        </div>
      );
    }

    if (active === 'departments') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deptData.map((d, i) => (
            <Card key={d.name} className="p-5">
              <div className={`w-10 h-10 rounded-xl ${deptColor(i)} flex items-center justify-center text-white`}>
                <HiOfficeBuilding className="w-5 h-5" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{d.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{d.count} employees · {d.active} active</p>
              <div className="mt-3 flex -space-x-2">
                {d.users.slice(0, 6).map((u) => (
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

    if (active === 'teams') {
      return (
        <div className="space-y-4">
          {teamData.map((team, i) => (
            <Card key={team.department} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${deptColor(i)} flex items-center justify-center text-white`}>
                    <HiUserGroup className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{team.department} Team</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{team.members.length} members</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {team.members.map((u) => (
                  <div key={u.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer" onClick={() => setSelected(u)}>
                    <Avatar name={u.name} size="sm" status={u.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{u.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'profiles') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((u) => (
            <Card key={u.id} hover onClick={() => setSelected(u)} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={u.name} src={u.avatar} size="lg" status={u.status} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{u.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{u.title}</p>
                  <Badge variant="info" size="xs" className="mt-1">{ROLE_BADGE[u.role]?.label || u.role}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-gray-600 dark:text-slate-400">
                <p className="flex items-center gap-2"><HiMail className="w-4 h-4 text-gray-400" />{u.email}</p>
                <p className="flex items-center gap-2"><HiPhone className="w-4 h-4 text-gray-400" />{u.phone || '—'}</p>
                <p className="flex items-center gap-2"><HiLocationMarker className="w-4 h-4 text-gray-400" />{u.location || '—'}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {(u.skills || []).slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">{s}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'new') {
      const newJoiners = employees.filter((u) => isNewEmployee(u)).sort((a, b) => new Date(b.joined) - new Date(a.joined));
      return (
        <div className="space-y-3">
          {newJoiners.length === 0 ? (
            <Card className="p-8 text-center">
              <HiUserAdd className="w-10 h-10 mx-auto text-gray-300 dark:text-slate-600" />
              <p className="mt-3 font-medium text-gray-900 dark:text-white">No new employees in the last 90 days</p>
            </Card>
          ) : newJoiners.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-center gap-4">
                <Avatar name={u.name} src={u.avatar} size="lg" status={u.status} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{u.title} — {u.department}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-slate-400">
                    <HiClock className="w-3.5 h-3.5" /> Joined {fmtDate(u.joined)}
                  </div>
                </div>
                <Badge variant="success" size="sm">New Hire</Badge>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (active === 'active') {
      const list = employees.filter(isActiveEmployee);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(renderEmployeeCard)}
        </div>
      );
    }

    if (active === 'inactive') {
      const list = employees.filter((u) => !isActiveEmployee(u));
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(renderEmployeeCard)}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, role, department, skill, or location..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </Card>
        <p className="text-sm text-gray-500 dark:text-slate-400">{searchResults.length} result{searchResults.length === 1 ? '' : 's'}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {searchResults.map(renderEmployeeCard)}
        </div>
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Employee Directory - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Directory</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage employees, teams, departments, and profiles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" icon={HiUserAdd} onClick={() => setSelected(me)}>View My Profile</Button>
          <Button variant="outline" size="sm" icon={HiDownload} onClick={() => exportToCSV(employees, 'employee-directory.csv')}>Export</Button>
        </div>
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

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Employee Profile'} size="md">
        {selected && (
          <div>
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} src={selected.avatar} size="xl" status={selected.status} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selected.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="info" size="xs">{ROLE_BADGE[selected.role]?.label || selected.role}</Badge>
                  <Badge variant="primary" size="xs">{selected.department}</Badge>
                  <Badge variant={STATUS_VARIANT[selected.status] || 'default'} dot size="xs">{selected.status}</Badge>
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiMail className="w-4 h-4 text-gray-400" /> {selected.email}
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiPhone className="w-4 h-4 text-gray-400" /> {selected.phone || '—'}
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiLocationMarker className="w-4 h-4 text-gray-400" /> {selected.location || '—'}
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiClock className="w-4 h-4 text-gray-400" /> {selected.timezone || '—'}
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiBriefcase className="w-4 h-4 text-gray-400" /> Joined {fmtDate(selected.joined)}
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <HiChip className="w-4 h-4 text-gray-400" /> {selected.meetingsHosted || 0} hosted · {selected.meetingsAttended || 0} attended
              </div>
            </div>
            {selected.bio && <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">{selected.bio}</p>}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(selected.skills || []).map((s) => (
                  <span key={s} className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
