import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Custom Tooltip component.
 */
const BarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none">
        <p className="font-bold text-gray-400">{data.fullName || data.name}</p>
        <p className="mt-1 text-white font-bold">{data.count} Leads</p>
      </div>
    );
  }
  return null;
};

/**
 * BarChartCard displays lead registration volume trends over the last 6 months.
 *
 * @param {object} props The component props.
 * @param {Array} props.data Pre-grouped array of months [{ name, count }]
 * @returns {React.ReactNode} The rendered card.
 */
export default function BarChartCard({ data = [] }) {
  const hasLeads = data.some((d) => d.count > 0);

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-[400px] transition-all duration-200 hover:shadow-md">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Monthly Leads Volume
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          New lead signups tracked over the last 6 months
        </p>
      </div>

      <div className="flex-1 mt-6 relative min-h-0">
        {!hasLeads ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
              No registration logs to display monthly counts.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barBlueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.4} />
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
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                allowDecimals={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(229, 231, 235, 0.2)' }} />
              <Bar
                dataKey="count"
                fill="url(#barBlueGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
