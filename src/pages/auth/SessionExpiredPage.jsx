import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClock, HiArrowLeft, HiRefresh } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

export default function SessionExpiredPage() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'employee';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <Helmet>
        <title>Session Expired - AdzConnect</title>
        <meta name="description" content="Your AdzConnect session has expired due to inactivity. Please log in again to continue." />
      </Helmet>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <HiClock className="w-20 h-20 mx-auto text-amber-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-6">Session Expired</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Your session has expired due to inactivity. Please log in again to continue.</p>
          <div className="flex gap-3 mt-8">
            <Link to="/" className="flex-1">
              <Button variant="outline" fullWidth><HiArrowLeft className="w-5 h-5 mr-2" /> Home</Button>
            </Link>
            <Link to={`/auth/login/${role}`} className="flex-1">
              <Button fullWidth><HiRefresh className="w-5 h-5 mr-2" /> Re-login</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
