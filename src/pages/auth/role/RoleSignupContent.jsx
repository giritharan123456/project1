import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';
import EnterpriseSSOButtons from '../../../components/auth/EnterpriseSSOButtons';
import { getPasswordPolicy, getPasswordStrength } from '../../../utils/passwordPolicy';

const departments = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources',
  'Finance', 'Operations', 'Legal', 'Product', 'Customer Support',
];

function getPasswordPattern(policy) {
  const lookaheads = [];
  const labels = [];
  if (policy.requireUpper) { lookaheads.push('(?=.*[A-Z])'); labels.push('uppercase letter'); }
  if (policy.requireLower) { lookaheads.push('(?=.*[a-z])'); labels.push('lowercase letter'); }
  if (policy.requireNumber) { lookaheads.push('(?=.*[0-9])'); labels.push('number'); }
  if (policy.requireSpecial) { lookaheads.push('(?=.*[^a-zA-Z0-9])'); labels.push('special character'); }
  if (!lookaheads.length) return null;
  return {
    value: new RegExp(lookaheads.join('')),
    message: `Must include at least one ${labels.join(', ')}`,
  };
}

export default function RoleSignupContent({ role }) {
  const navigate = useNavigate();
  const { register: registerUser, ssoLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSSOSignup = (provider) => {
    const result = ssoLogin(provider, role);
    if (result.success) {
      toast.success(`${provider} account created! Redirecting...`);
      navigate(`/auth/${role}/otp`, { state: { email: result.user.email } });
    } else {
      toast.error(`${provider} signup failed`);
    }
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', department: '', acceptTerms: false },
  });

  const policy = getPasswordPolicy(role);
  const password = watch('password');
  const strength = getPasswordStrength(password || '', policy);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = registerUser({ name: data.name, email: data.email, password: data.password, department: data.department, role });
      if (result.success) {
        toast.success('Account created! Please verify your email before signing in.');
        navigate('/auth/login');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch { toast.error('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" type="text" icon={HiUser} placeholder="John Doe" error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })} />
        <Input label="Email" type="email" icon={HiMail} placeholder="you@company.com" error={errors.email?.message}
          {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' } })} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} icon={HiLockClosed} placeholder="Create a password" error={errors.password?.message}
            {...register('password', { required: 'Password is required', minLength: { value: policy.minLength, message: `At least ${policy.minLength} characters` }, ...(getPasswordPattern(policy) || {}) })} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
            {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
          </button>
          {password && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: strength.width }}
                  className={`h-full rounded-full ${strength.color}`} transition={{ duration: 0.3 }} />
              </div>
              <p className={`text-xs mt-1 ${strength.textColor}`}>{strength.label}</p>
            </div>
          )}
        </div>
        <div className="relative">
          <Input label="Confirm Password" type={showConfirm ? 'text' : 'password'} icon={HiLockClosed} placeholder="Repeat your password" error={errors.confirmPassword?.message}
            {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === password || 'Passwords do not match' })} />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
            {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Department</label>
          <select className={`block w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
            {...register('department', { required: 'Select your department' })}>
            <option value="">Select department</option>
            {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
          </select>
          {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            {...register('acceptTerms', { required: 'You must accept the terms' })} />
          <span className="text-sm text-gray-600 dark:text-slate-400">
            I agree to the <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a> and <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
          </span>
        </label>
        {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}
        <Button type="submit" fullWidth loading={isLoading} size="lg">Create Account</Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-600" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">Or sign up with</span></div>
      </div>

      <EnterpriseSSOButtons onSelect={handleSSOSignup} />

      <p className="text-center mt-6 text-sm text-gray-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to={`/auth/${role}/login`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}

export function RoleSignupPage({ role }) {
  return (
    <RoleAuthWrapper role={role} title="Create your account" subtitle="Join your team on Connectly" helmetTitle={`Sign Up - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleSignupContent role={role} />
    </RoleAuthWrapper>
  );
}
