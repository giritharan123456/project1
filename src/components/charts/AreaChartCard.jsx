import { memo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const CHART_COLORS = {
  fill: '#10b981',
  text: '#94a3b8',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-900 dark:text-white">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-gray-600 dark:text-slate-300">{p.name}: {p.value}%</p>
      ))}
    </div>
  );
}

const AreaChartCard = memo(function AreaChartCard({ data, title, badge, height = 220 }) {
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'default' } : badge;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badgeObj && <Badge variant={badgeObj.variant || 'default'}>{badgeObj.text}</Badge>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="areaChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.fill} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.fill} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: CHART_COLORS.text }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.fill}
            strokeWidth={2}
            fill="url(#areaChartGradient)"
            dot={{ r: 3, fill: '#fff', stroke: CHART_COLORS.fill, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
});

AreaChartCard.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  height: PropTypes.number,
};

AreaChartCard.displayName = 'AreaChartCard';

export default AreaChartCard;
