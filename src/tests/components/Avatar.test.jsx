import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Avatar from '../../components/ui/Avatar';

describe('Avatar', () => {
  it('renders initials when no src', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" name="John Doe" />);
    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('shows status indicator', () => {
    render(<Avatar name="John" status="online" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
