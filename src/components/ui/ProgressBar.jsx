import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const ProgressBar = memo(function ProgressBar({ value = 0, max = 100, size = 'md', variant = 'primary', showLabel = false, className = '' }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const sizes = { sm: 'h-1', md: 'h-2', lg: 'h-3', xl: 'h-4' };
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-violet-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-emerald-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-100 dark:bg-slate-700 rounded-full ${sizes[size]} overflow-hidden`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${colors[variant] || colors.primary} transition-all`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-slate-400">{value}/{max}</span>
          <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  );
});

ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info', 'gradient']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
