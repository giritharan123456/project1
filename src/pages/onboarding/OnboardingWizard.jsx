import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiShieldCheck, HiUser, HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const steps = [
  { id: 'profile', label: 'Profile', icon: HiUser, description: 'Complete your profile information' },
  { id: 'review', label: 'Review', icon: HiShieldCheck, description: 'Review and confirm setup' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', title: '', department: '', bio: '' });

  const completeStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const stored = localStorage.getItem('connectly-auth');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.onboardingComplete = true;
          localStorage.setItem('connectly-auth', JSON.stringify(parsed));
        } catch {
          // noop
        }
      }
      toast.success('Setup complete! Welcome to AdzConnect.');
      navigate('/app/home');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const stepContent = () => {
    switch (steps[currentStep].id) {
      case 'profile':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tell us about yourself</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="Enter your name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Job Title</label>
                <input type="text" value={profile.title} onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))} placeholder="e.g., Software Engineer" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Department</label>
                <input type="text" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))} placeholder="e.g., Engineering" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Bio</label>
                <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="A short description of yourself" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review your setup</h3>
            <div className="space-y-3">
              <Card className="p-4 flex items-center gap-3">
                <HiUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div><p className="font-medium text-gray-900 dark:text-white">{profile.name || 'Not set'}</p><p className="text-xs text-gray-500 dark:text-slate-400">{profile.title || 'No title set'}</p></div>
              </Card>
              <Card className="p-4 flex items-center gap-3">
                <HiUser className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <div><p className="font-medium text-gray-900 dark:text-white">{profile.department || 'No department'}</p><p className="text-xs text-gray-500 dark:text-slate-400">{profile.bio || 'No bio set'}</p></div>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Helmet><title>Onboarding - AdzConnect</title></Helmet>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-lg">C</span></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to AdzConnect</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Complete your profile to get started</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>{i < currentStep ? <HiCheckCircle className="w-4 h-4" /> : i + 1}</div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 mx-1 ${i < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center"><StepIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /></div>
            <div><p className="font-semibold text-gray-900 dark:text-white">{steps[currentStep].label}</p><p className="text-xs text-gray-500 dark:text-slate-400">{steps[currentStep].description}</p></div>
          </div>
          {stepContent()}
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0}><HiChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
          <Button variant="primary" onClick={completeStep}>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'}<HiChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </motion.div>
    </div>
  );
}
