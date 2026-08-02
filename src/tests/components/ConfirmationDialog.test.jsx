import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

describe('ConfirmationDialog', () => {
  it('renders when isOpen is true', () => {
    render(<ConfirmationDialog isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmationDialog isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn();
    render(<ConfirmationDialog isOpen={true} onClose={vi.fn()} onConfirm={handleConfirm} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(handleConfirm).toHaveBeenCalledOnce();
  });

  it('calls onClose when cancel button clicked', () => {
    const handleClose = vi.fn();
    render(<ConfirmationDialog isOpen={true} onClose={handleClose} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalledOnce();
  });
});
