import { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * Context for managing the dark/light theme state.
 */
export const ThemeContext = createContext(null);

/**
 * Provider component for ThemeContext.
 *
 * @param {object} props The component props.
 * @param {React.ReactNode} props.children The child components.
 * @returns {React.ReactNode} The provider wrapper.
 */
export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('startup-crm-theme', false);

  // Sync theme class with HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Toggles between dark and light modes.
   */
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to consume ThemeContext.
 *
 * @returns {{isDarkMode: boolean, toggleTheme: Function}} The theme context values.
 * @throws {Error} If used outside of ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
