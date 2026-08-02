import { memo } from 'react';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';

export const ToastContainer = memo(function ToastContainer({ position = 'top-right' }) {
  return (
    <Toaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#fff',
          color: '#0f172a',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }}
    />
  );
});

ToastContainer.propTypes = {
  position: PropTypes.oneOf(['top-left', 'top-right', 'top-center', 'bottom-left', 'bottom-right', 'bottom-center']),
};

ToastContainer.displayName = 'ToastContainer';
