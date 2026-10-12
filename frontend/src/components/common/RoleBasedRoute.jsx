import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleBasedRoute: guards a route by checking whether current user's role is in allowedRoles.
 * If not authenticated, redirects to /login.
 * If authenticated but role not allowed, renders /access-denied.
 */
export default function RoleBasedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    const hasAccess = allowedRoles.includes(userRole);
    if (!hasAccess) {
      return <Navigate to="/access-denied" replace />;
    }
  }

  return children;
}
