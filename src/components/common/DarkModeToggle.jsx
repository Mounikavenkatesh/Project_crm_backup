import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DarkModeToggle component provides a user interface to toggle the theme.
 * Uses custom animations and transitions with tailwind.
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative inline-flex h-10 w-20 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label="Toggle Dark Mode"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`${
          isDarkMode ? 'translate-x-10 bg-gray-900 text-yellow-400' : 'translate-x-0 bg-white text-gray-500'
        } pointer-events-none flex h-9 w-9 transform items-center justify-center rounded-full shadow-lg ring-0 transition duration-300 ease-in-out`}
      >
        {isDarkMode ? (
          <Moon className="h-5 w-5 fill-yellow-400 stroke-yellow-400" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </span>
    </button>
  );
}
