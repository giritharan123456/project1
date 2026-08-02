import { memo } from 'react';
import PropTypes from 'prop-types';

const Table = memo(function Table({ columns = [], data = [], className = '', onRowClick }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead className="bg-gray-50 dark:bg-slate-800/50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key || i}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
          {data.map((row, ri) => (
            <tr
              key={row.id || ri}
              onClick={() => onRowClick?.(row)}
              className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors`}
            >
              {columns.map((col, ci) => (
                <td key={col.key || ci} className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string.isRequired,
    render: PropTypes.func,
  })),
  data: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
  onRowClick: PropTypes.func,
};

Table.displayName = 'Table';

export default Table;
