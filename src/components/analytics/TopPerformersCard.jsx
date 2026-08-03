import { Trophy, Medal } from 'lucide-react';
import { formatINR } from './StatsCards';

/**
 * TopPerformersCard shows a ranked leaderboard of sales reps based on won revenue.
 *
 * @param {object} props The component props.
 * @param {Array} props.performers Array of performers [{ name: string, revenue: number }]
 * @returns {React.ReactNode} The rendered card.
 */
export default function TopPerformersCard({ performers = [] }) {
  // Take top 5 performers
  const topPerformers = performers.slice(0, 5);

  /**
   * Returns a custom badge based on rep rank position.
   */
  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30">
            <Trophy className="h-4 w-4" />
          </div>
        );
      case 1:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500 dark:bg-slate-800/40 dark:border-slate-700/30">
            <Medal className="h-4 w-4 text-slate-400" />
          </div>
        );
      case 2:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-orange-600 dark:bg-orange-950/20 dark:border-orange-900/30">
            <Medal className="h-4 w-4 text-orange-500" />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-100 text-xs font-bold text-gray-400 dark:border-gray-800/50 dark:text-gray-500">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-full justify-between transition-all duration-200 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-3">
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Top Performers
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Ranked by total won deal value
            </p>
          </div>
        </div>

        {/* Leaderboard list */}
        <div className="mt-5 space-y-4">
          {topPerformers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-sm text-gray-450 dark:text-gray-500 font-medium">
                No performance data available.
              </p>
            </div>
          ) : (
            topPerformers.map((rep, index) => (
              <div
                key={rep.name}
                className="flex items-center justify-between p-2.5 rounded-xl border border-gray-50/50 hover:bg-gray-50/40 dark:border-transparent dark:hover:bg-gray-850/40 transition duration-150"
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(index)}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      {rep.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Rank {index + 1}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatINR(rep.revenue)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
