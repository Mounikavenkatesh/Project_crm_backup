import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * StatsCard displays a single high-level metric card with visual trend and details.
 *
 * @param {object} props The component props.
 * @param {string} props.title The metric title.
 * @param {string|number} props.value The current numeric or text value.
 * @param {React.ComponentType} props.icon The Lucide React icon component to render.
 * @param {number} props.change The percentage change compared to the previous period.
 * @param {string} props.color Theme color accent (e.g., 'blue', 'green', 'amber', 'red').
 * @returns {React.ReactNode} The rendered stats card.
 */
export default function StatsCard({ title, value, icon: Icon, change, color }) {
  const isPositive = change >= 0;

  // Determine styling based on color prop
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30',
    green: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
    amber: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30',
    red: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/30',
    purple: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30',
  };

  const badgeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${badgeColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
        </span>
        
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3 stroke-[3]" />
            ) : (
              <ArrowDownRight className="h-3 w-3 stroke-[3]" />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
