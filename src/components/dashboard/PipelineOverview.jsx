import { LEAD_STATUSES, LEAD_STATUS_COLORS } from '../../constants';

/**
 * PipelineOverview displays a horizontal segmented bar representing the lead status distribution.
 *
 * @param {object} props The component props.
 * @param {Array} props.leads The array of all leads.
 * @returns {React.ReactNode} The rendered pipeline overview.
 */
export default function PipelineOverview({ leads = [] }) {
  const totalLeads = leads.length;

  // Count leads for each status
  const counts = Object.values(LEAD_STATUSES).reduce((acc, status) => {
    acc[status] = leads.filter((lead) => lead.status === status).length;
    return acc;
  }, {});

  // Sort statuses to make the bar flow logically from top-of-funnel (New) to bottom (Won/Lost)
  const orderedStatuses = [
    LEAD_STATUSES.NEW,
    LEAD_STATUSES.CONTACTED,
    LEAD_STATUSES.MEETING_SCHEDULED,
    LEAD_STATUSES.PROPOSAL_SENT,
    LEAD_STATUSES.WON,
    LEAD_STATUSES.LOST,
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Pipeline Status Overview
        </h3>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {totalLeads} {totalLeads === 1 ? 'Lead' : 'Leads'} Total
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mt-6">
        <div className="flex h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
          {totalLeads === 0 ? (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-600 transition-all duration-300" />
          ) : (
            orderedStatuses.map((status) => {
              const count = counts[status] || 0;
              const percentage = (count / totalLeads) * 100;
              if (count === 0) return null;
              
              // Custom hex colors mapping
              const colorInfo = LEAD_STATUS_COLORS[status];
              return (
                <div
                  key={status}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colorInfo.hex,
                  }}
                  className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-90 relative group"
                  title={`${status}: ${count} (${percentage.toFixed(0)}%)`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {orderedStatuses.map((status) => {
          const count = counts[status] || 0;
          const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
          const colorInfo = LEAD_STATUS_COLORS[status];
          
          return (
            <div
              key={status}
              className="flex flex-col rounded-xl border border-gray-100 dark:border-gray-700/40 p-3 bg-gray-50/50 dark:bg-gray-800/30 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: colorInfo.hex }}
                  className="h-2 w-2 rounded-full flex-shrink-0"
                />
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {status}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {count}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
