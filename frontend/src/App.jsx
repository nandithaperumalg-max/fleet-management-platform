import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import CategoriesPage from './pages/CategoriesPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import FuelPage from './pages/FuelPage';
import MaintenancePage from './pages/MaintenancePage';
import SparePartsPage from './pages/SparePartsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import NotificationsPage from './pages/NotificationsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import AuditPage from './pages/AuditPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import RoleBasedRoute from './components/common/RoleBasedRoute';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading FleetOps...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Routes>
            {/* Dashboard - All Authenticated Roles */}
            <Route path="/" element={<DashboardPage />} />

            {/* Vehicles - ADMIN, SUPER_ADMIN, FLEET_MANAGER, DISPATCHER */}
            <Route
              path="/vehicles"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER']}>
                  <VehiclesPage />
                </RoleBasedRoute>
              }
            />

            {/* Categories - ADMIN, SUPER_ADMIN, FLEET_MANAGER */}
            <Route
              path="/categories"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER']}>
                  <CategoriesPage />
                </RoleBasedRoute>
              }
            />

            {/* Drivers - ADMIN, SUPER_ADMIN, FLEET_MANAGER, DISPATCHER */}
            <Route
              path="/drivers"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER']}>
                  <DriversPage />
                </RoleBasedRoute>
              }
            />

            {/* Trips & Dispatch - All Roles */}
            <Route path="/trips" element={<TripsPage />} />

            {/* Fuel Management - ADMIN, SUPER_ADMIN, FLEET_MANAGER */}
            <Route
              path="/fuel"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER']}>
                  <FuelPage />
                </RoleBasedRoute>
              }
            />

            {/* Maintenance - ADMIN, SUPER_ADMIN, FLEET_MANAGER */}
            <Route
              path="/maintenance"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER']}>
                  <MaintenancePage />
                </RoleBasedRoute>
              }
            />

            {/* Spare Parts - ADMIN, SUPER_ADMIN, FLEET_MANAGER */}
            <Route
              path="/spare-parts"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER']}>
                  <SparePartsPage />
                </RoleBasedRoute>
              }
            />

            {/* Recommendations - ADMIN, SUPER_ADMIN, FLEET_MANAGER, DISPATCHER */}
            <Route
              path="/recommendations"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER']}>
                  <RecommendationsPage />
                </RoleBasedRoute>
              }
            />

            {/* Notifications - All Roles */}
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Complaints - All Roles */}
            <Route path="/complaints" element={<ComplaintsPage />} />

            {/* Audit Trail - ADMIN, SUPER_ADMIN */}
            <Route
              path="/audit"
              element={
                <RoleBasedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AuditPage />
                </RoleBasedRoute>
              }
            />

            {/* Access Denied (403) Page */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading FleetOps...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route: redirect to appropriate role dashboard if already authenticated */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'DRIVER' || user?.role === 'DISPATCHER' ? '/trips' : '/'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Root Route /: Shows LoginPage as the default entry screen when unauthenticated */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <ProtectedLayout />
          )
        }
      />

      {/* Protected Routes for all other operational paths */}
      <Route
        path="/*"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : (
            <ProtectedLayout />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
