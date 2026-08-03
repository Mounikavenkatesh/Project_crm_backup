import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from './StatsCards';

/**
 * Custom Tooltip component.
 */
const RevenueTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none">
        <p className="font-bold text-gray-400">{data.fullName || data.name} Revenue</p>
        <p className="mt-1 text-emerald-400 font-extrabold text-sm">{formatINR(data.revenue)}</p>
      </div>
    );
  }
  return null;
};

/**
 * RevenueChartCard displays cumulative closed won revenue tracked over months.
 *
 * @param {object} props The component props.
 * @param {Array} props.data Pre-grouped revenue data [{ name, revenue }]
 * @returns {React.ReactNode} The rendered card.
 */
export default function RevenueChartCard({ data = [] }) {
  const hasRevenue = data.some((d) => d.revenue > 0);

  /**
   * Compact ticks formatter to show e.g. 50k, 1L etc.
   */
  const formatYAxis = (val) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    if (val >= 1000) {
      return `₹${(val / 1000).toFixed(0)}k`;
    }
    return `₹${val}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-[400px] transition-all duration-200 hover:shadow-md">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Revenue Analytics
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          Sum of won deal values grouped by month
        </p>
      </div>

      <div className="flex-1 mt-6 relative min-h-0">
        {!hasRevenue ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
              No won revenue logged for this period.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(229, 231, 235, 0.5)"
                className="dark:stroke-gray-700/50"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#22C55E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaGreenGradient)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
