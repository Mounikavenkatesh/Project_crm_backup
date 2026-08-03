import { Users, Award, Database, Wallet, Clock, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Format helper for Indian Rupee currency styling.
 */
const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Single KPI card inside StatsCards.
 */
function MiniStatsCard({ title, value, growth, icon: Icon, color, isPercentagePoints = false }) {
  const hasGrowth = growth !== undefined && !isNaN(growth);
  const isPositive = growth >= 0;

  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/30',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/30',
    amber: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/30',
    red: 'text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/30',
    purple: 'text-purple-600 bg-purple-50 border-purple-100 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-900/30',
  };

  const badgeColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
          {title}
        </span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${badgeColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        
        {hasGrowth && (
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-2.5 w-2.5 stroke-[3]" />
            ) : (
              <ArrowDownRight className="h-2.5 w-2.5 stroke-[3]" />
            )}
            {Math.abs(growth)}
            {isPercentagePoints ? 'pp' : '%'}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * StatsCards displays 6 high-level KPI cards in a responsive grid.
 *
 * @param {object} props The component props.
 * @param {object} props.stats Computed stats from useAnalytics.
 * @returns {React.ReactNode}
 */
export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
      <MiniStatsCard
        title="Total Leads"
        value={stats.totalLeads}
        growth={stats.totalLeadsGrowth}
        icon={Users}
        color="blue"
      />
      <MiniStatsCard
        title="Conversion Rate"
        value={`${stats.conversionRate}%`}
        growth={stats.conversionRateGrowth}
        icon={Award}
        color="green"
        isPercentagePoints={true}
      />
      <MiniStatsCard
        title="Pipeline Value"
        value={formatINR(stats.pipelineValue)}
        growth={stats.pipelineValueGrowth}
        icon={Database}
        color="purple"
      />
      <MiniStatsCard
        title="Won Revenue"
        value={formatINR(stats.wonRevenue)}
        growth={stats.wonRevenueGrowth}
        icon={Wallet}
        color="green"
      />
      <MiniStatsCard
        title="Sales Cycle"
        value={`${stats.salesCycle} Days`}
        growth={stats.salesCycleGrowth !== 0 ? stats.salesCycleGrowth : undefined}
        icon={Clock}
        color="amber"
      />
      <MiniStatsCard
        title="Lost Rate"
        value={`${stats.lostRate}%`}
        growth={stats.lostRateGrowth}
        icon={XCircle}
        color="red"
        isPercentagePoints={true}
      />
    </div>
  );
}
export { formatINR };
