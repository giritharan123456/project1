import { Component } from 'react';
import PropTypes from 'prop-types';
import { HiExclamationTriangle } from 'react-icons/hi2';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
          <HiExclamationTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {this.props.title || 'Something went wrong'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 max-w-md">
            {this.props.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry?.();
            }}
          >
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
};
