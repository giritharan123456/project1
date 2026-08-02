import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiUserGroup, HiCheckCircle, HiXCircle, HiMail, HiBadgeCheck } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function RegistrationApproval() {
  const { pendingRegistrations, approveRegistration, rejectRegistration, activityLog } = useApp();
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const todayKey = new Date().toISOString().split('T')[0];
  const approvedToday = useMemo(() => activityLog.filter(l => l.type === 'approval' && l.action?.includes('approved registration') && l.timestamp?.startsWith(todayKey)).length, [activityLog, todayKey]);
  const rejectedToday = useMemo(() => activityLog.filter(l => l.type === 'approval' && l.action?.includes('rejected registration') && l.timestamp?.startsWith(todayKey)).length, [activityLog, todayKey]);

  const handleApprove = (reg) => {
    approveRegistration(reg.id);
    toast.success(`Approved ${reg.name} — account activated`);
  };

  const handleReject = () => {
    if (rejectModal) {
      rejectRegistration(rejectModal.id, rejectReason);
      toast.success(`Rejected ${rejectModal.name}`);
      setRejectModal(null);
      setRejectReason('');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 p-6">
      <Helmet><title>Registration Approvals - AdzConnect</title></Helmet>

      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registration Approvals</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Review and approve or reject new user registrations</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"><p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{pendingRegistrations.length}</p><p className="text-sm text-amber-600 dark:text-amber-400">Pending</p></Card>
        <Card className="p-4 text-center border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10"><p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{approvedToday}</p><p className="text-sm text-emerald-600 dark:text-emerald-400">Approved Today</p></Card>
        <Card className="p-4 text-center border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"><p className="text-3xl font-bold text-red-700 dark:text-red-400">{rejectedToday}</p><p className="text-sm text-red-600 dark:text-red-400">Rejected Today</p></Card>
      </div>

      {pendingRegistrations.length > 0 ? (
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Approvals</h2>
          <div className="space-y-3">
            {pendingRegistrations.map((reg) => (
              <Card key={reg.id} className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/30 dark:to-violet-900/30 rounded-xl flex items-center justify-center"><HiUserGroup className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{reg.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1"><HiMail className="w-3 h-3" />{reg.email}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-0.5"><HiBadgeCheck className="w-3 h-3" />{reg.role || 'employee'} — {reg.department || 'General'}</p>
                    {reg.submittedAt && <p className="text-xs text-gray-400 dark:text-slate-500">Submitted: {new Date(reg.submittedAt).toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="success" size="sm" icon={HiCheckCircle} onClick={() => handleApprove(reg)}>Approve</Button>
                  <Button variant="danger" size="sm" icon={HiXCircle} onClick={() => setRejectModal(reg)}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4"><HiCheckCircle className="w-8 h-8 text-emerald-500" /></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">No pending registration requests</p>
        </motion.div>
      )}

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Registration" size="sm">
        <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">Reason for rejecting {rejectModal?.name}?</p>
        <input
          type="text"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Optional reason..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleReject}>Confirm Reject</Button>
        </div>
      </Modal>
    </motion.div>
  );
}