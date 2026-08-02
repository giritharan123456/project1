import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../../components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders with variant classes', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const btn = container.querySelector('button');
    expect(btn.className).toContain('primary');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    const btn = container.querySelector('button');
    expect(btn.className).toContain('w-full');
  });
});
