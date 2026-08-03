import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Custom Tooltip overlay.
 */
const LineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none">
        <p className="font-bold text-gray-400">{data.fullName || data.name}</p>
        <p className="mt-1 text-emerald-400 font-bold">Conversion: {data.rate}%</p>
      </div>
    );
  }
  return null;
};

/**
 * LineChartCard displays monthly conversion percentage curves over the last 6 months.
 *
 * @param {object} props The component props.
 * @param {Array} props.data Pre-grouped monthly conversion data [{ name, rate }]
 * @returns {React.ReactNode} The rendered card.
 */
export default function LineChartCard({ data = [] }) {
  const hasHistory = data.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-[400px] transition-all duration-200 hover:shadow-md">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Monthly Conversion Trend
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          Won leads ratio plotted over the last 6 months
        </p>
      </div>

      <div className="flex-1 mt-6 relative min-h-0">
        {!hasHistory ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
              No historical conversion data to render trend.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="rate"
                name="Conversion Rate"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ fill: '#22C55E', stroke: '#22C55E', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
