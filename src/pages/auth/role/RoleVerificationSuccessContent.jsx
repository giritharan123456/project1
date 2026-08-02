import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';
import { useAuth } from '../../../context/AuthContext';

export default function RoleVerificationSuccessContent({ role }) {
  const { user, verifyEmail } = useAuth();
  const location = useLocation();
  const email = location.state?.email || user?.email;

  useEffect(() => {
    if (email) {
      verifyEmail(email);
    }
  }, [email, verifyEmail]);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center"
    >
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
        <HiCheckCircle className="w-20 h-20 mx-auto text-emerald-500" />
      </motion.div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-6">Verification Successful!</h1>
      <p className="mt-2 text-gray-600 dark:text-slate-400">Your identity has been verified. You&apos;re all set.</p>
      <Link to={`/app/dashboard/${role}`}>
        <Button fullWidth size="lg" className="mt-8">
          Continue to Dashboard <HiArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    </motion.div>
  );
}

export function RoleVerificationSuccessPage({ role }) {
  return (
    <RoleAuthWrapper role={role} helmetTitle={`Verification Success - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleVerificationSuccessContent role={role} />
    </RoleAuthWrapper>
  );
}
