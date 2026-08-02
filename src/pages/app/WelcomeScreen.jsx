import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiSparkles, HiVideoCamera, HiDesktopComputer,
  HiChatAlt, HiArrowRight,
  HiX,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const features = [
  {
    icon: HiVideoCamera,
    title: 'HD Video Meetings',
    desc: 'Crystal clear video calls',
    gradient: 'from-primary-500 to-blue-600',
    shadow: 'shadow-primary-500/25',
  },
  {
    icon: HiDesktopComputer,
    title: 'Screen Sharing',
    desc: 'Present with ease',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
  },
  {
    icon: HiChatAlt,
    title: 'Team Chat',
    desc: 'Stay connected',
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-500/25',
  },
  {
    icon: HiSparkles,
    title: 'AI Features',
    desc: 'Smart meeting insights',
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/25',
  },
];

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12 sm:py-16">
      <Helmet>
        <title>Welcome - AdzConnect</title>
        <meta name="description" content="Welcome to AdzConnect! Get started with video meetings, team chat, and collaboration tools." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-2xl mx-auto text-center"
      >
        <motion.div variants={itemVariants}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-primary-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/25"
          >
            <HiSparkles className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">
            Welcome to Connectly
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-slate-400 max-w-md mx-auto">
            Your collaborative meeting platform for seamless communication
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} hover padding={false}>
                <div className="p-5 flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} ${feature.shadow} flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{feature.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center gap-4">
          <Button size="lg" icon={HiArrowRight} onClick={() => navigate('/app/home')}>
            Get Started
          </Button>
          <button
            onClick={() => navigate('/app/home')}
            className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors inline-flex items-center gap-1"
          >
            <HiX className="w-4 h-4" />
            Skip Tour
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
