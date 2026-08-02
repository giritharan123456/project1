import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff, HiCheckCircle } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import EnterpriseSSOButtons from '../../components/auth/EnterpriseSSOButtons';
import { getPasswordPolicy, getPasswordStrength } from '../../utils/passwordPolicy';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const departments = [
  'Engineering', 'Design', 'Marketing', 'Sales', 'Human Resources',
  'Finance', 'Operations', 'Legal', 'Product', 'Customer Support',
];

const roles = [
  { value: 'employee', label: 'Employee' },
  { value: 'host', label: 'Host' },
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'executive', label: 'Executive' },
  { value: 'ceo', label: 'CEO' },
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

export default function SignupPage() {
  const navigate = useNavigate();
  const { register: registerUser, ssoLogin, verifyEmail } = useAuth();
  const { registerUser: addPendingRegistration } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSSOSignup = (provider) => {
    const result = ssoLogin(provider, 'employee');
    if (result.success) {
      addPendingRegistration({ name: `${provider} User`, email: result.user.email, role: 'employee', department: 'General' });
      toast.success(`${provider} sign-up successful! Redirecting...`);
      navigate('/auth/otp-verification', { state: { role: 'employee', email: result.user.email } });
    } else {
      toast.error(`${provider} sign-up failed`);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', department: '', role: '', acceptTerms: false },
  });

  const policy = getPasswordPolicy('employee');
  const password = watch('password');
  const strength = getPasswordStrength(password || '', policy);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
        role: data.role,
      });
      if (result.success) {
        // Add to admin pending registrations for approval workflow
        addPendingRegistration({
          name: data.name,
          email: data.email,
          role: data.role || 'employee',
          department: data.department || 'General',
        });
        setVerifiedEmail(data.email);
        setShowVerification(true);
        toast.success('Account created! Please verify your email.');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <Helmet>
        <title>Sign Up - AdzConnect</title>
        <meta name="description" content="Create your AdzConnect account and start collaborating with your team through video meetings, chat, and more." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-500 rounded-xl flex items-center justify-center">
              <HiLockClosed className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Connectly</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Create your account</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Join thousands of teams already using Connectly</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={HiUser}
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
            />

            <Input
              label="Email"
              type="email"
              icon={HiMail}
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={HiLockClosed}
                placeholder="Create a password"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: policy.minLength, message: `At least ${policy.minLength} characters` },
                  ...(getPasswordPattern(policy) || {}),
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: strength.width }}
                      className={`h-full rounded-full ${strength.color}`}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${strength.textColor}`}>{strength.label}</p>
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                icon={HiLockClosed}
                placeholder="Repeat your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showConfirm ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Department</label>
              <select
                className={`block w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.department ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                {...register('department', { required: 'Select your department' })}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Role</label>
              <select
                className={`block w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.role ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                {...register('role', { required: 'Select your role' })}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                {...register('acceptTerms', { required: 'You must accept the terms' })}
              />
              <span className="text-sm text-gray-600 dark:text-slate-400">
                I agree to the{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Opening Terms of Service...'); }} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Opening Privacy Policy...'); }} className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>
            )}

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Create Account
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">Or sign up with</span>
            </div>
          </div>

          <EnterpriseSSOButtons onSelect={handleSSOSignup} />
        </motion.div>

        <motion.p variants={itemVariants} className="text-center mt-6 text-sm text-gray-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Sign in
          </Link>
        </motion.p>
      </motion.div>

      {/* Email Verification Screen */}
      {showVerification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700 text-center max-w-md w-full mx-4"
          >
            {!verificationSent ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-violet-500 rounded-full flex items-center justify-center">
                  <HiMail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify your email</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
                  We've sent a verification email to <strong className="text-gray-700 dark:text-slate-200">{verifiedEmail}</strong>
                </p>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Simulated email preview:</p>
                  <p className="text-sm text-gray-700 dark:text-slate-200 font-medium">Verify your AdzConnect account</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Click the button below to verify your email address and activate your account.
                  </p>
                </div>
                <Button fullWidth onClick={() => { setVerifying(true); setTimeout(() => { setVerifying(false); setVerificationSent(true); }, 1500); }} size="lg">
                  Send Verification Email
                </Button>
                <button
                  onClick={() => { setShowVerification(false); navigate('/auth/login'); }}
                  className="mt-3 text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Skip for now
                </button>
              </>
            ) : verifying ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <svg className="animate-spin w-8 h-8 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verifying...</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Please wait while we verify your email address.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                  Your email <strong className="text-gray-700 dark:text-slate-200">{verifiedEmail}</strong> has been verified.
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">Your account is now active. Please sign in to continue.</p>
                <Button fullWidth onClick={() => {
                  verifyEmail(verifiedEmail);
                  setShowVerification(false);
                  navigate('/auth/login');
                }} size="lg">
                  Continue to Sign In
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
