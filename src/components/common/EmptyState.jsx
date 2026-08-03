import { Inbox, RefreshCw } from 'lucide-react';

/**
 * EmptyState displays a visual cue when the list is empty,
 * with context-dependent advice (no leads at all vs zero matching filters).
 *
 * @param {object} props The component props.
 * @param {boolean} props.isFilterActive True if there's an active query/filter.
 * @param {Function} props.onClear Callback to clear the active search & filters.
 * @returns {React.ReactNode} The rendered empty state.
 */
export default function EmptyState({ isFilterActive, onClear }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center bg-white dark:bg-gray-850/10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-5">
        <Inbox className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {isFilterActive ? 'No matching leads found' : 'Your pipeline is empty'}
      </h3>
      
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {isFilterActive
          ? 'Try adjusting your search terms or clearing your filters to see more leads.'
          : 'Get started by creating a new lead using the "Add Lead" button.'}
      </p>

      {isFilterActive && (
        <div className="mt-6">
          <button
            onClick={onClear}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear active filters
          </button>
        </div>
      )}
    </div>
  );
}
