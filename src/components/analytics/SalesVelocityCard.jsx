import { Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatINR } from './StatsCards';

/**
 * SalesVelocityCard displays the velocity metrics showing revenue progression rate per day.
 *
 * @param {object} props The component props.
 * @param {number} props.velocity The computed daily sales velocity in INR.
 * @param {number} props.growth The percentage change compared to the previous cohort.
 * @returns {React.ReactNode} The rendered card.
 */
export default function SalesVelocityCard({ velocity = 0, growth = 0 }) {
  const isPositive = growth >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-3">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sales Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Theoretical revenue generated per day
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
            <Zap className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Large Metric */}
        <div className="mt-5">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatINR(velocity)}
            <span className="text-sm font-semibold text-slate-450 dark:text-gray-500">/day</span>
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3.5">
        {/* Trend Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-bold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-455'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
            ) : (
              <ArrowDownRight className="h-3 w-3 stroke-[3]" />
            )}
            {Math.abs(growth)}%
          </span>
          <span className="text-xs font-medium text-slate-650 dark:text-gray-400">
            vs previous period
          </span>
        </div>

        {/* Info formula caption */}
        <div className="rounded-xl bg-slate-50 dark:bg-gray-850/40 p-3 text-[11px] font-medium leading-relaxed text-slate-500 dark:text-gray-450 border border-slate-100 dark:border-gray-800">
          <span className="font-bold text-slate-600 dark:text-gray-300">Formula:</span> (Opportunities × Win Rate × Avg Deal Size) ÷ Sales Cycle Length. Velocity indicates overall sales pipeline performance.
        </div>
      </div>
    </div>
  );
}
