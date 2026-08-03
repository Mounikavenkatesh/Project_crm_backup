import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

// Lazy load pages for code splitting and better loading performance
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Leads = lazy(() => import('../pages/Leads'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));

/**
 * ProtectedRoute component blocks access to users who are not logged in.
 * Renders an Outlet if authenticated, otherwise redirects to /login.
 */
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * PublicRoute component blocks logged-in users from seeing Auth views like Login/Register.
 * Renders an Outlet if guest, otherwise redirects to dashboard / (home).
 */
function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

/**
 * AppRoutes defines the mapping of URLs to page components.
 * Configures protection barriers for secure dashboard access.
 */
export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Protected Dashboard Workspace */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>

        {/* Guest Authentication Pages */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Fallback 404 handler */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
