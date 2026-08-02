import { memo } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi';
import PropTypes from 'prop-types';

const icons = {
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamationCircle,
  info: HiInformationCircle,
};

const variantStyles = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

const iconStyles = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
  info: 'text-blue-500 dark:text-blue-400',
};

const Alert = memo(function Alert({ variant = 'info', title, message, className = '' }) {
  const Icon = icons[variant] || icons.info;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${variantStyles[variant]} ${className}`} role="alert">
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconStyles[variant]}`} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-sm">{title}</p>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
    </div>
  );
});

Alert.propTypes = {
  variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string,
  message: PropTypes.string,
  className: PropTypes.string,
};

Alert.displayName = 'Alert';

export default Alert;
