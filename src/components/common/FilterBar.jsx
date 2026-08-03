import { LEAD_STATUSES } from '../../constants';

/**
 * FilterBar displays a row of pill buttons to select a status filter.
 * Shows total lead counts for each state.
 *
 * @param {object} props The component props.
 * @param {string} props.activeFilter The current active filter name ('All' or status).
 * @param {Function} props.onFilterChange Callback when a filter is clicked.
 * @param {Array} props.leads The raw list of leads to compute counts.
 * @returns {React.ReactNode} The rendered filter bar.
 */
export default function FilterBar({ activeFilter, onFilterChange, leads = [] }) {
  const filterOptions = [
    { value: 'All', label: 'All' },
    ...Object.values(LEAD_STATUSES).map((status) => ({
      value: status,
      label: status,
    })),
  ];

  /**
   * Helper to count leads matching each filter option.
   *
   * @param {string} filterVal The option value.
   * @returns {number} The count.
   */
  const getCount = (filterVal) => {
    if (filterVal === 'All') {
      return leads.length;
    }
    return leads.filter((lead) => lead.status === filterVal).length;
  };

  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
      {filterOptions.map((opt) => {
        const isActive = activeFilter === opt.value;
        const count = getCount(opt.value);

        return (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            type="button"
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition duration-200 focus:outline-none whitespace-nowrap ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                isActive
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
