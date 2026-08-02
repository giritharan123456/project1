import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiShieldCheck, HiArrowLeft, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import Button from '../../../components/ui/Button';
import RoleAuthWrapper from './RoleAuthWrapper';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } };

export default function RoleOTPContent({ role }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [sentCode, setSentCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [status, setStatus] = useState('idle');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) setCanResend(true);
  }, [timer, canResend]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = () => {
    setSentCode(String(Math.floor(100000 + Math.random() * 900000)));
    setTimer(30);
    setCanResend(false);
    toast.success(`New code sent: ${sentCode}`);
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Please enter the complete 6-digit code'); return; }
    if (code !== sentCode) { setStatus('failed'); return; }
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setStatus('success');
    toast.success('Email verified successfully');
    setIsLoading(false);
  };

  if (status === 'success') {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiCheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Verification Successful</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">Your email has been verified successfully.</p>
          <Button onClick={() => navigate(`/auth/${role}/2fa`)} fullWidth size="lg">Continue to 2FA</Button>
        </motion.div>
      </motion.div>
    );
  }

  if (status === 'failed') {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiXCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Verification Failed</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-6">The code you entered is incorrect.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStatus('idle'); setOtp(Array(6).fill('')); }} fullWidth size="lg">Try Again</Button>
            <Button onClick={handleResend} fullWidth size="lg">Resend Code</Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-center border border-dashed border-gray-300 dark:border-slate-600">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Simulated email preview — your verification code</p>
          <p className="text-3xl font-bold tracking-[0.3em] text-gray-900 dark:text-slate-100 mb-3">{sentCode}</p>
          <button
            type="button"
            onClick={() => { setOtp(sentCode.split('')); toast.success('Code filled in'); }}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Fill this code automatically
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 mb-6">
          <HiShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Enter the verification code</span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-8" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input key={i} ref={(el) => { inputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)} aria-label={`Digit ${i + 1}`}
              className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-gray-300 dark:border-slate-600" />
          ))}
        </div>
        <Button onClick={handleVerify} fullWidth loading={isLoading} size="lg">Verify Code</Button>
        <div className="text-center mt-6">
          {canResend ? (
            <button onClick={handleResend} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Resend code</button>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">Resend code in <span className="font-medium text-gray-900 dark:text-slate-200">{timer}s</span></p>
          )}
        </div>
      </motion.div>
      <motion.p variants={itemVariants} className="text-center mt-6 text-sm">
        <Link to={`/auth/${role}/forgot-password`} className="inline-flex items-center gap-2 font-medium text-primary-600 dark:text-primary-400 hover:underline">
          <HiArrowLeft className="w-4 h-4" /> Back
        </Link>
      </motion.p>
    </>
  );
}

export function RoleOTPPage({ role }) {
  return (
    <RoleAuthWrapper role={role} title="Verify your identity" subtitle="Enter the verification code sent to your email" helmetTitle={`OTP Verification - ${role.charAt(0).toUpperCase() + role.slice(1)} - AdzConnect`}>
      <RoleOTPContent role={role} />
    </RoleAuthWrapper>
  );
}
