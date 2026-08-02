import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus } from 'react-icons/hi';
import PropTypes from 'prop-types';

const SpeedDial = memo(function SpeedDial({ actions = [], direction = 'up', icon, className = '' }) {
  const [open, setOpen] = useState(false);
  const dirClasses = {
    up: 'bottom-full right-0 mb-2 flex-col',
    down: 'top-full right-0 mt-2 flex-col-reverse',
    left: 'right-full top-0 mr-2 flex-row',
    right: 'left-full top-0 ml-2 flex-row-reverse',
  };
  const itemAnim = {
    up: (i) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04 } }),
    down: (i) => ({ initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04 } }),
    left: (i) => ({ initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.04 } }),
    right: (i) => ({ initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.04 } }),
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <AnimatePresence>
        {open && (
          <div className={`absolute flex items-center gap-2 ${dirClasses[direction]} mb-2`}>
            {actions.map((action, i) => (
              <motion.button
                key={i}
                {...itemAnim[direction](i)}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { action.onClick?.(); setOpen(false); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 whitespace-nowrap transition-colors"
              >
                {action.icon && <span className="text-gray-500">{action.icon}</span>}
                {action.label}
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95"
        aria-label="Quick actions"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {icon || <HiPlus className="w-5 h-5" />}
        </motion.span>
      </button>
    </div>
  );
});

SpeedDial.propTypes = {
  actions: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.node,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  })),
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right']),
  icon: PropTypes.node,
  className: PropTypes.string,
};

SpeedDial.displayName = 'SpeedDial';

export default SpeedDial;
