import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Alert from '../../components/common/Alert';

describe('Alert', () => {
  it('renders with success variant', () => {
    const { container } = render(<Alert variant="success" message="Success!" />);
    expect(container.querySelector('.text-green-500')).toBeInTheDocument();
  });

  it('renders with error variant', () => {
    const { container } = render(<Alert variant="error" message="Error!" />);
    expect(container.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('renders with title and message', () => {
    render(<Alert title="Title" message="Message" />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Alert className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
