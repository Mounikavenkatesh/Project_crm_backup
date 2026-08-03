import { Calendar } from 'lucide-react';

/**
 * AnalyticsFilters displays buttons to choose between date intervals,
 * and renders start/end inputs if 'Custom Range' is selected.
 *
 * @param {object} props The component props.
 * @param {string} props.filterType Active filter value ('7d' | '30d' | '90d' | 'ytd' | 'custom').
 * @param {Function} props.onFilterChange Callback when active button is clicked.
 * @param {object} props.customRange Object { startDate: string, endDate: string }
 * @param {Function} props.onCustomRangeChange Callback when custom date input values update.
 * @returns {React.ReactNode} The rendered filter selectors.
 */
export default function AnalyticsFilters({
  filterType,
  onFilterChange,
  customRange,
  onCustomRangeChange,
}) {
  const filterOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'ytd', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    onCustomRangeChange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters button list */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        {filterOptions.map((opt) => {
          const isActive = filterType === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onFilterChange(opt.value)}
              type="button"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition duration-150 focus:outline-none whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                  : 'bg-white border border-gray-250 text-gray-650 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render date ranges input fields only when 'custom' is active */}
      {filterType === 'custom' && (
        <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 p-4 rounded-2xl shadow-sm self-start animate-fade-in">
          <div>
            <label
              htmlFor="startDate"
              className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={customRange?.startDate || ''}
              onChange={handleCustomDateChange}
              className="mt-1 block rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="hidden sm:block text-gray-400 dark:text-gray-500 font-bold mt-3">
            →
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={customRange?.endDate || ''}
              onChange={handleCustomDateChange}
              className="mt-1 block rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
