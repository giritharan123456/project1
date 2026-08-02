import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOfficeBuilding, HiPlus, HiTrash, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const STORAGE_KEY = 'connectly-departments';

const deriveDepartments = (users) => {
  const map = {};
  users.forEach((u) => {
    const name = u.department || 'General';
    if (!map[name]) {
      map[name] = { name, manager: u.name, managerRole: u.role, headcount: 1, joined: u.joined };
    } else {
      map[name].headcount += 1;
      if (map[name].managerRole === 'employee' && u.role !== 'employee') {
        map[name].manager = u.name;
        map[name].managerRole = u.role;
      }
    }
  });
  return Object.values(map).map((d) => ({
    id: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: d.name,
    headcount: d.headcount,
    manager: d.manager,
    status: 'active',
    created: d.joined ? d.joined.slice(0, 10) : '2025-01-15',
  }));
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function DepartmentManagement() {
  const { users } = useApp();
  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore corrupted storage
    }
    return deriveDepartments(users);
  });
  const [showAdd, setShowAdd] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', manager: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', manager: '' });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(departments));
    } catch {
      // ignore storage write failures
    }
  }, [departments]);

  const addDept = () => {
    if (!newDept.name.trim() || !newDept.manager.trim()) { toast.error('All fields required'); return; }
    setDepartments((prev) => [...prev, { id: Date.now(), name: newDept.name, headcount: 0, manager: newDept.manager, status: 'active', created: new Date().toISOString().split('T')[0] }]);
    setNewDept({ name: '', manager: '' });
    setShowAdd(false);
    toast.success('Department created');
  };

  const deleteDept = (id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
    toast.success('Department removed');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === departments.length) setSelectedIds([]);
    else setSelectedIds(departments.map(d => d.id));
  };

  const bulkDelete = () => {
    setDepartments(prev => prev.filter(d => !selectedIds.includes(d.id)));
    toast.success(`${selectedIds.length} departments removed`);
    setSelectedIds([]);
  };

  const bulkActivate = () => {
    setDepartments(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'active' } : d));
    toast.success(`${selectedIds.length} departments activated`);
    setSelectedIds([]);
  };

  const startEdit = (dept) => {
    setEditId(dept.id);
    setEditForm({ name: dept.name, manager: dept.manager });
  };

  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.manager.trim()) { toast.error('All fields required'); return; }
    setDepartments((prev) => prev.map((d) => d.id === editId ? { ...d, name: editForm.name, manager: editForm.manager } : d));
    setEditId(null);
    toast.success('Department updated');
  };

  const cancelEdit = () => setEditId(null);

  const bulkDeactivate = () => {
    setDepartments(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, status: 'inactive' } : d));
    toast.success(`${selectedIds.length} departments deactivated`);
    setSelectedIds([]);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Department Management - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Management</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Create, organize, and manage departments</p>
        </div>
        <Button variant="primary" icon={HiPlus} onClick={() => setShowAdd(!showAdd)}>New Department</Button>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center"><p className="text-3xl font-bold text-gray-900 dark:text-white">{departments.length}</p><p className="text-sm text-gray-500">Total Departments</p></Card>
        <Card className="p-4 text-center"><p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{departments.filter(d => d.status === 'active').length}</p><p className="text-sm text-emerald-600">Active</p></Card>
        <Card className="p-4 text-center"><p className="text-3xl font-bold text-gray-900 dark:text-white">{departments.reduce((sum, d) => sum + d.headcount, 0)}</p><p className="text-sm text-gray-500">Total Members</p></Card>
      </div>

      {showAdd && (
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Department</h3>
          <div className="flex items-center gap-3">
            <Input label="Department Name" value={newDept.name} onChange={(e) => setNewDept((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., Engineering" />
            <Input label="Manager" value={newDept.manager} onChange={(e) => setNewDept((p) => ({ ...p, manager: e.target.value }))} placeholder="Manager name" className="flex-1" />
            <Button variant="primary" onClick={addDept} className="mt-6">Create</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="mt-6">Cancel</Button>
          </div>
        </motion.div>
      )}

      {selectedIds.length > 0 && (
        <motion.div variants={itemVariants} className="px-4 py-3 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-200 dark:border-primary-800 flex items-center gap-3">
          <span className="text-sm text-primary-700 dark:text-primary-300 font-medium">{selectedIds.length} selected</span>
          <Button size="xs" variant="success" icon={HiCheckCircle} onClick={bulkActivate}>Activate</Button>
          <Button size="xs" variant="warning" icon={HiXCircle} onClick={bulkDeactivate}>Deactivate</Button>
          <Button size="xs" variant="danger" icon={HiTrash} onClick={bulkDelete}>Delete</Button>
          <Button size="xs" variant="ghost" onClick={() => setSelectedIds([])}>Clear</Button>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800">
              <th className="p-4 text-left w-10">
                <input type="checkbox" checked={selectedIds.length === departments.length && departments.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" aria-label="Select all departments" />
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Department</th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Manager</th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Headcount</th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Status</th>
              <th className="p-4 text-left font-semibold text-gray-700 dark:text-slate-300">Created</th>
              <th className="p-4 text-right font-semibold text-gray-700 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {departments.map((dept) => (
              <tr key={dept.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${selectedIds.includes(dept.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <td className="p-4">
                  <input type="checkbox" checked={selectedIds.includes(dept.id)} onChange={() => toggleSelect(dept.id)} className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" aria-label={`Select ${dept.name}`} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/30 dark:to-violet-900/30 rounded-lg flex items-center justify-center"><HiOfficeBuilding className="w-4 h-4 text-primary-600 dark:text-primary-400" /></div>
                    {editId === dept.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" autoFocus />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-600 dark:text-slate-400">
                  {editId === dept.id ? (
                    <input value={editForm.manager} onChange={(e) => setEditForm((p) => ({ ...p, manager: e.target.value }))} className="px-2 py-1 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                  ) : (
                    dept.manager
                  )}
                </td>
                <td className="p-4 font-medium text-gray-900 dark:text-white">{dept.headcount}</td>
                <td className="p-4"><Badge variant={dept.status === 'active' ? 'success' : 'warning'} size="sm">{dept.status}</Badge></td>
                <td className="p-4 text-gray-500 dark:text-slate-400 text-xs">{dept.created}</td>
                <td className="p-4 text-right">
                  {editId === dept.id ? (
                    <>
                      <Button variant="primary" size="xs" onClick={saveEdit}>Save</Button>
                      <Button variant="ghost" size="xs" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="xs" onClick={() => startEdit(dept)}>Edit</Button>
                      <Button variant="ghost" size="xs" icon={HiTrash} onClick={() => deleteDept(dept.id)}>Delete</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}