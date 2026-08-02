import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function RoleForgotPasswordContent({ role }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch { toast.error('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  if (submitted) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Check your email</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          We&apos;ve sent a password reset link to <strong className="text-gray-900 dark:text-slate-200">{email}</strong>
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-500 mb-6">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <button onClick={() => { setSubmitted(false); setIsLoading(false); }} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">try another email</button>
        </p>
        <Link to={`/auth/${role}/login`} className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
          <HiArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Email address" type="email" icon={HiMail} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" fullWidth loading={isLoading} size="lg">Send Reset Link</Button>
        </form>
      </motion.div>
      <motion.p variants={itemVariants} className="text-center mt-6 text-sm">
        <Link to={`/auth/${role}/login`} className="inline-flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400 hover:underline">
          <HiArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.p>
    </>
  );
}

export function RoleForgotPasswordPage({ role }) {
  return (
    <RoleAuthWrapper role={role} title="Forgot password?" subtitle="Enter your email and we'll send you a reset link" helmetTitle={`Forgot Password - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleForgotPasswordContent role={role} />
    </RoleAuthWrapper>
  );
}
