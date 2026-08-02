import { memo } from 'react';
import PropTypes from 'prop-types';

function SkeletonComponent({ className = '', variant = 'rect', width, height, rounded = true }) {
  const base = `bg-gray-200 dark:bg-slate-700 animate-pulse ${rounded ? 'rounded-xl' : ''}`;
  const style = { width, height };
  if (variant === 'circle') {
    return <div className={`${base} rounded-full ${className}`} style={{ width: width || '2.5rem', height: height || '2.5rem', ...style }} />;
  }
  if (variant === 'text') {
    return <div className={`${base} h-4 ${className}`} style={{ width: width || '100%', ...style }} />;
  }
  return <div className={`${base} ${className}`} style={{ width: width || '100%', height: height || '6rem', ...style }} />;
}

const Skeleton = memo(SkeletonComponent);

Skeleton.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['rect', 'circle', 'text']),
  width: PropTypes.string,
  height: PropTypes.string,
  rounded: PropTypes.bool,
};

Skeleton.displayName = 'Skeleton';

export default Skeleton;

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-6 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/50 ${className}`}>
      <Skeleton variant="text" width="40%" className="mb-3" />
      <Skeleton variant="text" width="80%" className="mb-2" />
      <Skeleton variant="text" width="60%" className="mb-4" />
      <Skeleton variant="rect" height="3rem" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={className}>
      <div className="flex gap-4 mb-3 pb-2 border-b border-gray-100 dark:border-slate-700">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / cols}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 border-b border-gray-50 dark:border-slate-700/50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="text" width={`${100 / cols}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem', xl: '4rem', '2xl': '5rem' };
  return <Skeleton variant="circle" width={sizes[size]} height={sizes[size]} className={className} />;
}
