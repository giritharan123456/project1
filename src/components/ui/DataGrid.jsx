import { memo, useState, useMemo } from 'react';
import { HiChevronUp, HiChevronDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import PropTypes from 'prop-types';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    return [1, ...range, totalPages];
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700" aria-label="Pagination">
      <p className="text-sm text-gray-500 dark:text-slate-400">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 dark:text-slate-400"
          aria-label="Previous page"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-500 dark:text-slate-400"
          aria-label="Next page"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

const DataGrid = memo(function DataGrid({ columns, data, pageSize = 10, sortable = true, onRowClick, loading, emptyMessage = 'No data available' }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortColumn, sortDirection, sortable]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const pageData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (col) => {
    if (!sortable || !col.sortable !== false) return;
    if (sortColumn === col.key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col.key);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider text-left ${
                    sortable && col.sortable !== false ? 'cursor-pointer hover:text-gray-700 dark:hover:text-slate-300 select-none' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortable && col.sortable !== false && sortColumn === col.key && (
                      sortDirection === 'asc' ? <HiChevronUp className="w-3 h-3" /> : <HiChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-400 dark:text-slate-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              pageData.map((row, i) => (
                <tr
                  key={row.id || i}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-gray-50 dark:border-slate-700/50 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-slate-300">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
});

DataGrid.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageSize: PropTypes.number,
  sortable: PropTypes.bool,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
};

DataGrid.displayName = 'DataGrid';

export default DataGrid;
