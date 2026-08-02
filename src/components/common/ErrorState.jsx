import { memo } from 'react';
import { HiExclamationCircle } from 'react-icons/hi';
import Button from '../ui/Button';
import PropTypes from 'prop-types';

const ErrorState = memo(function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4">
        <HiExclamationCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
});

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

ErrorState.displayName = 'ErrorState';

export default ErrorState;
