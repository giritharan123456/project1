import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiLockClosed, HiHome, HiShieldExclamation,
  HiMail,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  const handleRequestAccess = () => {
    toast.success('Access request sent to your administrator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <Helmet>
        <title>Unauthorized - AdzConnect</title>
        <meta name="description" content="You do not have permission to access this page. Contact your administrator for access." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg mx-auto text-center"
      >
        <motion.div variants={itemVariants}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto shadow-xl shadow-red-500/25"
          >
            <HiLockClosed className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Access Denied</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            You don't have permission to view this page
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <Card className="bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <HiShieldExclamation className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 text-left">
                If you think this is a mistake, contact your administrator
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <Button icon={HiHome} onClick={() => navigate('/app/home')}>Go Home</Button>
          <Button variant="success" icon={HiMail} onClick={handleRequestAccess}>
            Request Access
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
