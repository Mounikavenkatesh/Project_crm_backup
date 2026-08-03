import StatusBadge from '../leads/StatusBadge';

/**
 * RecentLeads displays a tabular preview of the latest 5 added leads.
 *
 * @param {object} props The component props.
 * @param {Array} props.leads The array of all leads.
 * @returns {React.ReactNode} The rendered recent leads preview.
 */
export default function RecentLeads({ leads = [] }) {
  // Sort by createdAt descending and take the first 5 leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  /**
   * Helper to format ISO dates to a user-friendly style.
   *
   * @param {string} dateString The ISO date.
   * @returns {string} The formatted date.
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Recent Leads
        </h3>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Latest signups
        </span>
      </div>

      <div className="flex-1 overflow-x-auto mt-4">
        {recentLeads.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
              No leads added yet.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                <th className="pb-3 pr-4 font-semibold">Name</th>
                <th className="pb-3 px-4 font-semibold">Company</th>
                <th className="pb-3 px-4 font-semibold">Status</th>
                <th className="pb-3 pl-4 font-semibold text-right">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {recentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50/55 dark:hover:bg-gray-800/20"
                >
                  <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">
                    {lead.name}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                    {lead.company}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="py-3 pl-4 text-right text-gray-500 dark:text-gray-400 font-medium text-xs">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
