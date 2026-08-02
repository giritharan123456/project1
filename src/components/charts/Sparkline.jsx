import { memo } from 'react';
import PropTypes from 'prop-types';

const Sparkline = memo(function Sparkline({ data, color = '#6366f1', height = 32 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" className="w-full" style={{ height }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="opacity-70"
      />
    </svg>
  );
});

Sparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  color: PropTypes.string,
  height: PropTypes.number,
};

Sparkline.displayName = 'Sparkline';

export default Sparkline;
