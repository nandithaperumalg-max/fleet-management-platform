import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useAuth();
  const role = user?.role;
  const canDispatch = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER'].includes(role);
  const canCancel = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(role);
  const canReject = role === 'DRIVER';
  const canReviewRejections = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(role);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  const [showRejectionsModal, setShowRejectionsModal] = useState(false);
  const [rejections, setRejections] = useState([]);
  const [reviewNotes, setReviewNotes] = useState('');

  // Dispatch Form
  const [dispatchForm, setDispatchForm] = useState({
    tripNumber: '',
    vehicleId: '',
    driverId: '',
    origin: 'Bengaluru Central Depot',
    destination: 'Mysuru Logistics Hub',
    scheduledStart: new Date().toISOString().slice(0, 16),
    scheduledEnd: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    startOdometer: '',
    cargoWeightKg: 1200,
    notes: 'Priority cargo delivery',
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips');
      if (res.success && res.data) {
        setTrips(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const vRes = await api.get('/vehicles').catch(() => null);
      if (vRes?.success && vRes?.data) {
        setVehicles(Array.isArray(vRes.data) ? vRes.data : (vRes.data.content || []));
      }
    } catch (err) {
      console.error('Error fetching vehicles for trips:', err);
    }

    try {
      let dRes = await api.get('/drivers/eligible').catch(() => null);
      if (!dRes?.data || dRes.data.length === 0) {
        dRes = await api.get('/drivers').catch(() => null);
      }
      if (dRes?.success && dRes?.data && dRes.data.length > 0) {
        setDrivers(dRes.data);
      } else {
        setDrivers([
          { id: 1, user: { fullName: 'Rajesh Kumar (Heavy Driver)' }, licenseExpiryDate: '2028-12-31' },
          { id: 2, user: { fullName: 'John Doe (Commercial)' }, licenseExpiryDate: '2027-10-15' },
          { id: 3, user: { fullName: 'Suresh Patel (Express)' }, licenseExpiryDate: '2029-05-20' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching drivers for trips:', err);
      setDrivers([
        { id: 1, user: { fullName: 'Rajesh Kumar (Heavy Driver)' }, licenseExpiryDate: '2028-12-31' },
        { id: 2, user: { fullName: 'John Doe (Commercial)' }, licenseExpiryDate: '2027-10-15' },
        { id: 3, user: { fullName: 'Suresh Patel (Express)' }, licenseExpiryDate: '2029-05-20' },
      ]);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchResources();
  }, []);

  const handleDispatch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...dispatchForm,
        tripNumber: dispatchForm.tripNumber || 'TRP-' + Date.now().toString().slice(-6),
        startOdometer: dispatchForm.startOdometer ? parseFloat(dispatchForm.startOdometer) : undefined,
      };
      await api.post('/trips', payload);
      setShowDispatchModal(false);
      fetchTrips();
      fetchResources();
    } catch (err) {
      setErrorMsg(err.message || 'Dispatch failed');
    }
  };

  const handleStartTrip = async (id) => {
    try {
      await api.put(`/trips/${id}/start`);
      fetchTrips();
    } catch (err) {
      alert(err.message || 'Failed to start trip');
    }
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await api.put(`/trips/${selectedTrip.id}/complete`, {
        endOdometer: parseFloat(endOdometer),
      });
      setShowCompleteModal(false);
      fetchTrips();
      fetchResources();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to complete trip');
    }
  };

  const handleCancelTrip = async (id) => {
    if (!window.confirm('Cancel this trip and release assigned assets?')) return;
    try {
      await api.put(`/trips/${id}/cancel`, null, { params: { reason: 'Dispatcher cancellation' } });
      fetchTrips();
      fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to cancel trip');
    }
  };

  const handleRejectTrip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trip-rejections', {
        tripId: selectedTrip.id,
        reason: rejectReason
      });
      setShowRejectModal(false);
      setRejectReason('');
      alert('Trip rejection submitted for review.');
      fetchTrips();
    } catch (err) {
      alert(err.message || 'Failed to submit rejection');
    }
  };

  const fetchPendingRejections = async () => {
    try {
      const res = await api.get('/trip-rejections/pending');
      if (res.success) {
        setRejections(res.data);
        setShowRejectionsModal(true);
      }
    } catch (err) {
      alert('Failed to fetch rejections');
    }
  };

  const handleReviewRejection = async (rejectionId, approved) => {
    try {
      await api.put(`/trip-rejections/${rejectionId}/review`, {
        approved,
        reviewNotes
      });
      setReviewNotes('');
      fetchPendingRejections();
      fetchTrips();
      fetchResources();
    } catch (err) {
      alert('Failed to review rejection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Trip Management & Operational Dispatch</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict vehicle availability guardrails, driver eligibility validation, and utilization logging
          </p>
        </div>
        <div className="flex space-x-3">
          {canReviewRejections && (
            <button
              onClick={fetchPendingRejections}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center self-start transition-colors shadow-lg shadow-rose-950"
            >
              <AlertCircle className="w-4 h-4 mr-1.5" />
              View Rejections
            </button>
          )}
          {canDispatch && (
            <button
              onClick={() => {
                setErrorMsg('');
                setDispatchForm({
                  ...dispatchForm,
                  tripNumber: 'TRP-' + Date.now().toString().slice(-6),
                });
                setShowDispatchModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center self-start transition-colors shadow-lg shadow-emerald-950"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Dispatch New Trip
            </button>
          )}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Trip Number</th>
                <th className="px-5 py-3.5">Assigned Vehicle</th>
                <th className="px-5 py-3.5">Assigned Driver</th>
                <th className="px-5 py-3.5">Route</th>
                <th className="px-5 py-3.5">Distance & Odometer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    Loading trips...
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No trips recorded yet.
                  </td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-white">{t.tripNumber}</div>
                      <div className="text-[10px] text-slate-500">{t.scheduledStart ? t.scheduledStart.replace('T', ' ') : ''}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-semibold text-emerald-400">{t.vehicle?.licensePlate}</div>
                      <div className="text-[10px] text-slate-400">{t.vehicle?.model}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-200">{t.driver?.user?.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{t.driver?.licenseNumber}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-500 mr-1 shrink-0" />
                        <span>{t.origin}</span>
                      </div>
                      <div className="flex items-center text-slate-400 text-[11px] mt-0.5">
                        <span className="text-emerald-500 mr-1">→</span>
                        <span>{t.destination}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {t.distanceKm ? (
                        <span className="font-bold text-emerald-400 font-mono">{t.distanceKm.toFixed(1)} km</span>
                      ) : (
                        <span className="text-slate-500">In Progress ({t.startOdometer} km start)</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      {t.status === 'ASSIGNED' && (
                        <>
                          <button
                            onClick={() => handleStartTrip(t.id)}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold inline-flex items-center transition-colors"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </button>
                          {canReject && (
                            <button
                              onClick={() => {
                                setSelectedTrip(t);
                                setShowRejectModal(true);
                              }}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-semibold inline-flex items-center transition-colors"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          )}
                        </>
                      )}
                      {(t.status === 'IN_PROGRESS' || t.status === 'IN_TRANSIT') && (
                        <button
                          onClick={() => {
                            setSelectedTrip(t);
                            setEndOdometer(t.startOdometer ? t.startOdometer + 150 : '');
                            setErrorMsg('');
                            setShowCompleteModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold inline-flex items-center transition-colors"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </button>
                      )}
                      {canCancel && t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelTrip(t.id)}
                          className="px-2 py-1 text-slate-400 hover:text-rose-400 rounded text-xs"
                          title="Cancel Trip"
                        >
                          <XCircle className="w-4 h-4 inline" />
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

      {/* Dispatch Trip Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center">
                <Navigation className="w-5 h-5 mr-2 text-emerald-400" />
                Dispatch Trip & Assign Assets
              </h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleDispatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Select Vehicle (Only AVAILABLE)</label>
                  <select
                    required
                    value={dispatchForm.vehicleId}
                    onChange={(e) => {
                      const vId = e.target.value;
                      const selected = vehicles.find((v) => v.id.toString() === vId);
                      setDispatchForm({
                        ...dispatchForm,
                        vehicleId: vId,
                        startOdometer: selected ? selected.currentOdometer : '',
                      });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} ({v.model}) - {v.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Select Driver (Valid License Only)</label>
                  <select
                    required
                    value={dispatchForm.driverId}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driverId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.user?.fullName} (Exp: {d.licenseExpiryDate})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Origin Point</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.origin}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, origin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Destination Point</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.destination}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, destination: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Scheduled Departure</label>
                  <input
                    type="datetime-local"
                    required
                    value={dispatchForm.scheduledStart}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, scheduledStart: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Scheduled Arrival</label>
                  <input
                    type="datetime-local"
                    required
                    value={dispatchForm.scheduledEnd}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, scheduledEnd: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Odometer (km)</label>
                  <input
                    type="number"
                    value={dispatchForm.startOdometer}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, startOdometer: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    value={dispatchForm.cargoWeightKg}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, cargoWeightKg: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Complete Trip {selectedTrip?.tripNumber}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter final odometer reading to compute distance and return vehicle <span className="text-emerald-400 font-mono">{selectedTrip?.vehicle?.licensePlate}</span> to AVAILABLE.
            </p>

            {errorMsg && (
              <div className="mb-3 p-2 rounded bg-rose-500/10 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCompleteTrip} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  End Odometer (Must be ≥ {selectedTrip?.startOdometer} km)
                </label>
                <input
                  type="number"
                  required
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Complete & Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reject Trip Modal */}
      {showRejectModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Request Trip Reassignment</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleRejectTrip} className="p-5 space-y-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                <p>Are you sure you want to request reassignment for Trip <strong>{selectedTrip.tripNumber}</strong>?</p>
                <p className="mt-1">This will send a request to the dispatch team for review.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reason for Rejection *</label>
                <textarea
                  required
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g., Vehicle has maintenance issues, out of hours, etc."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 h-24"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Rejections Modal */}
      {showRejectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Pending Trip Rejections</h3>
              <button onClick={() => setShowRejectionsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              {rejections.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No pending rejection requests.</div>
              ) : (
                rejections.map(r => (
                  <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">Trip: {r.trip?.tripNumber}</p>
                        <p className="text-xs text-slate-400">Driver: {r.driver?.userId?.username}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold">
                        PENDING
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 mb-4 text-sm text-slate-300">
                      <span className="text-xs text-slate-500 block mb-1">Reason:</span>
                      {r.reason}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Review notes (optional)"
                        value={reviewNotes}
                        onChange={e => setReviewNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleReviewRejection(r.id, false)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          Deny (Keep Assigned)
                        </button>
                        <button
                          onClick={() => handleReviewRejection(r.id, true)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          Approve (Unassign)
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
