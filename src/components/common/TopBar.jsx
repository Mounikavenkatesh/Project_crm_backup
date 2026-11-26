import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCheck,
  X,
  Settings,
  LogOut,
} from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../../context/AuthContext';
import leadService from '../../services/leadService';
import { notificationService } from '../../services/crmServices';
import StatusBadge from '../leads/StatusBadge';

export default function TopBar({ onOpenMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications({ limit: 10 });
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Silent fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await leadService.searchLeads(trimmed);
        if (res.success) {
          setSearchResults(res.data || []);
          setShowSearchDropdown(true);
        }
      } catch {
        setSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleMarkRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setShowNotifMenu(false);
      if (link) navigate(link);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/85 px-4 sm:px-6 lg:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
      {/* Left: Mobile Menu + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div ref={searchRef} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowSearchDropdown(true)}
            placeholder="Quick search leads by name, company, or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-800 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchResults([]);
                setShowSearchDropdown(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {showSearchDropdown && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 overflow-hidden z-40">
              {searchResults.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                  No matching leads found for "{query}"
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {searchResults.map((lead) => (
                    <li key={lead.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setQuery('');
                          navigate(`/leads?search=${encodeURIComponent(lead.name)}`);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {lead.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {lead.company} • {lead.email}
                          </p>
                        </div>
                        <StatusBadge status={lead.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme, Notifications, Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <DarkModeToggle />

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifMenu((prev) => !prev);
              if (!showNotifMenu) fetchNotifications();
            }}
            className="relative rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 z-40 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    You're all caught up!
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleMarkRead(n.id, n.link)}
                      className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-3 ${
                        !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                          !n.isRead ? 'bg-blue-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          title="Settings"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          <span className="max-w-[110px] truncate">{user?.name || 'Account'}</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="hidden sm:flex lg:hidden items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-500 hover:text-rose-600"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
