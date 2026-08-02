import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUserCircle, HiShieldCheck, HiStar, HiBadgeCheck, HiBriefcase, HiAcademicCap, HiLightningBolt } from 'react-icons/hi';
import { Helmet } from 'react-helmet-async';
import Badge from '../../../components/ui/Badge';

const ROLE_CONFIG = {
  employee: {
    label: 'Employee',
    icon: HiUserCircle,
    gradient: 'from-blue-500 to-blue-700',
    bgGradient: 'from-gray-50 to-blue-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'Employee Portal',
    desc: 'Team member workspace & collaboration',
    dashboardPath: 'employee',
  },
  host: {
    label: 'Host',
    icon: HiStar,
    gradient: 'from-emerald-500 to-emerald-700',
    bgGradient: 'from-gray-50 to-emerald-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'Host Control Center',
    desc: 'Meeting host dashboard & management',
    dashboardPath: 'host',
  },
  admin: {
    label: 'Admin',
    icon: HiShieldCheck,
    gradient: 'from-purple-500 to-purple-700',
    bgGradient: 'from-gray-50 to-purple-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'Admin Control Center',
    desc: 'System administrator & governance',
    dashboardPath: 'admin',
  },
  hr: {
    label: 'HR',
    icon: HiBriefcase,
    gradient: 'from-pink-500 to-pink-700',
    bgGradient: 'from-gray-50 to-pink-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'HR Portal',
    desc: 'Human resources & people management',
    dashboardPath: 'hr',
  },
  manager: {
    label: 'Manager',
    icon: HiBadgeCheck,
    gradient: 'from-orange-500 to-orange-700',
    bgGradient: 'from-gray-50 to-orange-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'Manager Dashboard',
    desc: 'Team management & performance',
    dashboardPath: 'manager',
  },
  executive: {
    label: 'Executive',
    icon: HiAcademicCap,
    gradient: 'from-indigo-500 to-indigo-700',
    bgGradient: 'from-gray-50 to-indigo-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'Executive Overview',
    desc: 'Executive leadership & strategy',
    dashboardPath: 'executive',
  },
  ceo: {
    label: 'CEO',
    icon: HiLightningBolt,
    gradient: 'from-amber-500 to-amber-700',
    bgGradient: 'from-gray-50 to-amber-50',
    darkBgGradient: 'dark:from-slate-900 dark:to-slate-800',
    heroText: 'CEO Command Center',
    desc: 'Chief executive operations & insights',
    dashboardPath: 'ceo',
  },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export function RoleAnimatedWrapper({ children, className = '' }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

export default function RoleAuthWrapper({ role, title, subtitle, children, maxWidth = 'max-w-md', helmetTitle, helmetDesc }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.employee;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${config.bgGradient} ${config.darkBgGradient} px-4 py-12`}>
      <Helmet>
        <title>{helmetTitle || `${title} - ${config.heroText} - AdzConnect`}</title>
        {helmetDesc && <meta name="description" content={helmetDesc} />}
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`w-full ${maxWidth}`}
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center`}>
              <config.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Connectly</span>
          </Link>
          <Badge variant="primary" size="md" className="mb-4">{config.heroText}</Badge>
          {title && <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{title}</h1>}
          {subtitle && <p className="mt-2 text-gray-600 dark:text-slate-400">{subtitle}</p>}
        </motion.div>
        {children}
      </motion.div>
    </div>
  );
}
