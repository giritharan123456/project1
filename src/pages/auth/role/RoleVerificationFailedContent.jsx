import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiXCircle, HiArrowLeft, HiRefresh } from 'react-icons/hi';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';

export default function RoleVerificationFailedContent({ role }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center"
    >
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
        <HiXCircle className="w-20 h-20 mx-auto text-red-500" />
      </motion.div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-6">Verification Failed</h1>
      <p className="mt-2 text-gray-600 dark:text-slate-400">The verification code was incorrect or has expired.</p>
      <div className="flex gap-3 mt-8">
        <Link to={`/auth/${role}/login`} className="flex-1">
          <Button variant="outline" fullWidth><HiArrowLeft className="w-5 h-5 mr-2" /> Back</Button>
        </Link>
        <Link to={`/auth/${role}/otp`} className="flex-1">
          <Button fullWidth><HiRefresh className="w-5 h-5 mr-2" /> Retry</Button>
        </Link>
      </div>
    </motion.div>
  );
}

export function RoleVerificationFailedPage({ role }) {
  return (
    <RoleAuthWrapper role={role} helmetTitle={`Verification Failed - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleVerificationFailedContent role={role} />
    </RoleAuthWrapper>
  );
}
