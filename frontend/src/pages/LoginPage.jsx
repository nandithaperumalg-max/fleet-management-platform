import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(username, password);
      if (userData?.role === 'DRIVER') {
        navigate('/trips');
      } else if (userData?.role === 'DISPATCHER') {
        navigate('/trips');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        {/* Brand */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">FleetOps</h1>
            <p className="text-xs text-slate-400">Enterprise Fleet Management Platform</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. admin"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-900/30"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Quick Switcher */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Demo Accounts (Click to Fill &amp; Sign In)
          </p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className={`p-2 bg-slate-800/60 hover:bg-slate-800 border ${username === 'admin' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-700'} rounded-lg text-slate-300 text-left transition-colors`}
            >
              <div className="font-bold text-emerald-400">Admin</div>
              <div className="text-[10px] text-slate-500">admin / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager', 'admin123')}
              className={`p-2 bg-slate-800/60 hover:bg-slate-800 border ${username === 'manager' ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-slate-700'} rounded-lg text-slate-300 text-left transition-colors`}
            >
              <div className="font-bold text-blue-400">Manager</div>
              <div className="text-[10px] text-slate-500">manager / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('dispatcher1', 'admin123')}
              className={`p-2 bg-slate-800/60 hover:bg-slate-800 border ${username === 'dispatcher1' ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-slate-700'} rounded-lg text-slate-300 text-left transition-colors`}
            >
              <div className="font-bold text-purple-400">Dispatcher</div>
              <div className="text-[10px] text-slate-500">dispatcher1 / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('driver_john', 'FleetDriver@101')}
              className={`p-2 bg-slate-800/60 hover:bg-slate-800 border ${username === 'driver_john' ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-slate-700'} rounded-lg text-slate-300 text-left transition-colors`}
            >
              <div className="font-bold text-amber-400">Driver</div>
              <div className="text-[10px] text-slate-500">driver_john / FleetDriver@101</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
