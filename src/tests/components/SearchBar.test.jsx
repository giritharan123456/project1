import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchBar from '../../components/common/SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder', () => {
    render(<SearchBar placeholder="Search items..." />);
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<SearchBar onChange={handleChange} />);
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when value is present', () => {
    render(<SearchBar value="test" />);
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });
});
