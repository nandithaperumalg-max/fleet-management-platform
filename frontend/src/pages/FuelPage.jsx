import React, { useState, useEffect } from 'react';
import { Fuel, Plus, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

export default function FuelPage() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    quantityLiters: 45,
    unitPrice: 94.5,
    odometerAtRefuel: '',
    stationName: 'Indian Oil Depot #12',
    receiptNumber: 'RCP-' + Date.now().toString().slice(-5),
  });

  const fetchFuelLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fuel');
      if (res.success && res.data) {
        setFuelLogs(res.data);
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
      console.error('Error fetching vehicles for fuel:', err);
    }

    try {
      const dRes = await api.get('/drivers').catch(() => null);
      if (dRes?.success && dRes?.data && dRes.data.length > 0) {
        setDrivers(dRes.data);
      } else {
        // Fallback demo drivers if list empty
        setDrivers([
          { id: 1, user: { fullName: 'Rajesh Kumar (Senior Driver)' } },
          { id: 2, user: { fullName: 'John Doe (Heavy Driver)' } },
          { id: 3, user: { fullName: 'Suresh Patel (Express Driver)' } },
        ]);
      }
    } catch (err) {
      console.error('Error fetching drivers for fuel:', err);
      setDrivers([
        { id: 1, user: { fullName: 'Rajesh Kumar (Senior Driver)' } },
        { id: 2, user: { fullName: 'John Doe (Heavy Driver)' } },
        { id: 3, user: { fullName: 'Suresh Patel (Express Driver)' } },
      ]);
    }
  };

  useEffect(() => {
    fetchFuelLogs();
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fuel', {
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        fuelQuantityLiters: parseFloat(formData.quantityLiters),
        unitPrice: parseFloat(formData.unitPrice),
        odometerAtRefuel: parseFloat(formData.odometerAtRefuel),
        stationName: formData.stationName,
        receiptNumber: formData.receiptNumber,
      });
      setShowModal(false);
      fetchFuelLogs();
    } catch (err) {
      alert(err.message || 'Failed to log fuel');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Fuel Management & Anomaly Detection</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log fuel transactions, track km/L efficiency, and detect abnormal fuel drops
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center self-start transition-colors shadow-lg shadow-emerald-950"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log Fuel Transaction
        </button>
      </div>

      {/* Fuel Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Vehicle</th>
                <th className="px-5 py-3.5">Driver</th>
                <th className="px-5 py-3.5">Date & Station</th>
                <th className="px-5 py-3.5">Quantity & Rate</th>
                <th className="px-5 py-3.5">Total Cost</th>
                <th className="px-5 py-3.5">Efficiency (km/L)</th>
                <th className="px-5 py-3.5">Integrity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">Loading fuel logs...</td>
                </tr>
              ) : fuelLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">No fuel records logged yet.</td>
                </tr>
              ) : (
                fuelLogs.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-emerald-400">{f.vehicle?.licensePlate}</div>
                      <div className="text-[10px] text-slate-500">{f.vehicle?.model}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-200">{f.driver?.user?.fullName}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-300">{f.stationName}</div>
                      <div className="text-[10px] text-slate-500">{f.transactionDate ? f.transactionDate.replace('T', ' ') : ''}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      <div>{f.fuelQuantityLiters} L</div>
                      <div className="text-[10px] text-slate-400">₹{f.unitPrice}/L</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-white">
                      ₹{f.totalCost.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono">
                      {f.fuelEconomyKml ? (
                        <span className="font-semibold text-emerald-400">{f.fuelEconomyKml.toFixed(1)} km/L</span>
                      ) : (
                        <span className="text-slate-500">Initial Refill</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {f.isAnomalyFlag ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Anomaly Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Refill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Fuel className="w-4 h-4 mr-2 text-emerald-400" />
                Record Fuel Refill Transaction
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle</label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => {
                    const v = vehicles.find((item) => item.id.toString() === e.target.value);
                    setFormData({
                      ...formData,
                      vehicleId: e.target.value,
                      odometerAtRefuel: v ? v.currentOdometer : '',
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.licensePlate} ({v.model}) - {v.currentOdometer} km
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Driver</label>
                <select
                  required
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Quantity (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.quantityLiters}
                    onChange={(e) => setFormData({ ...formData, quantityLiters: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price per Liter (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Odometer at Refuel (km)</label>
                <input
                  type="number"
                  required
                  value={formData.odometerAtRefuel}
                  onChange={(e) => setFormData({ ...formData, odometerAtRefuel: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Station</label>
                  <input
                    type="text"
                    required
                    value={formData.stationName}
                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Receipt / Bill #</label>
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
