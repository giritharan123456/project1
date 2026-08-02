import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';
import EnterpriseSSOButtons from '../../../components/auth/EnterpriseSSOButtons';

export default function RoleLoginContent({ role }) {
  const navigate = useNavigate();
  const { login, ssoLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '', password: '', rememberMe: false } });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = login(data.email, data.password, data.rememberMe);
      if (result.success) {
        if (result.user.role !== role) {
          toast.error(`This login is for ${role}s only. Please use the correct role login.`);
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
        toast.error(`This login is for ${role}s only. Your ${provider} account is linked to the ${result.user.role} role.`);
        return;
      }
      toast.success(`${provider} SSO successful! Redirecting...`);
      navigate(`/auth/${role}/otp`, { state: { email: result.user.email } });
    } else {
      toast.error(`${provider} SSO failed`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8"
    >
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
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" {...register('rememberMe')} />
            Remember me
          </label>
          <Link to={`/auth/${role}/forgot-password`} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" fullWidth loading={isLoading} size="lg">Sign In</Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-600" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">Or continue with</span></div>
      </div>

      <EnterpriseSSOButtons onSelect={handleSSO} />

      <p className="text-center mt-6 text-sm text-gray-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to={`/auth/${role}/signup`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Sign up free</Link>
      </p>
    </motion.div>
  );
}

export function RoleLoginPage({ role }) {
  return (
    <RoleAuthWrapper role={role} title="Welcome back" subtitle="Sign in to your account to continue" helmetTitle={`Sign In - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleLoginContent role={role} />
    </RoleAuthWrapper>
  );
}
