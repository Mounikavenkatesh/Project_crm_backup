import { BarChart3, Plus } from 'lucide-react';

/**
 * EmptyAnalyticsState renders when there are no leads inside the system.
 * Contains CTA to trigger lead creation.
 *
 * @param {object} props The component props.
 * @param {Function} props.onAddLead Callback to trigger lead creation form.
 * @returns {React.ReactNode} The rendered empty page.
 */
export default function EmptyAnalyticsState({ onAddLead }) {
  return (
    <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-gray-800 p-8 text-center bg-white dark:bg-gray-850/10 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 mb-6 border border-blue-100 dark:border-blue-900/30">
        <BarChart3 className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        No analytics available yet
      </h3>
      
      <p className="mt-2.5 text-sm text-slate-600 dark:text-gray-400 max-w-sm">
        Add your first lead to start tracking business performance, conversion ratios, and forecasted revenue.
      </p>

      <div className="mt-8">
        <button
          onClick={onAddLead}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition duration-150 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>
    </div>
  );
}
