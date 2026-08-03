import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar displays a debounced search input with magnifying glass and quick-clear action.
 *
 * @param {object} props The component props.
 * @param {string} props.value The current search query.
 * @param {Function} props.onChange Callback triggered with the debounced query.
 * @returns {React.ReactNode} The rendered search input.
 */
export default function SearchBar({ value = '', onChange }) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);

  // Synchronize local input state with props changes (e.g., if parent clears query)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    // Clear existing timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timer
    debounceRef.current = setTimeout(() => {
      onChange(newVal);
    }, 300);
  };

  const handleClear = () => {
    setLocalValue('');
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onChange('');
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
      </div>
      
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder="Search by name, company, or email..."
        aria-label="Search leads"
        className="block w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700/80 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
      />

      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
