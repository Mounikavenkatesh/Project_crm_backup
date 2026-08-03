import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

/**
 * Main App component. Set up routing wrapper, layout grid, and Toast container.
 */
export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Responsive Sidebar / Mobile Bottom Navbar (Protected only) */}
        {isAuthenticated && <Sidebar />}

        {/* Core page wrapper */}
        <div className={`${isAuthenticated ? 'md:pl-64 lg:pl-72' : ''} min-h-screen flex flex-col`}>
          <main className={`flex-1 px-4 py-8 w-full mx-auto ${
            isAuthenticated 
              ? 'pt-20 pb-24 md:pt-8 md:pb-8 md:px-8 max-w-7xl' 
              : 'py-12 md:py-20 max-w-lg'
          }`}>
            <AppRoutes />
          </main>
        </div>

        {/* Global Notifications Container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'font-medium rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 shadow-lg',
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}
