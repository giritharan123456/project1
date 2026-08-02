import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiUserCircle, HiShieldCheck, HiAcademicCap, HiBriefcase, HiUserGroup, HiStar, HiGlobe } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';

const roles = [
  { id: 'employee', label: 'Employee', icon: HiUserCircle, gradient: 'from-blue-500 to-blue-700', desc: 'Team member workspace', color: 'blue' },
  { id: 'host', label: 'Host', icon: HiBriefcase, gradient: 'from-emerald-500 to-emerald-700', desc: 'Meeting host', color: 'emerald' },
  { id: 'admin', label: 'Admin', icon: HiShieldCheck, gradient: 'from-purple-500 to-purple-700', desc: 'System administrator', color: 'purple' },
  { id: 'hr', label: 'HR', icon: HiAcademicCap, gradient: 'from-pink-500 to-pink-700', desc: 'Human resources', color: 'pink' },
  { id: 'manager', label: 'Manager', icon: HiUserGroup, gradient: 'from-orange-500 to-orange-700', desc: 'Team management', color: 'orange' },
  { id: 'executive', label: 'Executive', icon: HiStar, gradient: 'from-indigo-500 to-indigo-700', desc: 'Executive overview', color: 'indigo' },
  { id: 'ceo', label: 'CEO', icon: HiGlobe, gradient: 'from-amber-500 to-amber-700', desc: 'CEO command center', color: 'amber' },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <Helmet>
        <title>Select Role - AdzConnect</title>
        <meta name="description" content="Choose your role to access the appropriate AdzConnect dashboard and features." />
      </Helmet>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center">
              <HiShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Connectly</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">Select your role</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Choose your role to continue to the appropriate login portal</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.button key={role.id} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/auth/login/${role.id}`)}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 text-left group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{role.label}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{role.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
