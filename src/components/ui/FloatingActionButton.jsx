import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const fabVariants = {
  open: { rotate: 45 },
  closed: { rotate: 0 },
};

const actionVariants = {
  open: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 },
  }),
  closed: {
    opacity: 0,
    y: 20,
    scale: 0.8,
    transition: { duration: 0.15 },
  },
};

export default function FloatingActionButton({ actions = [], icon: Icon, color = 'primary', position = 'bottom-right', ariaLabel = 'Quick actions' }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((p) => !p), []);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-24 right-6',
    'top-left': 'top-24 left-6',
  };

  const colorClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/30',
    secondary: 'bg-slate-600 hover:bg-slate-700 shadow-slate-500/30',
    danger: 'bg-red-600 hover:bg-red-700 shadow-red-500/30',
  };

  return (
    <div className={`fixed ${positionClasses[position] || positionClasses['bottom-right']} z-50 flex flex-col items-end gap-3`}>
      <AnimatePresence>
        {isOpen && actions.map((action, i) => (
          <motion.button
            key={action.label}
            custom={actions.length - 1 - i}
            variants={actionVariants}
            initial="closed"
            animate="open"
            exit="closed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { action.onClick?.(); setIsOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm font-medium whitespace-nowrap"
            aria-label={action.label}
          >
            {action.icon && <action.icon className="w-4 h-4" />}
            {action.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button
        variants={fabVariants}
        animate={isOpen ? 'open' : 'closed'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className={`w-14 h-14 rounded-full ${colorClasses[color] || colorClasses.primary} text-white flex items-center justify-center shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
        aria-label={isOpen ? 'Close quick actions' : ariaLabel}
        aria-expanded={isOpen}
      >
        <Icon className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

FloatingActionButton.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType,
    onClick: PropTypes.func,
  })),
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string,
  position: PropTypes.string,
  ariaLabel: PropTypes.string,
};

FloatingActionButton.displayName = 'FloatingActionButton';
