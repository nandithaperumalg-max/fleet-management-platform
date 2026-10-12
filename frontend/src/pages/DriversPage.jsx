import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, AlertTriangle, Phone, Mail, X } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function DriversPage() {
  const { user } = useAuth();
  const canManageDrivers = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(user?.role);

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseClass: 'HEAVY_COMMERCIAL',
    licenseExpiryDate: '2027-06-30',
    emergencyContact: '',
  });

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/drivers');
      if (res.success && res.data) {
        setDrivers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOnboard = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drivers', formData);
      setShowAddModal(false);
      fetchDrivers();
    } catch (err) {
      alert(err.message || 'Failed to onboard driver');
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Commercial Drivers Directory</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Driver eligibility guardrails, license validity tracking, and active assignments
          </p>
        </div>
        {canManageDrivers && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center self-start transition-colors shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Onboard Driver
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-500">Loading drivers...</div>
        ) : (
          drivers.map((d) => {
            const expired = isExpired(d.licenseExpiryDate);
            return (
              <div
                key={d.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-sm">
                      {d.user?.fullName ? d.user.fullName.substring(0, 2).toUpperCase() : 'DR'}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{d.user?.fullName}</h3>
                      <p className="text-[11px] text-slate-400">@{d.user?.username}</p>
                    </div>
                  </div>
                  <StatusBadge status={d.employmentStatus} />
                </div>

                <div className="mt-4 space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Commercial License:</span>
                    <span className="font-mono text-slate-200 font-semibold">{d.licenseNumber}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">License Class:</span>
                    <span className="text-slate-300">{d.licenseClass}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">License Expiry:</span>
                    <span
                      className={`font-mono font-medium ${
                        expired ? 'text-rose-400 font-bold' : 'text-slate-200'
                      }`}
                    >
                      {d.licenseExpiryDate}
                    </span>
                  </div>

                  {expired && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] flex items-center mt-2">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      License Expired — Blocked from Trips
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-slate-500" />
                      {d.phone}
                    </span>
                    <span className="text-slate-500">ICE: {d.emergencyContact || 'N/A'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Onboard Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Users className="w-4 h-4 mr-2 text-emerald-400" />
                Onboard Commercial Driver
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboard} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="driver_ramesh"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91-9880011223"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Commercial License #</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-0420230099881"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">License Class</label>
                  <select
                    value={formData.licenseClass}
                    onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="HEAVY_COMMERCIAL">Heavy Commercial (HCV)</option>
                    <option value="MEDIUM_VEHICLE">Medium Vehicle (MCV)</option>
                    <option value="LIGHT_VEHICLE">Light Vehicle (LMV)</option>
                    <option value="HAZMAT">Hazardous Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="Name & Contact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Onboard Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
