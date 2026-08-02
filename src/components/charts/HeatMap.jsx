import PropTypes from 'prop-types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const HEAT_COLORS = [
  'bg-gray-100 dark:bg-slate-800',
  'bg-green-100 dark:bg-green-900/30',
  'bg-green-200 dark:bg-green-800/40',
  'bg-green-300 dark:bg-green-700/50',
  'bg-primary-200 dark:bg-primary-800/50',
  'bg-primary-300 dark:bg-primary-700/60',
  'bg-primary-400 dark:bg-primary-600/70',
  'bg-primary-500 dark:bg-primary-500/80',
  'bg-primary-600 dark:bg-primary-500',
];

function HeatMap({ data, title, badge, height = 200 }) {
  const badgeObj = typeof badge === 'string' ? { text: badge, variant: 'default' } : badge;
  const maxVal = Math.max(...data.flatMap((week) => week.values), 1);
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {badgeObj && <Badge variant={badgeObj.variant || 'default'}>{badgeObj.text}</Badge>}
      </div>
      <div className="overflow-x-auto" style={{ height }}>
        <div className="flex gap-1.5 min-w-max">
          <div className="flex flex-col gap-1.5 mr-2 pt-6">
            {dayLabels.map((day) => (
              <div key={day} className="h-6 flex items-center text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                {day}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {data.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1.5 items-center">
                <span className="text-[10px] text-gray-400 dark:text-slate-500 mb-1">{week.label}</span>
                {week.values.map((val, vi) => {
                  const intensity = Math.min(Math.floor((val / maxVal) * (HEAT_COLORS.length - 1)), HEAT_COLORS.length - 1);
                  return (
                    <div
                      key={vi}
                      className={`w-4 h-6 rounded-sm ${HEAT_COLORS[intensity]}`}
                      title={`${dayLabels[vi]}: ${val} meetings`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-gray-400 dark:text-slate-500">Less</span>
        {HEAT_COLORS.slice(0, 4).map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span className="text-[10px] text-gray-400 dark:text-slate-500">More</span>
      </div>
    </Card>
  );
}

HeatMap.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      values: PropTypes.arrayOf(PropTypes.number).isRequired,
    }),
  ).isRequired,
  title: PropTypes.string.isRequired,
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  height: PropTypes.number,
};

HeatMap.displayName = 'HeatMap';

export default HeatMap;