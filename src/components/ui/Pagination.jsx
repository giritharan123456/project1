import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { HiChevronLeft, HiChevronRight, HiDotsHorizontal } from 'react-icons/hi';

export default function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1, size = 'md' }) {
  const range = useMemo(() => {
    const totalNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalNumbers) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;
    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
      return [1, '...', ...rightRange];
    }
    const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [1, '...', ...middleRange, '...', totalPages];
  }, [currentPage, totalPages, siblingCount]);

  const handleChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  }, [currentPage, totalPages, onPageChange]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary-500`}
        aria-label="Previous page"
      >
        <HiChevronLeft className="w-4 h-4" />
      </button>
      {range.map((item, i) => {
        if (item === '...') {
          return (
            <span key={`dots-${i}`} className={`${sizeClasses[size]} flex items-center justify-center text-gray-400 dark:text-slate-500`}>
              <HiDotsHorizontal className="w-4 h-4" />
            </span>
          );
        }
        return (
          <button
            key={item}
            onClick={() => handleChange(item)}
            className={`${sizeClasses[size]} flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              item === currentPage
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            aria-current={item === currentPage ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        );
      })}
      <button
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${sizeClasses[size]} flex items-center justify-center rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-primary-500`}
        aria-label="Next page"
      >
        <HiChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Pagination.displayName = 'Pagination';
