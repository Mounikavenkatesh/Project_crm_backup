/**
 * LoadingSkeleton displays animated pulsing block layouts
 * representing cards and charts before data finishes loading.
 */
export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 6 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800/40 dark:bg-gray-800/50"
          >
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-8 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-3.5 w-12 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Row 1: Pie and Funnel Skeletons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-gray-800"
          >
            <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-1 h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-16 flex items-center justify-center">
              <div className="h-44 w-44 rounded-full border-[16px] border-slate-150 dark:border-slate-700/50" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Bar and Line Skeletons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-gray-700/60 dark:bg-gray-800"
          >
            <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-8 h-64 w-full rounded bg-slate-100 dark:bg-slate-800/30 flex items-end justify-between px-6 py-4">
              {Array.from({ length: 6 }).map((_, colIdx) => (
                <div
                  key={colIdx}
                  style={{ height: `${(colIdx + 2) * 15}%` }}
                  className="w-8 rounded-t bg-slate-200 dark:bg-slate-700"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
