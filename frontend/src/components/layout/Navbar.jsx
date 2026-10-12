import React, { useState, useEffect } from 'react';
import { Bell, LogOut, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h1 className="text-sm font-semibold text-slate-200">
          Fleet Maintenance & Vehicle Utilization Platform
        </h1>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3 mr-1" /> System Active
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Role Pill */}
        <div className="hidden md:flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
          <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          {user?.role ? user.role.replace('_', ' ') : 'USER'}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Logout
        </button>
      </div>
    </header>
  );
}
