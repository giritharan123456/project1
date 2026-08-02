import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Toggle = memo(function Toggle({ enabled = false, onChange, label, disabled = false, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange?.(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
          enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-600'
        }`}
      >
        <motion.span
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="inline-block h-5 w-5 rounded-full bg-white shadow"
        />
      </button>
      {label && <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>}
    </label>
  );
});

Toggle.propTypes = {
  enabled: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Toggle.displayName = 'Toggle';

export default Toggle;
