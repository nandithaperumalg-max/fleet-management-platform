import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const config = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    IN_TRANSIT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    UNDER_MAINTENANCE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    COMPLETED: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    INACTIVE: 'bg-slate-700/30 text-slate-400 border-slate-700',
    INACTIVE_RETIRED: 'bg-slate-800 text-slate-500 border-slate-700',
    RETIRED: 'bg-slate-800 text-slate-500 border-slate-700',
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CRITICAL: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    NORMAL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    UPCOMING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    OVERDUE: 'bg-rose-600/20 text-rose-400 border-rose-500/40',
    OPEN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    IN_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const style = config[status] || 'bg-slate-700/20 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
