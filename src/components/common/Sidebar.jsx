import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, ShieldAlert } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

/**
 * Sidebar component that acts as a left sidebar on desktop/tablet
 * and a bottom navigation bar on mobile.
 */
export default function Sidebar() {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      subLabel: 'Overview & pipeline',
      icon: LayoutDashboard,
    },
    {
      to: '/leads',
      label: 'Leads',
      subLabel: 'Manage contacts',
      icon: Users,
    },
    {
      to: '/analytics',
      label: 'Analytics',
      subLabel: 'Growth & insights',
      icon: BarChart3,
    },
  ];

  return (
    <>
      {/* Mobile Top Header (Fixed at the top on mobile only) */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:hidden transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md shadow-blue-500/20">
            S
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
            Startup CRM Lite
          </span>
        </div>
        <DarkModeToggle />
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed at the bottom on mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:hidden transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`
              }
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop/Tablet Left Sidebar */}
      <aside className="fixed bottom-0 top-0 left-0 z-20 hidden md:flex flex-col border-r border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 transition-all duration-300 md:w-64 lg:w-72">
        {/* Sidebar Header */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-gray-100 dark:border-gray-800/60">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/35">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 dark:text-white text-base leading-tight tracking-tight">
              Startup CRM Lite
            </span>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50/70 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-gray-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{item.label}</span>
                      {/* Sub-label shown on larger desktops */}
                      <span className="hidden lg:block text-xs text-gray-400 dark:text-gray-500 mt-0.5 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">
                        {item.subLabel}
                      </span>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Dark Mode Toggle */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 p-6">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Theme
            </span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">
              Light / Dark
            </span>
          </div>
          <DarkModeToggle />
        </div>
      </aside>
    </>
  );
}
