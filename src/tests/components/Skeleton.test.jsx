import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton, { SkeletonCard, SkeletonTable, SkeletonAvatar } from '../../components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders rect variant', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('renders text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.querySelector('.h-4')).toBeInTheDocument();
  });
});

describe('SkeletonCard', () => {
  it('renders multiple skeleton elements', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(3);
  });
});

describe('SkeletonTable', () => {
  it('renders correct number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} cols={3} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(9);
  });
});

describe('SkeletonAvatar', () => {
  it('renders circle skeleton', () => {
    const { container } = render(<SkeletonAvatar />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});
