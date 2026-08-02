import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  HiSearch, HiMail, HiUserAdd, HiOfficeBuilding,
  HiLocationMarker, HiPhone, HiCalendar, HiStar,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Design', 'Executive'];

const statusConfig = {
  online: { label: 'Online', color: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  away: { label: 'Away', color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300' },
  offline: { label: 'Offline', color: 'bg-gray-400', bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-400' },
};

export default function TeamDirectoryPage() {
  const { users, setUsers } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    const userId = searchParams.get('user');
    if (!userId) return;
    const found = users.find((u) => u.id === userId);
    if (found) {
      setSelectedUser(found);
      setSearch('');
      setStatusFilter('All');
      setDepartmentFilter('All');
      searchParams.delete('user');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, users, setSearchParams]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'All' && u.status !== statusFilter.toLowerCase()) return false;
      if (departmentFilter !== 'All' && u.department !== departmentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.title.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
      }
      return true;
    });
  }, [users, search, statusFilter, departmentFilter]);

  const handleInvite = () => {
    const email = inviteEmail.trim();
    if (email) {
      const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      setUsers((prev) => [
        {
          id: `u${Date.now()}`,
          name,
          email,
          title: 'Team Member',
          department: 'General',
          role: 'employee',
          status: 'offline',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          joined: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
      setShowInviteModal(false);
      setInviteEmail('');
      toast.success(`Invitation sent to ${email}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Helmet>
        <title>Team Directory - AdzConnect</title>
        <meta name="description" content="Browse the AdzConnect team directory to find colleagues, view profiles, and connect with team members." />
      </Helmet>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Directory</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{users.length} team members</p>
        </div>
        <Button icon={HiUserAdd} onClick={() => setShowInviteModal(true)}>Invite User</Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, title, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Online', 'Offline', 'Away'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                statusFilter === s
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {departments.map((d) => (
          <button
            key={d}
            onClick={() => setDepartmentFilter(d)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              departmentFilter === d
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map((user) => {
          const cfg = statusConfig[user.status] || statusConfig.offline;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
            >
              <Card hover onClick={() => setSelectedUser(user)} className="h-full">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <Avatar src={user.avatar} name={user.name} size="2xl" />
                    <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${cfg.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{user.title}</p>
                  <div className="mt-2">
                    <Badge variant="primary" size="sm">{user.department}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
                    <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                    <HiMail className="w-3.5 h-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <HiSearch className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400">No team members found matching your filters</p>
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('All'); setDepartmentFilter('All'); }} className="mt-2">
            Clear filters
          </Button>
        </div>
      )}

      {/* User Profile Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Profile"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={selectedUser.avatar} name={selectedUser.name} size="xl" status={selectedUser.status} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selectedUser.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="sm">{selectedUser.department}</Badge>
                  <Badge variant={selectedUser.status === 'online' ? 'success' : selectedUser.status === 'away' ? 'warning' : 'default'} size="sm" dot>
                    {statusConfig[selectedUser.status]?.label}
                  </Badge>
                </div>
              </div>
            </div>

            {selectedUser.bio && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bio</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selectedUser.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <HiMail className="w-4 h-4 text-gray-400" />
                <span>{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <HiPhone className="w-4 h-4 text-gray-400" />
                  <span>{selectedUser.phone}</span>
                </div>
              )}
              {selectedUser.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <HiLocationMarker className="w-4 h-4 text-gray-400" />
                  <span>{selectedUser.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <HiOfficeBuilding className="w-4 h-4 text-gray-400" />
                <span>{selectedUser.department}</span>
              </div>
              {selectedUser.timezone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                  <HiCalendar className="w-4 h-4 text-gray-400" />
                  <span>{selectedUser.timezone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <HiStar className="w-4 h-4 text-gray-400" />
                <span>Joined {new Date(selectedUser.joined + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {selectedUser.skills && selectedUser.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills.map((skill) => (
                    <Badge key={skill} variant="info" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.meetingsHosted}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Meetings Hosted</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.meetingsAttended}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Meetings Attended</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => { setShowInviteModal(false); setInviteEmail(''); }}
        title="Invite User"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}>Cancel</Button>
            <Button icon={HiUserAdd} onClick={handleInvite} disabled={!inviteEmail.trim()}>Send Invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="text-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
            <HiMail className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-slate-300">Send an invitation email to a new team member</p>
          </div>
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            icon={HiMail}
            autoFocus
          />
        </div>
      </Modal>
    </motion.div>
  );
}
