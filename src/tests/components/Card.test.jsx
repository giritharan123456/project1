import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from '../../components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Content</p></Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Card</Card>);
    expect(container.firstChild.className).toContain('custom-class');
  });

  it('renders without padding when padding=false', () => {
    const { container } = render(<Card padding={false}>No pad</Card>);
    expect(container.firstChild.className).not.toContain('p-');
  });
});
