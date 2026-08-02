import { memo } from 'react';
import { HiExclamationCircle } from 'react-icons/hi';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import PropTypes from 'prop-types';

const ConfirmationDialog = memo(function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const isDanger = variant === 'danger';
  const role = isDanger ? 'alertdialog' : 'dialog';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" role={role}>
      <div className="text-center p-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          isDanger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-slate-800'
        }`}>
          <HiExclamationCircle className={`w-7 h-7 ${
            isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-slate-400'
          }`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning']),
  loading: PropTypes.bool,
};

ConfirmationDialog.displayName = 'ConfirmationDialog';

export default ConfirmationDialog;
