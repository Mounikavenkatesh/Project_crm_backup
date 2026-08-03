import { FunnelChart, Funnel, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { STATUS_COLORS } from '../../constants/analyticsColors';

/**
 * Custom Tooltip for Funnel stages.
 */
const FunnelTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-gray-950/95 text-white border border-slate-800/40 p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none">
        <p className="font-bold text-gray-400">{data.name}</p>
        <p className="mt-1 text-white">Leads: {data.count}</p>
        <p className="text-emerald-400 mt-0.5">Conversion: {data.conversionRate}%</p>
        <p className="text-rose-400 mt-0.5">Drop-off: {data.dropoffRate}%</p>
      </div>
    );
  }
  return null;
};

/**
 * FunnelChartCard visualizes the stages from initial lead creation to final closure.
 * Shows conversion rates and drop-off counts.
 *
 * @param {object} props The component props.
 * @param {Array} props.data The funnel stages metrics array.
 * @returns {React.ReactNode} The rendered card.
 */
export default function FunnelChartCard({ data = [] }) {
  const totalLeads = data[0]?.count || 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-[400px] transition-all duration-200 hover:shadow-md">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Sales Funnel Analysis
        </h3>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
          Cumulative conversion performance through sales stages
        </p>
      </div>

      <div className="flex-1 mt-4 flex gap-6 min-h-0">
        {totalLeads === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">
              No leads to display sales funnel.
            </p>
          </div>
        ) : (
          <>
            {/* Left side: Recharts Funnel visualization */}
            <div className="flex-1 min-w-0 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <Tooltip content={<FunnelTooltip />} />
                  <Funnel
                    dataKey="count"
                    data={data}
                    isAnimationActive
                    lastShapeType="rounded"
                  >
                    <LabelList
                      position="right"
                      fill="#64748B"
                      stroke="none"
                      dataKey="conversionRate"
                      formatter={(val) => `${val}%`}
                      className="text-[10px] font-bold fill-slate-500 dark:fill-gray-400"
                    />
                    {data.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={STATUS_COLORS[entry.name] || '#94A3B8'}
                      />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>

            {/* Right side: Detailed Conversion list */}
            <div className="w-1/3 flex flex-col justify-center gap-3 flex-shrink-0">
              {data.map((stage) => {
                return (
                  <div key={stage.name} className="flex flex-col text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-gray-250">
                      <span className="flex items-center gap-1.5 truncate">
                        <span
                          style={{ backgroundColor: STATUS_COLORS[stage.name] || '#94A3B8' }}
                          className="h-2 w-2 rounded-full flex-shrink-0"
                        />
                        {stage.name}
                      </span>
                      <span>{stage.count}</span>
                    </div>
                    
                    {/* Tiny percentage progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden mt-1 relative">
                      <div
                        style={{
                          width: `${stage.conversionRate}%`,
                          backgroundColor: STATUS_COLORS[stage.name] || '#94A3B8',
                        }}
                        className="h-full rounded-full transition-all duration-300"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500 font-bold mt-1 uppercase">
                      <span>Conv: {stage.conversionRate}%</span>
                      <span>Drop: {stage.dropoffRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
