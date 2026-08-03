import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

/**
 * NotFound page displays a clean 404 error with navigation back to Dashboard.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400 mb-6 border border-rose-100 dark:border-rose-900/40">
        <span className="text-4xl font-extrabold">404</span>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 text-base text-gray-500 dark:text-gray-400 max-w-md">
        Sorry, we couldn’t find the page you’re looking for. Perhaps it has been moved or doesn't exist.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
