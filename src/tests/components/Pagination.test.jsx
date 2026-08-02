import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../../components/ui/Pagination';

describe('Pagination', () => {
  it('renders correct number of page buttons', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
  });

  it('calls onPageChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('disables prev button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });

  it('renders nothing for single page', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe('');
  });
});
