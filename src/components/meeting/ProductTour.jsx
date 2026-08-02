import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiChevronRight, HiChevronLeft, HiVideoCamera, HiChat, HiCalendar, HiCog } from 'react-icons/hi';
import Button from '../ui/Button';

const steps = [
  {
    title: 'Welcome to Connectly',
    description: 'Your all-in-one video collaboration platform. Let us show you around!',
    icon: HiVideoCamera,
    target: 'top',
  },
  {
    title: 'Meetings',
    description: 'Start or join meetings instantly. Schedule future meetings with team members.',
    icon: HiVideoCamera,
    target: 'sidebar-meetings',
  },
  {
    title: 'Chat & Collaborate',
    description: 'Send messages, share files, and collaborate with your team in real-time.',
    icon: HiChat,
    target: 'sidebar-chat',
  },
  {
    title: 'Calendar',
    description: 'View and manage your schedule across month, week, day, and agenda views.',
    icon: HiCalendar,
    target: 'sidebar-calendar',
  },
  {
    title: 'Customize Everything',
    description: 'Adjust your settings, notifications, and preferences to match your workflow.',
    icon: HiCog,
    target: 'sidebar-settings',
  },
];

export default function ProductTour({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Product tour">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                  Step {step + 1} of {steps.length}
                </span>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                  <HiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Icon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{current.title}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-8">{current.description}</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {steps.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'w-6 bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`} />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  icon={HiChevronLeft}
                >
                  Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button size="sm" icon={HiChevronRight} onClick={() => setStep(s => s + 1)}>Next</Button>
                ) : (
                  <Button size="sm" variant="primary" onClick={onClose}>Get Started</Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
