import { memo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const CHART_COLORS = {
  primary: '#6366f1',
  text: '#94a3b8',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600 dark:text-slate-300">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

const BarChartCard = memo(function BarChartCard({ data, labels, title, badge, height = 220, barColor = CHART_COLORS.primary }) {
  const chartData = data.map((val, i) => ({ name: labels?.[i] || '', value: val }));
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'default' } : badge;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badgeObj && <Badge variant={badgeObj.variant || 'default'}>{badgeObj.text}</Badge>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700/50" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: CHART_COLORS.text }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.text }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
});

BarChartCard.propTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.array,
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  height: PropTypes.number,
  barColor: PropTypes.string,
};

BarChartCard.displayName = 'BarChartCard';

export default BarChartCard;
