import React, { useState, useEffect } from 'react';
import { Shield, User, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const fetchLogs = async (page = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, size: 20 });
      if (search) params.append('tableName', search);
      const res = await api.get(`/audit?${params}`);
      if (res.success && res.data) {
        setLogs(res.data.content || []);
        setPagination({
          page: res.data.number || 0,
          totalPages: res.data.totalPages || 1,
          totalElements: res.data.totalElements || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(currentPage); }, [currentPage]);

  const actionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE': return 'text-emerald-400';
      case 'UPDATE': return 'text-amber-400';
      case 'DELETE': return 'text-rose-400';
      case 'STATUS_CHANGE': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const actionBg = (action) => {
    switch (action?.toUpperCase()) {
      case 'CREATE': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'UPDATE': return 'bg-amber-500/10 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 border-rose-500/20';
      case 'STATUS_CHANGE': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-emerald-400" />
          Audit Trail & Activity Log
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Complete chronological record of all fleet management operations, modifications, and system events
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs">
        <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400">Total Records:</span>
          <span className="ml-1.5 font-mono font-bold text-white">{pagination.totalElements.toLocaleString()}</span>
        </div>
        <div className="flex-1">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by table (vehicles, trips…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(0); fetchLogs(0); } }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Table</th>
                <th className="px-5 py-3.5">Record ID</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Performed By</th>
                <th className="px-5 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-12 text-slate-500">No audit records found.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                      {log.createdAt?.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-slate-300">
                        {log.tableName}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-400">#{log.recordId}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${actionBg(log.action)} ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {log.performedByUser ? (
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-300">{log.performedByUser.username}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">System</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-500 text-[11px]">{log.ipAddress || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-800 px-5 py-3 flex items-center justify-between text-xs text-slate-400">
            <span>Page {pagination.page + 1} of {pagination.totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />Prev
              </button>
              <button
                disabled={currentPage >= pagination.totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-colors flex items-center"
              >
                Next<ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
