import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SOURCE_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip overlay.
 */
const SourceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none">
        <p className="font-bold text-gray-400">{data.name}</p>
        <p className="mt-1 text-white">Leads count: {data.count}</p>
        <p className="text-blue-400 font-bold mt-0.5">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

/**
 * LeadSourceChart displays lead counts by marketing sources in a horizontal layout.
 *
 * @param {object} props The component props.
 * @param {Array} props.data Pre-sorted lead source data [{ name, count, percentage }]
 * @returns {React.ReactNode} The rendered card.
 */
export default function LeadSourceChart({ data = [] }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-[400px] transition-all duration-200 hover:shadow-md">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Lead Source Analytics
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          Distribution and yield across marketing channels
        </p>
      </div>

      <div className="flex-1 mt-6 relative min-h-0">
        {!hasData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
              No lead source logs available.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="rgba(229, 231, 235, 0.5)"
                className="dark:stroke-gray-700/50"
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                width={80}
              />
              <Tooltip content={<SourceTooltip />} />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={18}
                animationDuration={800}
              >
                {data.map((entry, index) => {
                  const color = SOURCE_COLORS[entry.name] || '#3B82F6';
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
