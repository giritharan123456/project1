import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers, HiFolder, HiChat, HiVideoCamera,
  HiPlusCircle, HiViewGrid, HiChevronRight,
  HiSearch, HiFilter, HiClock,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import ActivityFeed from '../../components/common/ActivityFeed';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function EmployeeCollaborationPage() {
  const { user } = useAuth();
  const { users, activityLog } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const teamMembers = useMemo(() => {
    return users.filter(u => u.id !== user?.id).slice(0, 8).map(u => ({
      id: u.id,
      name: u.name,
      status: u.status === 'online' ? 'online' : u.status === 'away' ? 'away' : 'busy',
      role: u.title || u.role,
      department: u.department,
    }));
  }, [users, user]);

  const departments = useMemo(() => {
    const deptSet = new Set(users.map(u => u.department).filter(Boolean));
    return Array.from(deptSet).map(dept => ({
      name: dept,
      count: users.filter(u => u.department === dept).length,
    }));
  }, [users]);

  const onlineUsers = useMemo(() => {
    return users.filter(u => u.status === 'online').slice(0, 10);
  }, [users]);

  return (
    <>
      <Helmet>
        <title>Collaboration - Employee Dashboard - AdzConnect</title>
        <meta name="description" content="Collaborate with your team through shared workspaces and activity feeds." />
      </Helmet>
      <ErrorBoundary title="Collaboration Error" message="Failed to load collaboration workspace. Please try again.">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-6 p-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collaboration</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Shared workspaces, team collaboration, and activity feeds</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Team Members', value: users.length - 1, icon: HiUsers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', to: '/app/team' },
            { label: 'Online Now', value: onlineUsers.length, icon: HiVideoCamera, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', to: '/app/team' },
            { label: 'Departments', value: departments.length, icon: HiFolder, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', to: '/app/team' },
            { label: 'Activity Items', value: activityLog.length, icon: HiClock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', to: '/app/meeting-history' },
          ].map((stat) => (
            <Card key={stat.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(stat.to)}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</p>
                </div>
                <HiChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 ml-auto" />
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiUsers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Collaboration</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/app/team?user=${member.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-slate-400">
                      {member.name.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${member.status === 'online' ? 'bg-emerald-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{member.role}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{member.department}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiFolder className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shared Workspace</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Project Files', desc: 'Shared project documents', icon: HiFolder, count: 12, to: '/app/files' },
              { label: 'Team Resources', desc: 'Team shared resources', icon: HiFolder, count: 8, to: '/app/files' },
              { label: 'Meeting Notes', desc: 'Collaborative meeting notes', icon: HiFolder, count: 5, to: '/app/meeting-notes' },
              { label: 'Templates', desc: 'Reusable templates', icon: HiFolder, count: 3, to: '/app/schedule' },
              { label: 'Reports', desc: 'Shared reports', icon: HiFolder, count: 7, to: '/app/analytics/personal' },
              { label: 'Announcements', desc: 'Team announcements', icon: HiFolder, count: 4, to: '/app/announcements' },
            ].map((ws) => (
              <Card key={ws.label} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(ws.to)}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400">
                    <ws.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ws.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{ws.desc}</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{ws.count} items</p>
                  </div>
                  <HiChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-3">
            <HiChat className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Feed</h2>
          </div>
          <ActivityFeed />
        </motion.div>
      </motion.div>
      </ErrorBoundary>
    </>
  );
}