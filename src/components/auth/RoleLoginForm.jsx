import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiShieldCheck, HiUserCircle } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import EnterpriseSSOButtons from './EnterpriseSSOButtons';

const ROLE_META = {
  employee: { label: 'Employee', gradient: 'from-blue-500 to-blue-700', icon: HiUserCircle, desc: 'Team member workspace' },
  host: { label: 'Host', gradient: 'from-emerald-500 to-emerald-700', icon: HiUserCircle, desc: 'Meeting host dashboard' },
  admin: { label: 'Admin', gradient: 'from-purple-500 to-purple-700', icon: HiShieldCheck, desc: 'System administrator' },
  hr: { label: 'HR', gradient: 'from-pink-500 to-pink-700', icon: HiUserCircle, desc: 'Human resources portal' },
  manager: { label: 'Manager', gradient: 'from-orange-500 to-orange-700', icon: HiUserCircle, desc: 'Team management' },
  executive: { label: 'Executive', gradient: 'from-indigo-500 to-indigo-700', icon: HiUserCircle, desc: 'Executive overview' },
  ceo: { label: 'CEO', gradient: 'from-amber-500 to-amber-700', icon: HiUserCircle, desc: 'CEO command center' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function RoleLoginForm({ role }) {
  const navigate = useNavigate();
  const { login, ssoLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const meta = ROLE_META[role] || ROLE_META.employee;

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '', password: '', rememberMe: false } });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = login(data.email, data.password, data.rememberMe);
      if (result.success) {
        if (result.user.role !== role) {
          toast.error(`This login is for ${meta.label}s only. Please use the correct role login.`);
          setIsLoading(false);
          return;
        }
        toast.success(`Welcome ${result.user.name}! Redirecting...`);
        navigate(`/auth/${role}/otp`, { state: { email: data.email } });
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  const handleSSO = (provider) => {
    const result = ssoLogin(provider, role);
    if (result.success) {
      if (result.user.role !== role) {
        toast.error(`This login is for ${meta.label}s only. Your ${provider} account is linked to the ${result.user.role} role.`);
        return;
      }
      toast.success(`${provider} SSO successful! Redirecting...`);
      navigate(`/auth/${role}/otp`, { state: { email: result.user.email } });
    } else {
      toast.error(`${provider} SSO failed`);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
      <motion.div variants={itemVariants} className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className={`w-10 h-10 bg-gradient-to-br ${meta.gradient} rounded-xl flex items-center justify-center`}>
            <meta.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Connectly</span>
        </Link>
        <Badge variant="primary" size="md" className="mb-4">{meta.label} Portal</Badge>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Welcome back</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">{meta.desc}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Email" type="email" icon={HiMail} placeholder="you@company.com" error={errors.email?.message}
            {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } })} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} icon={HiLockClosed} placeholder="Enter your password" error={errors.password?.message}
              {...register('password', { required: 'Password is required' })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" {...register('rememberMe')} />
              Remember me
            </label>
            <Link to={`/auth/${role}/forgot-password`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" fullWidth loading={isLoading} size="lg">Sign In as {meta.label}</Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-600" /></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">Or continue with</span></div>
        </div>

        <EnterpriseSSOButtons onSelect={handleSSO} />
      </motion.div>

      <motion.p variants={itemVariants} className="text-center mt-6 text-sm text-gray-600 dark:text-slate-400">
        Don&apos;t have an account? <Link to="/auth/signup" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Sign up free</Link>
        <br /><span className="text-xs">Wrong role? <Link to="/auth/login" className="text-primary-500 hover:underline">Choose a different role</Link></span>
      </motion.p>
    </motion.div>
  );
}
