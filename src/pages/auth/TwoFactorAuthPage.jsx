import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiShieldCheck, HiArrowLeft } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

export default function TwoFactorAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify2FA, user } = useAuth();
  const role = location.state?.role || user?.role || 'employee';
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const [sentCode, setSentCode] = useState(() => String(Math.floor(100000 + Math.random() * 900000)));
  const [isLoading, setIsLoading] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    if (value && index < 5) {
      const next = document.getElementById(`2fa-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      const prev = document.getElementById(`2fa-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  // Check if device is already trusted for this role
  useEffect(() => {
    const trusted = localStorage.getItem(`connectly-trusted-device-${role}`);
    if (trusted === 'true') {
      verify2FA();
      toast.success('Trusted device recognized. Skipping 2FA.');
      navigate(`/app/dashboard/${role}`);
    }
  }, [verify2FA, navigate, role]);

  const handleVerify = async () => {
    const code = codes.join('');
    if (code.length !== 6) { toast.error('Please enter the complete 6-digit code'); return; }
    if (code !== sentCode) { toast.error('Incorrect code. Check the simulated code shown above.'); return; }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Accept the code shown on this page (authenticator simulation)
      verify2FA();
      if (rememberDevice) {
        localStorage.setItem(`connectly-trusted-device-${role}`, 'true');
        toast.success('Device trusted for 30 days');
      }
      toast.success('2FA verified successfully!');
      navigate(`/app/dashboard/${role}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <Helmet>
        <title>Two-Factor Authentication - AdzConnect</title>
        <meta name="description" content="Complete two-factor authentication to securely access your AdzConnect account." />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center">
            <HiShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Two-Factor Authentication</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Enter the 6-digit code shown below (simulated authenticator)</p>

          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 my-6 text-center border border-dashed border-gray-300 dark:border-slate-600">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Simulated authenticator code</p>
            <p className="text-3xl font-bold tracking-[0.3em] text-gray-900 dark:text-slate-100 mb-3">{sentCode}</p>
            <button
              type="button"
              onClick={() => { setCodes(sentCode.split('')); toast.success('Code filled in'); }}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              Fill this code automatically
            </button>
          </div>

          <div className="flex gap-2 justify-center mb-8">
            {codes.map((digit, i) => (
              <input key={i} id={`2fa-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} autoFocus={i === 0}
                onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-slate-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
            ))}
          </div>

          <label className="flex items-center justify-center gap-2 my-4 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            />
            Remember this device for 30 days
          </label>

          <Button onClick={handleVerify} fullWidth loading={isLoading} size="lg">Verify & Continue</Button>

          <div className="mt-6 text-sm text-gray-600 dark:text-slate-400 space-y-2">
            <p>Didn&apos;t receive the code? <button onClick={() => { setSentCode(String(Math.floor(100000 + Math.random() * 900000))); toast.success('New code generated'); setCodes(['', '', '', '', '', '']); document.getElementById('2fa-0')?.focus(); }} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Resend</button></p>
            <Link to={`/auth/login/${role}`} className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline font-medium">
              <HiArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
