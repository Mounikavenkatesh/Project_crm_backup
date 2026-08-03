import { useState } from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

/**
 * Custom active shape for the doughnut slices (expansion on hover).
 */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

/**
 * Custom Tooltip overlay matching Hubspot/Salesforce standard styling.
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none">
        <p className="font-bold text-gray-400">{data.name}</p>
        <p className="mt-1 text-white">{data.value} Leads</p>
        <p className="text-blue-400 font-bold mt-0.5">{data.percentage}%</p>
      </div>
    );
  }
  return null;
};

/**
 * PieChartCard displays status ratios in a doughnut format with hover expansion and center summaries.
 *
 * @param {object} props The component props.
 * @param {Array} props.data The status distribution array [{ name, value, percentage }]
 * @returns {React.ReactNode} The rendered card.
 */
export default function PieChartCard({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Filter out statuses with 0 leads to avoid rendering empty slices
  const chartData = data.filter((item) => item.value > 0);
  const totalLeads = data.reduce((acc, curr) => acc + curr.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  /**
   * Custom legend list renderer with count & percentage parameters.
   */
  const renderCustomLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 max-h-[120px] overflow-y-auto pr-1">
        {payload.map((entry, index) => {
          const { value, payload: itemData } = entry;
          return (
            <li key={`item-${index}`} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  style={{ backgroundColor: entry.color }}
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                />
                <span className="text-slate-650 dark:text-gray-300 truncate">{value}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="font-bold text-slate-850 dark:text-white">{itemData.value}</span>
                <span className="text-[10px] text-gray-405 dark:text-gray-500 font-medium">({itemData.percentage}%)</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-[400px] relative transition-all duration-200 hover:shadow-md">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Lead Status Distribution
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          Breakdown of lead pipelines by stages
        </p>
      </div>

      <div className="flex-1 mt-2 relative min-h-0">
        {totalLeads === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
              No leads to display distribution.
            </p>
          </div>
        ) : (
          <>
            {/* Center Label (Placed absolutely at center of container) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-90px] md:mt-[-85px]">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                {totalLeads}
              </span>
              <span className="text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase tracking-wider mt-1">
                Total Leads
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={chartData}
                  cx="50%"
                  cy="40%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  animationDuration={600}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
