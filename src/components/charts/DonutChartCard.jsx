import { memo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

const DonutChartCard = memo(function DonutChartCard({ data, title, badge, size = 180 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.map((d, i) => ({ name: d.label, value: d.value, color: COLORS[i] }));
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'default' } : badge;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badgeObj && <Badge variant={badgeObj.variant || 'default'}>{badgeObj.text}</Badge>}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{total}</span>
              <p className="text-[10px] text-gray-500 dark:text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          {chartData.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs text-gray-600 dark:text-slate-400">{seg.name}</span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">{Math.round((seg.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

DonutChartCard.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  size: PropTypes.number,
};

DonutChartCard.displayName = 'DonutChartCard';

export default DonutChartCard;
