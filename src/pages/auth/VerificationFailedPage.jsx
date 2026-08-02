import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiXCircle, HiArrowLeft, HiRefresh } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

export default function VerificationFailedPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const role = searchParams.get('role') || location.state?.role || 'employee';
  const email = searchParams.get('email') || location.state?.email || '';
  const errorMessage = searchParams.get('message') || location.state?.message || 'The verification code was incorrect or has expired. Please try again.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <Helmet>
        <title>Verification Failed - AdzConnect</title>
        <meta name="description" content="Your AdzConnect account verification failed. The code was incorrect or has expired. Please try again." />
      </Helmet>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <HiXCircle className="w-20 h-20 mx-auto text-red-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-6">Verification Failed</h1>
          {email && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{email}</p>}
          <p className="mt-2 text-gray-600 dark:text-slate-400">{errorMessage}</p>
          <div className="flex gap-3 mt-8">
            <Link to={`/auth/login/${role}`} className="flex-1">
              <Button variant="outline" fullWidth><HiArrowLeft className="w-5 h-5 mr-2" /> Back</Button>
            </Link>
            <Link to={`/auth/otp-verification`} className="flex-1">
              <Button fullWidth><HiRefresh className="w-5 h-5 mr-2" /> Retry</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
