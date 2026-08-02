import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiSearch, HiHome, HiArrowLeft,
  HiVideoCamera, HiChat, HiCalendar,
  HiQuestionMarkCircle,
} from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Helmet } from 'react-helmet-async';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const quickLinks = [
  { label: 'Meetings', icon: HiVideoCamera, href: '/app/home', color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  { label: 'Chat', icon: HiChat, href: '/app/chat', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Calendar', icon: HiCalendar, href: '/app/calendar', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
      <Helmet>
        <title>Page Not Found - AdzConnect</title>
        <meta name="description" content="The page you are looking for does not exist. Return to the AdzConnect homepage." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-lg mx-auto text-center"
      >
        <motion.div variants={itemVariants}>
          <div className="relative inline-block">
            <div className="text-[8rem] sm:text-[10rem] font-black bg-gradient-to-br from-primary-400 via-primary-500 to-violet-600 bg-clip-text text-transparent leading-none select-none">
              404
            </div>
            <motion.div
              initial={{ rotate: 0, scale: 0 }}
              animate={{ rotate: 360, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
              className="absolute -top-2 -right-4 sm:-top-4 sm:-right-8"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                <HiQuestionMarkCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Page not found</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400 text-sm sm:text-base">
            The page you're looking for doesn't exist
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <Card padding={false} className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700">
              <Input
                placeholder="Search for pages, meetings, or people..."
                icon={HiSearch}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <Button icon={HiHome} onClick={() => navigate('/app/home')}>Go Home</Button>
          <Button variant="outline" icon={HiArrowLeft} onClick={() => navigate(-1)}>Go Back</Button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Quick Links</p>
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl ${link.bg} hover:shadow-sm transition-all duration-200`}
                >
                  <Icon className={`w-5 h-5 ${link.color}`} />
                  <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{link.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
