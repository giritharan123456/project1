import { memo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
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
        <p key={i} className="text-gray-600 dark:text-slate-300">{p.name}: {p.value}h</p>
      ))}
    </div>
  );
}

const LineChartCard = memo(function LineChartCard({ data, title, badge, height = 220 }) {
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'default' } : badge;
  const dataKey = Object.keys(data[0] || {}).find(k => k !== 'week' && k !== 'label' && k !== 'name') || 'value';

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badgeObj && <Badge variant={badgeObj.variant || 'default'}>{badgeObj.text}</Badge>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: CHART_COLORS.text }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: '#fff', stroke: CHART_COLORS.primary, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
});

LineChartCard.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  height: PropTypes.number,
};

LineChartCard.displayName = 'LineChartCard';

export default LineChartCard;
