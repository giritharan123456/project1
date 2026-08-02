import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowSmRight, HiX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import EnterpriseSSOButtons from '../../components/auth/EnterpriseSSOButtons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, ssoLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoModal, setSsoModal] = useState(null);
  const [ssoEmail, setSsoEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '', rememberMe: false } });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = login(data.email, data.password, data.rememberMe);
      if (result.success) {
        toast.success(`Welcome back! Redirecting to ${result.user.role} dashboard...`);
        navigate(result.redirect);
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOClick = (provider) => {
    setSsoModal(provider);
    setSsoEmail('');
    setTimeout(() => {
      setSsoModal(null);
      const result = ssoLogin(provider);
      if (result.success) {
        toast.success(`SSO login successful via ${provider}! Redirecting...`);
        navigate(result.redirect);
      } else {
        toast.error(`${provider} SSO failed. Please try again.`);
        setSsoEmail(result.error || '');
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <Helmet>
        <title>Sign In - AdzConnect</title>
        <meta name="description" content="Sign in to your AdzConnect account to access meetings, chat, and collaboration tools." />
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Sign in to your account to continue</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={HiLockClosed}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                    {...register('rememberMe')}
                  />
                  Remember me
                </label>
                <Link to="/auth/forgot-password" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400">Or continue with</span>
            </div>
          </div>

          <EnterpriseSSOButtons onSelect={handleSSOClick} />
        </motion.div>

        <motion.p variants={itemVariants} className="text-center mt-6 text-sm text-gray-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/auth/signup" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
            Sign up free
          </Link>
          <br />
          <Link to="/role-select" className="text-xs text-primary-500 hover:underline mt-1 inline-block">
            Select a specific role to sign in
          </Link>
        </motion.p>
      </motion.div>

      {/* SSO Redirect Modal */}
      {ssoModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-slate-700 text-center max-w-sm w-full mx-4"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-violet-500 rounded-full flex items-center justify-center">
              <HiArrowSmRight className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Redirecting to {ssoModal}...</h3>
            <div className="flex justify-center gap-1 my-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2.5 h-2.5 rounded-full bg-primary-500"
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Establishing secure SSO session...</p>
          </motion.div>
        </motion.div>
      )}

      {/* Auto-filled SSO Email */}
      {ssoEmail && (
        <div className="fixed bottom-4 right-4 z-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-3 flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-slate-300">SSO: {ssoEmail}</span>
          <button onClick={() => setSsoEmail('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200">
            <HiX className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
