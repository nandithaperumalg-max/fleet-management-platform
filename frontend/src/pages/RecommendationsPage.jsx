import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Wrench, RefreshCw } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance/recommendations');
      if (res.success && res.data) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      await api.post('/maintenance/recommendations/evaluate');
      await fetchRecommendations();
    } catch (err) {
      console.warn('Evaluation trigger note:', err);
      // Still refresh existing recommendations
      await fetchRecommendations();
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
            AI & Rule-Based Maintenance Recommendations
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated recommendations based on mileage thresholds, service intervals, and vehicle conditions
          </p>
        </div>
        <button
          onClick={handleEvaluate}
          disabled={evaluating}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${evaluating ? 'animate-spin' : ''}`} />
          {evaluating ? 'Evaluating Fleet...' : 'Re-evaluate All Vehicles'}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center text-slate-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400/60" />
            <p className="text-sm font-medium text-slate-300">All vehicles in healthy operating condition!</p>
            <p className="text-xs text-slate-500 mt-1">No pending maintenance recommendations found for the fleet.</p>
          </div>
        ) : (
          recommendations.map((r) => (
            <div
              key={r.id}
              className={`p-5 rounded-xl border transition-all ${
                r.severity === 'CRITICAL'
                  ? 'bg-rose-500/5 border-rose-500/30 shadow-rose-950/20'
                  : r.severity === 'HIGH'
                  ? 'bg-amber-500/5 border-amber-500/30 shadow-amber-950/20'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 flex-wrap">
                    <span className="font-semibold text-white text-base">{r.title}</span>
                    <StatusBadge status={r.severity} />
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-emerald-400 border border-slate-700">
                      {r.vehicle?.licensePlate || 'Vehicle'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {r.vehicle?.make} {r.vehicle?.model}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 pt-1">{r.reason}</p>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs">
                  {r.projectedDueDate && (
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Projected Due</span>
                      <span className="font-mono text-slate-200">{r.projectedDueDate}</span>
                    </div>
                  )}
                  {r.projectedDueOdometer && (
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-400">Threshold Odo</span>
                      <span className="font-mono text-slate-200">{r.projectedDueOdometer.toLocaleString()} km</span>
                    </div>
                  )}
                  <a
                    href="/maintenance"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center transition-colors shadow-sm"
                  >
                    <Wrench className="w-3.5 h-3.5 mr-1" />
                    Create Work Order
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
