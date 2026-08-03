import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

/**
 * Provider component for AuthContext.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('crm-token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount if token exists in localStorage
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('crm-token');
      if (storedToken) {
        try {
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            setToken(storedToken);
          } else {
            // Token was invalid/expired, clear it
            localStorage.removeItem('crm-token');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('crm-token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  /**
   * Log in a user.
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('crm-token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register a new user.
   */
  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.register(name, email, password);
      if (response.success && response.data) {
        const { token: receivedToken, user: receivedUser } = response.data;
        localStorage.setItem('crm-token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return response;
      }
      throw new Error(response.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out current user and clear local storage credentials.
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('crm-token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
      // Force redirect to login page
      window.location.href = '/login';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume AuthContext.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
