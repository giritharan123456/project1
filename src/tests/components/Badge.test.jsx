import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../../components/ui/Badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders with dot indicator', () => {
    const { container } = render(<Badge dot>Online</Badge>);
    expect(container.querySelector('.w-1\\.5')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild;
    expect(badge.className).toContain('emerald');
  });
});
