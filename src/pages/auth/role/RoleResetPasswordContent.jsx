import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiLockClosed, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';
import { getPasswordPolicy, getPasswordStrength } from '../../../utils/passwordPolicy';

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

export default function RoleResetPasswordContent({ role }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  const policy = getPasswordPolicy(role);
  const password = watch('password');
  const strength = getPasswordStrength(password || '', policy);

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      toast.success('Password reset successfully');
      navigate(`/auth/${role}/login`);
    } catch { toast.error('Something went wrong'); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <Input label="New Password" type={showPassword ? 'text' : 'password'} icon={HiLockClosed} placeholder="Enter new password" error={errors.password?.message}
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
            <Input label="Confirm New Password" type={showConfirm ? 'text' : 'password'} icon={HiLockClosed} placeholder="Repeat new password" error={errors.confirmPassword?.message}
              {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === password || 'Passwords do not match' })} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
              {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-slate-400">
            {strength.requirements.map(({ label, met }) => (
              <li key={label} className={`flex items-center gap-2 ${met ? 'text-emerald-500' : ''}`}>
                <HiCheckCircle className="w-4 h-4 flex-shrink-0" /> {label}
              </li>
            ))}
          </ul>
          <Button type="submit" fullWidth loading={isLoading} size="lg">Reset Password</Button>
        </form>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-6 text-sm"
      >
        <Link to={`/auth/${role}/login`} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Back to sign in</Link>
      </motion.p>
    </>
  );
}

export function RoleResetPasswordPage({ role }) {
  return (
    <RoleAuthWrapper role={role} title="Reset your password" subtitle="Choose a strong password for your account" helmetTitle={`Reset Password - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleResetPasswordContent role={role} />
    </RoleAuthWrapper>
  );
}
