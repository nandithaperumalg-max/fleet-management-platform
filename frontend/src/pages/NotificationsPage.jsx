import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, CheckCircle, AlertTriangle, Info, Zap, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const canBroadcast = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(role);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    priority: 'INFO',
    category: 'GENERAL',
    targetAudience: 'EVERYONE'
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notifications/broadcast', broadcastForm);
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', priority: 'INFO', category: 'GENERAL', targetAudience: 'EVERYONE' });
      fetchNotifications();
    } catch (err) {
      alert('Failed to broadcast notification');
    }
  };

  const priorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL': return <Zap className="w-4 h-4 text-rose-400" />;
      case 'HIGH':
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'MEDIUM': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <CheckCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const priorityBorderClass = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'border-rose-500/40 bg-rose-500/5';
      case 'HIGH':
      case 'WARNING': return 'border-amber-500/30 bg-amber-500/5';
      case 'MEDIUM': return 'border-blue-500/20 bg-blue-500/5';
      default: return 'border-slate-700 bg-slate-900';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Bell className="w-5 h-5 mr-2 text-emerald-400" />
            System Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
                {unreadCount} New
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fleet alerts, fuel anomaly detections, inventory warnings, and maintenance advisories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {canBroadcast && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center shadow-lg shadow-emerald-900/20"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Broadcast Alert
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center transition-colors"
            >
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
            No notifications yet. Fleet operations are running normally.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`border p-4 rounded-xl flex items-start space-x-4 transition-colors ${
                n.isRead ? 'border-slate-800 bg-slate-900/60 opacity-70' : priorityBorderClass(n.priority)
              }`}
            >
              <div className="mt-0.5 shrink-0">{priorityIcon(n.priority)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm font-semibold ${n.isRead ? 'text-slate-400' : 'text-white'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {n.createdAt ? n.createdAt.replace('T', ' ').slice(0, 16) : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {n.eventCategory || 'SYSTEM'}
                  </span>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Broadcast Alert</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleBroadcast} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target Audience</label>
                <select
                  value={broadcastForm.targetAudience}
                  onChange={e => setBroadcastForm({ ...broadcastForm, targetAudience: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="EVERYONE">Everyone</option>
                  <option value="DRIVER">Drivers</option>
                  <option value="DISPATCHER">Dispatchers</option>
                  <option value="FLEET_MANAGER">Fleet Managers</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={broadcastForm.category}
                  onChange={e => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="SAFETY">Safety</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OPERATIONS">Operations</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={broadcastForm.priority}
                    onChange={e => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Message</label>
                <textarea
                  required
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 h-24"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
