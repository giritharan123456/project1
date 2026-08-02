import { forwardRef } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import PropTypes from 'prop-types';

const Select = forwardRef(({
  label, error, options, placeholder, className = '', ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            block w-full rounded-xl border bg-white dark:bg-slate-800
            px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-slate-100
            transition-colors duration-200 appearance-none
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}
            ${!props.value ? 'text-gray-400 dark:text-slate-500' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <HiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  })),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

Select.displayName = 'Select';
export default Select;
