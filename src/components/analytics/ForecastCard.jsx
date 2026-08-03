import { LineChart, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { formatINR } from './StatsCards';

/**
 * ForecastCard shows a simple projected revenue calculation for the coming month.
 *
 * @param {object} props The component props.
 * @param {object} props.forecast The forecast metrics from useAnalytics hook.
 * @returns {React.ReactNode} The rendered forecast card.
 */
export default function ForecastCard({ forecast }) {
  const { forecastedRevenue = 0, confidenceScore = 0, growthTrend = 0 } = forecast || {};
  const isPositive = growthTrend >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-3">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Revenue Forecast
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Projected income for the upcoming month
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
            <LineChart className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Forecast Output */}
        <div className="mt-5">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
            Predicted Revenue Next Month
          </span>
          <span className="block text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            {formatINR(forecastedRevenue)}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Growth Trend and Confidence Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700/40 pt-4">
          {/* Growth Trend */}
          <div>
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Projected Growth
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />
                )}
                {Math.abs(growthTrend)}%
              </span>
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Confidence Index
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-xs text-slate-800 dark:text-gray-250">
              <Award className="h-4.5 w-4.5 text-blue-500" />
              <span>{confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
            <span>Prediction accuracy</span>
            <span>{confidenceScore}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div
              style={{ width: `${confidenceScore}%` }}
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
