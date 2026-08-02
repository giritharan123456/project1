import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HiPlus } from 'react-icons/hi';
import FloatingActionButton from '../../components/ui/FloatingActionButton';

describe('FloatingActionButton', () => {
  const actions = [
    { label: 'New Meeting', icon: HiPlus, onClick: vi.fn() },
    { label: 'New Task', icon: HiPlus, onClick: vi.fn() },
  ];

  it('renders the FAB button', () => {
    render(<FloatingActionButton icon={HiPlus} actions={actions} />);
    expect(screen.getByLabelText('Quick actions')).toBeInTheDocument();
  });

  it('shows action list when clicked', () => {
    render(<FloatingActionButton icon={HiPlus} actions={actions} />);
    fireEvent.click(screen.getByLabelText('Quick actions'));
    expect(screen.getByText('New Meeting')).toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('calls action onClick when action is clicked', () => {
    render(<FloatingActionButton icon={HiPlus} actions={actions} />);
    fireEvent.click(screen.getByLabelText('Quick actions'));
    fireEvent.click(screen.getByText('New Meeting'));
    expect(actions[0].onClick).toHaveBeenCalled();
  });
});
