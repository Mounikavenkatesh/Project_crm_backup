/**
 * Loader component displays a centered, themed spinning indicator.
 */
export default function Loader() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400"></div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
        Loading workspace...
      </p>
    </div>
  );
}
