import { memo } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import PropTypes from 'prop-types';

const SuccessState = memo(function SuccessState({
  title = 'Success!',
  message = 'Operation completed successfully.',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  icon: CustomIcon,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6"
      >
        {CustomIcon || <HiCheckCircle className="w-10 h-10 text-emerald-500" />}
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-slate-400 max-w-md mb-8">{message}</p>
      <div className="flex items-center gap-3">
        {actionLabel && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-200 dark:shadow-primary-900/30 transition-all hover:shadow-xl active:scale-95"
          >
            {actionLabel}
            <HiArrowRight className="w-4 h-4" />
          </button>
        )}
        {secondaryLabel && (
          <button
            onClick={onSecondary}
            className="px-6 py-2.5 text-gray-600 dark:text-slate-400 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
});

SuccessState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  secondaryLabel: PropTypes.string,
  onSecondary: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string,
};

SuccessState.displayName = 'SuccessState';

export default SuccessState;
