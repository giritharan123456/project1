import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  label, error, icon: Icon, type = 'text', className = '', id, variant = 'default', ...props
}, ref) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            block w-full rounded-xl border bg-white dark:bg-slate-800
            px-4 py-2.5 text-sm text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            transition-all duration-200
            ${variant === 'glass'
              ? 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800'
              : 'bg-white dark:bg-slate-800'
            }
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 focus:shadow-lg focus:shadow-primary-500/10
            ${error ? 'border-red-500 focus:ring-red-500/40 focus:shadow-red-500/10' : 'border-gray-300 dark:border-slate-600'}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  type: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'glass']),
};

Input.displayName = 'Input';
export default Input;
