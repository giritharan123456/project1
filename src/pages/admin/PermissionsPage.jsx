import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';

const roles = ['employee', 'host', 'admin', 'hr', 'manager', 'executive', 'ceo'];

const permissions = [
  { name: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete user accounts' },
  { name: 'manage_roles', label: 'Manage Roles', description: 'Assign and change user roles' },
  { name: 'manage_meetings', label: 'Manage Meetings', description: 'Create, edit, and delete meetings' },
  { name: 'manage_departments', label: 'Manage Departments', description: 'Create and organize departments' },
  { name: 'view_reports', label: 'View Reports', description: 'Access all reports and analytics' },
  { name: 'configure_platform', label: 'Configure Platform', description: 'Change platform settings' },
  { name: 'view_audit_logs', label: 'View Audit Logs', description: 'Access security audit trail' },
  { name: 'manage_permissions', label: 'Manage Permissions', description: 'Configure role-based permissions' },
];

const DEFAULT_PERMISSIONS = {
  admin: ['manage_users', 'manage_roles', 'manage_meetings', 'manage_departments', 'view_reports', 'configure_platform', 'view_audit_logs', 'manage_permissions'],
  hr: ['view_reports', 'manage_users', 'manage_departments'],
  manager: ['manage_meetings', 'manage_departments', 'view_reports'],
  executive: ['view_reports', 'view_audit_logs'],
  ceo: ['view_reports', 'view_audit_logs', 'configure_platform'],
  host: ['manage_meetings'],
  employee: [],
};

const STORAGE_KEY = 'connectly-permissions';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [rolePermissions, setRolePermissions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PERMISSIONS, ...parsed };
      }
    } catch {
      // fall back to defaults on corrupted storage
    }
    return DEFAULT_PERMISSIONS;
  });

  const togglePermission = (perm) => {
    const enabled = !rolePermissions[selectedRole].includes(perm);
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: enabled
        ? [...prev[selectedRole], perm]
        : prev[selectedRole].filter(p => p !== perm),
    }));
    toast.success(`${perm} ${enabled ? 'granted to' : 'revoked from'} ${selectedRole}`);
  };

  const grantAll = () => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: [...new Set([...prev[selectedRole], ...permissions.map(p => p.name)])],
    }));
    toast.success(`All permissions granted to ${selectedRole}`);
  };

  const revokeAll = () => {
    setRolePermissions(prev => ({ ...prev, [selectedRole]: [] }));
    toast.success(`All permissions revoked from ${selectedRole}`);
  };

  const toggleBulkSelect = (perm) => {
    setSelectedPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const bulkGrant = () => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: [...new Set([...prev[selectedRole], ...selectedPerms])],
    }));
    toast.success(`${selectedPerms.length} permissions granted to ${selectedRole}`);
    setSelectedPerms([]);
  };

  const bulkRevoke = () => {
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole]: prev[selectedRole].filter(p => !selectedPerms.includes(p)),
    }));
    toast.success(`${selectedPerms.length} permissions revoked from ${selectedRole}`);
    setSelectedPerms([]);
  };

  const savePermissions = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rolePermissions));
    toast.success('Permissions saved');
  };

  const resetPermissions = () => {
    setRolePermissions(DEFAULT_PERMISSIONS);
    toast.success('Permissions reset to defaults');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Permissions - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permission Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Configure role-based permissions across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={resetPermissions}>Reset</Button>
          <Button variant="primary" size="sm" onClick={savePermissions}>Save changes</Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {roles.map((r) => (
          <button key={r} onClick={() => setSelectedRole(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${selectedRole === r ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}>
            {r}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{selectedRole} Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{rolePermissions[selectedRole].length} of {permissions.length} permissions granted</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="success" onClick={grantAll}>Grant All</Button>
            <Button size="xs" variant="danger" onClick={revokeAll}>Revoke All</Button>
          </div>
        </div>
        {selectedPerms.length > 0 && (
          <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/10 border-b border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <span className="text-xs text-primary-700 dark:text-primary-300">{selectedPerms.length} selected</span>
            <Button size="xs" variant="success" onClick={bulkGrant}>Grant Selected</Button>
            <Button size="xs" variant="danger" onClick={bulkRevoke}>Revoke Selected</Button>
            <Button size="xs" variant="ghost" onClick={() => setSelectedPerms([])}>Clear</Button>
          </div>
        )}
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {permissions.map((perm) => {
            const enabled = rolePermissions[selectedRole].includes(perm.name);
            const isSelected = selectedPerms.includes(perm.name);
            return (
              <div key={perm.name} className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${isSelected ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleBulkSelect(perm.name)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                    aria-label={`Select ${perm.label}`}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{perm.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{perm.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600'}`} />
                  <button onClick={() => togglePermission(perm.name)}
                    className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'}`}
                    aria-label={`${enabled ? 'Revoke' : 'Grant'} ${perm.label}`}
                    aria-pressed={enabled}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5 ml-1' : 'translate-x-1 ml-1'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}