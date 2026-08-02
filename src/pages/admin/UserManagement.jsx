import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiPlus, HiPencil, HiCheck, HiBan, HiUserGroup, HiShieldCheck, HiOfficeBuilding, HiExclamationCircle, HiKey } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { useApp } from '../../context/AppContext';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const allRoles = ['all', 'employee', 'host', 'admin', 'hr', 'manager', 'executive', 'ceo'];

const isAccountActive = (u) => u.status !== 'inactive' && u.status !== 'offline';

const roleColorMap = {
  admin: 'primary',
  hr: 'info',
  manager: 'warning',
  executive: 'gradient-amber',
  ceo: 'gradient',
  host: 'gradient-emerald',
  employee: 'default',
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function UserManagement() {
  const { users, setUsers, broadcastNotification } = useApp();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [resetPwdUser, setResetPwdUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'employee', department: '' });
  const [newPassword, setNewPassword] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => isAccountActive(u)).length;
    const pending = users.filter((u) => !isAccountActive(u)).length;
    const byRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});
    return { total, active, pending, byRole };
  }, [users]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const handleBulkAction = (status) => {
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
    });
    toast.success(`${selectedIds.size} user(s) ${status === 'active' ? 'activated' : 'deactivated'}`);
    broadcastNotification?.({ title: 'Bulk Action', message: `${selectedIds.size} user(s) ${status === 'active' ? 'activated' : 'deactivated'}`, type: status === 'active' ? 'success' : 'error', sender: 'Admin', senderRole: 'admin', targetRoles: ['admin'] });
    setSelectedIds(new Set());
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) { toast.error('Name and email are required'); return; }
    const id = `u${Date.now()}`;
    setUsers((prev) => [...prev, { id, ...newUser, status: 'active', avatar: '', title: '' }]);
    setNewUser({ name: '', email: '', role: 'employee', department: '' });
    setShowAddModal(false);
    toast.success(`${newUser.name} added`);
    broadcastNotification?.({ title: 'User Added', message: `${newUser.name} has been added`, type: 'success', sender: 'Admin', senderRole: 'admin', targetRoles: ['admin'] });
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
    toast.success('User updated');
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    const newStatus = action === 'deactivate' ? 'inactive' : 'active';
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
    toast.success(`User ${action === 'deactivate' ? 'deactivated' : 'activated'}`);
    broadcastNotification?.({ title: `User ${action === 'deactivate' ? 'Deactivated' : 'Activated'}`, message: `User has been ${action === 'deactivate' ? 'deactivated' : 'activated'}`, type: action === 'deactivate' ? 'warning' : 'success', sender: 'Admin', senderRole: 'admin', targetRoles: ['admin'] });
    setConfirmAction(null);
  };

  const handleResetPassword = () => {
    if (!resetPwdUser || !newPassword.trim()) { toast.error('Please enter a new password'); return; }
    localStorage.setItem(`connectly-reset-pw-${resetPwdUser.id}`, newPassword);
    toast.success(`Password reset for ${resetPwdUser.name}`);
    broadcastNotification?.({ title: 'Password Reset', message: `Password reset for ${resetPwdUser.name}`, type: 'info', sender: 'Admin', senderRole: 'admin', targetRoles: ['admin'] });
    setResetPwdUser(null);
    setNewPassword('');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>User Management - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage users, roles, and account status</p>
        </div>
        <Button variant="primary" icon={HiPlus} onClick={() => setShowAddModal(true)}>Add User</Button>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><HiUserGroup className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><HiShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Active Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><HiExclamationCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Inactive Accounts</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><HiOfficeBuilding className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.byRole).length}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Roles Present</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {allRoles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                roleFilter === r
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
          >
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{selectedIds.size} selected</span>
            <div className="flex-1" />
            <Button variant="success" size="xs" icon={HiCheck} onClick={() => handleBulkAction('active')}>Activate</Button>
            <Button variant="danger" size="xs" icon={HiBan} onClick={() => handleBulkAction('inactive')}>Deactivate</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">User</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Email</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Role</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Department</th>
                <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Status</th>
                <th className="p-4 text-right font-semibold text-gray-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 dark:text-slate-500">{user.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-slate-400">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={roleColorMap[user.role] || 'default'} size="sm" pill>{user.role}</Badge>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-slate-400">{user.department}</td>
                  <td className="p-4">
                    <Badge variant={isAccountActive(user) ? 'success' : 'danger'} size="sm" dot>
                      {isAccountActive(user) ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="xs" icon={HiPencil} onClick={() => setEditingUser({ ...user })}>Edit</Button>
                      <Button variant="ghost" size="xs" icon={HiKey} onClick={() => setResetPwdUser(user)}>Reset Pwd</Button>
                      {isAccountActive(user) ? (
                        <Button variant="ghost" size="xs" icon={HiBan} onClick={() => setConfirmAction({ id: user.id, action: 'deactivate' })}>Deactivate</Button>
                      ) : (
                        <Button variant="ghost" size="xs" icon={HiCheck} onClick={() => setConfirmAction({ id: user.id, action: 'activate' })}>Activate</Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 dark:text-slate-500">
                    <HiUserGroup className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" icon={HiPlus} onClick={handleAddUser}>Add User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Jane Doe" />
          <Input label="Email Address" type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} placeholder="jane.doe@company.com" />
          <Select label="Role" value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
            options={[
              { value: 'employee', label: 'Employee' },
              { value: 'host', label: 'Host' },
              { value: 'admin', label: 'Admin' },
              { value: 'hr', label: 'HR' },
              { value: 'manager', label: 'Manager' },
              { value: 'executive', label: 'Executive' },
              { value: 'ceo', label: 'CEO' },
            ]}
          />
          <Input label="Department" value={newUser.department} onChange={(e) => setNewUser((p) => ({ ...p, department: e.target.value }))} placeholder="e.g. Engineering" />
        </div>
      </Modal>

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button variant="primary" icon={HiPencil} onClick={handleEditUser}>Save Changes</Button>
          </>
        }
      >
        {editingUser && (
          <div className="space-y-4">
            <Input label="Full Name" value={editingUser.name} onChange={(e) => setEditingUser((p) => ({ ...p, name: e.target.value }))} />
            <Input label="Email Address" type="email" value={editingUser.email} onChange={(e) => setEditingUser((p) => ({ ...p, email: e.target.value }))} />
            <Select label="Role" value={editingUser.role} onChange={(e) => setEditingUser((p) => ({ ...p, role: e.target.value }))}
              options={[
                { value: 'employee', label: 'Employee' },
                { value: 'host', label: 'Host' },
                { value: 'admin', label: 'Admin' },
                { value: 'hr', label: 'HR' },
                { value: 'manager', label: 'Manager' },
                { value: 'executive', label: 'Executive' },
                { value: 'ceo', label: 'CEO' },
              ]}
            />
            <Input label="Department" value={editingUser.department} onChange={(e) => setEditingUser((p) => ({ ...p, department: e.target.value }))} />
          </div>
        )}
      </Modal>

      <Modal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} title={confirmAction?.action === 'deactivate' ? 'Deactivate User' : 'Activate User'} size="sm" variant="glass"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button variant={confirmAction?.action === 'deactivate' ? 'danger' : 'success'} icon={confirmAction?.action === 'deactivate' ? HiBan : HiCheck} onClick={handleConfirmAction}>
              {confirmAction?.action === 'deactivate' ? 'Deactivate' : 'Activate'}
            </Button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-slate-400">
          Are you sure you want to <strong>{confirmAction?.action}</strong> this user?
        </p>
      </Modal>

      <Modal isOpen={!!resetPwdUser} onClose={() => { setResetPwdUser(null); setNewPassword(''); }} title="Reset Password" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setResetPwdUser(null); setNewPassword(''); }}>Cancel</Button>
            <Button variant="primary" icon={HiKey} onClick={handleResetPassword}>Set Password</Button>
          </>
        }
      >
        {resetPwdUser && (
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-slate-400">Set a new password for:</p>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30">
              <p className="font-medium text-gray-900 dark:text-white">{resetPwdUser.name}</p>
              <p className="text-sm text-gray-500 dark:text-slate-400">{resetPwdUser.email}</p>
            </div>
            <Input label="New Password" type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password" />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
