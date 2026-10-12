import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Play, CheckCircle, Calendar, Lightbulb, X, AlertCircle } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

export default function MaintenancePage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [rules, setRules] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work-orders');
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    ruleId: '',
    serviceType: 'PREVENTIVE',
    priority: 'MEDIUM',
    description: 'Scheduled preventive maintenance as per fleet management protocol.',
    scheduledDate: new Date().toISOString().slice(0, 10),
    laborRatePerHour: 50,
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [woRes, ruleRes, vRes, recRes] = await Promise.all([
        api.get('/maintenance/work-orders'),
        api.get('/maintenance/rules'),
        api.get('/vehicles'),
        api.get('/maintenance/recommendations'),
      ]);
      if (woRes.success && woRes.data) setWorkOrders(woRes.data.content || []);
      if (ruleRes.success && ruleRes.data) setRules(ruleRes.data);
      if (vRes.success && vRes.data) setVehicles(vRes.data.content || []);
      if (recRes.success && recRes.data) setRecommendations(recRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.post('/maintenance/work-orders', formData);
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create work order');
    }
  };

  const handleStart = async (id) => {
    try {
      await api.put(`/maintenance/work-orders/${id}/start`);
      fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to start work order');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/maintenance/work-orders/${id}/complete`, {
        laborHours: 4.5,
        downtimeHours: 8.0,
        partsUsed: [],
      });
      fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to complete work order');
    }
  };

  const handleRunEngine = async () => {
    try {
      await api.post('/maintenance/recommendations/evaluate');
      fetchAll();
      alert('Fleet evaluation completed. Recommendations updated.');
    } catch (err) {
      alert('Failed to run evaluation engine');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Preventive Maintenance & Work Orders</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule services, track work orders, manage spare part usage, and monitor recommendations
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRunEngine}
            className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center transition-colors"
          >
            <Lightbulb className="w-4 h-4 mr-1.5" />
            Run Recommendation Engine
          </button>
          <button
            onClick={() => { setErrorMsg(''); setShowModal(true); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center transition-colors shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Work Order
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-medium">
        {['work-orders', 'recommendations', 'rules'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 capitalize transition-colors ${
              activeTab === tab
                ? 'text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.replace('-', ' ')}
            {tab === 'recommendations' && recommendations.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px]">
                {recommendations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Work Orders Table */}
      {activeTab === 'work-orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Work Order No.</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Service Type</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Scheduled Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-12 text-slate-500">Loading work orders...</td></tr>
                ) : workOrders.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-12 text-slate-500">No work orders scheduled yet.</td></tr>
                ) : (
                  workOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-white">{wo.workOrderNo}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-emerald-400">{wo.vehicle?.licensePlate}</div>
                        <div className="text-[10px] text-slate-500">{wo.vehicle?.model}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{wo.serviceType?.replace('_', ' ')}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={wo.priority} /></td>
                      <td className="px-5 py-3.5 font-mono text-slate-300">{wo.scheduledDate}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={wo.status} /></td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {wo.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleStart(wo.id)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold inline-flex items-center"
                          >
                            <Play className="w-3 h-3 mr-1" />Start
                          </button>
                        )}
                        {wo.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleComplete(wo.id)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold inline-flex items-center"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations Panel */}
      {activeTab === 'recommendations' && (
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-500">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No pending recommendations. Fleet is within service thresholds.
            </div>
          ) : (
            recommendations.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-amber-500/20 p-4 rounded-xl flex items-start space-x-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{r.title}</span>
                    <StatusBadge status={r.severity} />
                    <span className="text-xs font-mono text-emerald-400">{r.vehicle?.licensePlate}</span>
                  </div>
                  <p className="text-xs text-slate-400">{r.reason}</p>
                  {r.projectedDueDate && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Projected due: <span className="text-slate-300 font-mono">{r.projectedDueDate}</span>
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Maintenance Rules */}
      {activeTab === 'rules' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Service Code</th>
                <th className="px-5 py-3.5">Service Name</th>
                <th className="px-5 py-3.5">Interval (km)</th>
                <th className="px-5 py-3.5">Interval (days)</th>
                <th className="px-5 py-3.5">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{r.serviceCode}</td>
                  <td className="px-5 py-3.5 font-medium text-white">{r.serviceName}</td>
                  <td className="px-5 py-3.5 font-mono">{r.intervalKm?.toLocaleString()} km</td>
                  <td className="px-5 py-3.5 font-mono">{r.intervalDays} days</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isCritical ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {r.isCritical ? 'CRITICAL' : 'ROUTINE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Wrench className="w-4 h-4 mr-2 text-emerald-400" />
                Create Maintenance Work Order
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle</label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.licensePlate} — {v.make} {v.model} ({v.status})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Service Type</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="PREVENTIVE">Preventive</option>
                    <option value="CORRECTIVE_REPAIR">Corrective Repair</option>
                    <option value="ROUTINE_INSPECTION">Routine Inspection</option>
                    <option value="EMERGENCY_BREAKDOWN">Emergency Breakdown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Maintenance Rule (Optional)</label>
                <select
                  value={formData.ruleId}
                  onChange={(e) => setFormData({ ...formData, ruleId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">None / Ad-hoc Service</option>
                  {rules.map((r) => (
                    <option key={r.id} value={r.id}>{r.serviceCode} — {r.serviceName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Labor Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={formData.laborRatePerHour}
                    onChange={(e) => setFormData({ ...formData, laborRatePerHour: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg">Create Work Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
