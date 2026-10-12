import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-lg shadow-rose-950/40">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
        HTTP 403 Forbidden
      </span>

      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
        Access Denied
      </h1>

      <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
        You do not have the required role or permissions to view this resource.
        Your current role is{' '}
        <span className="font-semibold text-emerald-400">
          {user?.role ? user.role.replace('_', ' ') : 'Unknown'}
        </span>.
      </p>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
      </div>
    </div>
  );
}
