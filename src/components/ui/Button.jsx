import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/25 focus-visible:ring-primary-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 focus-visible:ring-gray-400',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20 focus-visible:ring-primary-500',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 focus-visible:ring-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25 focus-visible:ring-red-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25 focus-visible:ring-emerald-500',
  gradient: 'bg-gradient-to-r from-primary-600 to-violet-600 text-white hover:from-primary-700 hover:to-violet-700 shadow-lg shadow-primary-500/30 focus-visible:ring-primary-500',
  'gradient-amber': 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 focus-visible:ring-amber-500',
  'gradient-emerald': 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 focus-visible:ring-emerald-500',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const Button = forwardRef(({
  children, variant = 'primary', size = 'md', className = '', icon: Icon,
  iconPosition = 'left', loading = false, disabled = false, fullWidth = false,
  type = 'button', 'aria-label': ariaLabel, ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4" />
      )}
    </motion.button>
  );
});

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.string,
  'aria-label': PropTypes.string,
};

Button.displayName = 'Button';
export default Button;
