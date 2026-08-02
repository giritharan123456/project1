import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-violet-800 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl border border-white/20"
        >
          <HiSparkles className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 text-3xl sm:text-4xl font-bold text-white tracking-tight"
        >
          Connectly
        </motion.h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="mt-12 flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
        />
        <p className="text-sm font-medium text-white/60">Loading...</p>
      </motion.div>
    </div>
  );
}
