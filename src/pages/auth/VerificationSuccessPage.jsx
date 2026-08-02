import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

export default function VerificationSuccessPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const role = searchParams.get('role') || location.state?.role || 'employee';
  const email = searchParams.get('email') || location.state?.email || '';
  const message = searchParams.get('message') || location.state?.message || 'Your identity has been verified. You\'re all set.';

  useEffect(() => {
    if (email) {
      verifyEmail(email);
    }
  }, [email, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <Helmet>
        <title>Verification Successful - AdzConnect</title>
        <meta name="description" content="Your AdzConnect account has been verified successfully. You can now access all features." />
      </Helmet>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <HiCheckCircle className="w-20 h-20 mx-auto text-emerald-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-6">Verification Successful!</h1>
          {email && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{email}</p>}
          <p className="mt-2 text-gray-600 dark:text-slate-400">{message}</p>
          <Link to={`/app/dashboard/${role}`}>
            <Button fullWidth size="lg" className="mt-8">
              Continue to Dashboard <HiArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
