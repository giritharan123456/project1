import { memo } from 'react';
import PropTypes from 'prop-types';

const Badge = memo(function Badge({ children, variant = 'default', size = 'sm', className = '', dot = false, pill = false, removable = false, onRemove }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    gradient: 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-sm',
    'gradient-amber': 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm',
    'gradient-emerald': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-sm', lg: 'px-3 py-1.5 text-sm' };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium transition-all duration-200 ${pill ? 'rounded-full' : 'rounded-lg'} ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' || variant === 'gradient-emerald' ? 'bg-emerald-500' : variant === 'warning' || variant === 'gradient-amber' ? 'bg-amber-500' : variant === 'danger' ? 'bg-red-500' : 'bg-current'}`} />}
      {children}
      {removable && (
        <button onClick={onRemove} aria-label="Remove" className="ml-0.5 hover:opacity-70 transition-opacity">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      )}
    </span>
  );
});

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  dot: PropTypes.bool,
  pill: PropTypes.bool,
  removable: PropTypes.bool,
  onRemove: PropTypes.func,
};

Badge.displayName = 'Badge';

export default Badge;
