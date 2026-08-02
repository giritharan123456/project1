import { memo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const CHART_COLORS = {
  primary: '#6366f1',
};

const RadarChartCard = memo(function RadarChartCard({ data, title, badge, size = 220 }) {
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'default' } : badge;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badgeObj && <Badge variant={badgeObj.variant || 'default'}>{badgeObj.text}</Badge>}
      </div>
      <ResponsiveContainer width="100%" height={size}>
        <RadarChart data={data}>
          <PolarGrid className="stroke-gray-200 dark:stroke-slate-700" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
          <Radar
            dataKey="value"
            stroke={CHART_COLORS.primary}
            fill={CHART_COLORS.primary}
            fillOpacity={0.2}
            dot={{ r: 3, fill: CHART_COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
});

RadarChartCard.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  size: PropTypes.number,
};

RadarChartCard.displayName = 'RadarChartCard';

export default RadarChartCard;
