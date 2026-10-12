import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FolderTree,
  Activity,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Heavy & Medium Commercial Trucks', categoryCode: 'TRUCKS' },
  { id: 2, name: 'Cargo & Delivery Vans', categoryCode: 'VANS' },
  { id: 3, name: 'Sport Utility Vehicles (SUVs)', categoryCode: 'SUVS' },
  { id: 4, name: 'Sedans & Compact Cars', categoryCode: 'CARS' },
  { id: 5, name: 'Passenger & Shuttle Buses', categoryCode: 'BUSES' },
  { id: 6, name: 'Electric Vehicles (EV Fleet)', categoryCode: 'EVS' },
  { id: 7, name: 'Two Wheelers & Motorcycles', categoryCode: 'TWO_WHEELERS' },
  { id: 8, name: 'Special Purpose Vehicles', categoryCode: 'SPECIAL_PURPOSE' },
];

export default function VehiclesPage() {
  const { user } = useAuth();
  const canRegister = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(user?.role);
  const canDelete = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);
  const canChangeCategory = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(user?.role);
  const canChangeStatus = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER'].includes(user?.role);

  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [newCategoryId, setNewCategoryId] = useState('1');
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    vin: '',
    licensePlate: '',
    make: '',
    model: '',
    yearManufactured: 2024,
    vehicleType: 'COMMERCIAL',
    categoryId: '1',
    capacityKg: 1500,
    passengerCapacity: 2,
    fuelType: 'DIESEL',
    currentOdometer: 10000,
    acquisitionDate: new Date().toISOString().slice(0, 10),
    acquisitionCost: 1500000,
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await api.get('/vehicles', { params });
      if (res.success && res.data) {
        setVehicles(res.data.content || []);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success && res.data && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn('Using default categories fallback:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [search, selectedStatus, selectedCategory]);

  const handleOpenAddModal = () => {
    setErrorMsg('');
    fetchCategories();
    setFormData((prev) => ({
      ...prev,
      categoryId: categories.length > 0 ? String(categories[0].id) : '1',
    }));
    setShowAddModal(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId, 10),
        yearManufactured: parseInt(formData.yearManufactured, 10),
        capacityKg: parseFloat(formData.capacityKg),
        currentOdometer: parseFloat(formData.currentOdometer),
        acquisitionCost: parseFloat(formData.acquisitionCost),
      };
      await api.post('/vehicles', payload);
      setShowAddModal(false);
      setFormData({
        vin: '',
        licensePlate: '',
        make: '',
        model: '',
        yearManufactured: 2024,
        vehicleType: 'COMMERCIAL',
        categoryId: '1',
        capacityKg: 1500,
        passengerCapacity: 2,
        fuelType: 'DIESEL',
        currentOdometer: 10000,
        acquisitionDate: new Date().toISOString().slice(0, 10),
        acquisitionCost: 1500000,
      });
      fetchVehicles();
    } catch (err) {
      const msg = err?.message || err?.error || (typeof err === 'string' ? err : 'Failed to register vehicle. Please check your inputs.');
      setErrorMsg(msg);
    }
  };

  const handleChangeCategory = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !newCategoryId) return;
    try {
      await api.patch(`/vehicles/${selectedVehicle.id}/category?categoryId=${newCategoryId}`);
      setShowCategoryModal(false);
      fetchVehicles();
    } catch (err) {
      alert(err.message || 'Failed to update category');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !newStatus) return;
    try {
      await api.patch(`/vehicles/${selectedVehicle.id}/status?status=${newStatus}`);
      setShowStatusModal(false);
      fetchVehicles();
    } catch (err) {
      alert(err.message || 'Failed to update vehicle status');
    }
  };

  const handleDelete = async (id, plate) => {
    if (!window.confirm(`Are you sure you want to deactivate/soft-delete vehicle ${plate}?`)) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      alert(err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Truck className="w-5 h-5 mr-2 text-emerald-400" />
            Vehicle Master Registry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage commercial fleet assets, dynamic category allocations, and real-time lifecycle states
          </p>
        </div>
        {canRegister && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center self-start transition-colors shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register New Vehicle
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by license plate, VIN, make, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="INACTIVE">Inactive</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchVehicles}
          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
          title="Refresh vehicles"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Vehicles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Vehicle / VIN</th>
                <th className="px-5 py-3.5">Make & Model</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Capacity & Fuel</th>
                <th className="px-5 py-3.5">Current Odometer</th>
                <th className="px-5 py-3.5">Operational Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    Loading vehicles registry...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No vehicles found matching current criteria.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white font-mono">{v.licensePlate}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{v.vin}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-slate-200 font-medium">
                        {v.make} {v.model}
                      </div>
                      <div className="text-[10px] text-slate-500">Year {v.yearManufactured}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {v.category?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>{v.capacityKg} kg</div>
                      <div className="text-[10px] text-emerald-400 font-medium">{v.fuelType}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-200">
                      {v.currentOdometer?.toLocaleString()} km
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      {/* Change Status Button - ADMIN, MANAGER, DISPATCHER */}
                      {canChangeStatus && (
                        <button
                          onClick={() => {
                            setSelectedVehicle(v);
                            setNewStatus(v.status);
                            setShowStatusModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors inline-flex items-center"
                          title="Change operational status"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Move Category Button - ADMIN, MANAGER */}
                      {canChangeCategory && (
                        <button
                          onClick={() => {
                            setSelectedVehicle(v);
                            setNewCategoryId(String(v.category?.id || '1'));
                            setShowCategoryModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors inline-flex items-center"
                          title="Move to another category"
                        >
                          <FolderTree className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Button - ADMIN ONLY */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(v.id, v.licensePlate)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors inline-flex items-center"
                          title="Deactivate / Soft-delete vehicle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Register Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center">
                <Truck className="w-5 h-5 mr-2 text-emerald-400" />
                Register New Fleet Vehicle
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">License Plate *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-03-AK-1993"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">VIN (Chassis Number) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAT4825TK1234567"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Make / Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Motors"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signa 4825.TK"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Vehicle Category *</label>
                  <select
                    required
                    value={String(formData.categoryId)}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)} className="bg-slate-900 text-white py-1">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="PETROL">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.yearManufactured}
                    onChange={(e) => setFormData({ ...formData, yearManufactured: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Payload (kg)</label>
                  <input
                    type="number"
                    value={formData.capacityKg}
                    onChange={(e) => setFormData({ ...formData, capacityKg: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData({ ...formData, currentOdometer: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-md shadow-emerald-950"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Activity className="w-4 h-4 mr-2 text-amber-400" />
                Update Vehicle Status
              </h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Set operational status for <span className="text-emerald-400 font-mono font-bold">{selectedVehicle?.licensePlate}</span>:
            </p>
            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="AVAILABLE">Available (Ready for Dispatch)</option>
                <option value="ASSIGNED">Assigned (Scheduled on Trip)</option>
                <option value="ON_TRIP">On Trip (In Transit)</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance (Workshop)</option>
                <option value="INACTIVE">Inactive (Off-Duty)</option>
                <option value="RETIRED">Retired (Decommissioned)</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-bold text-white flex items-center">
                <FolderTree className="w-4 h-4 mr-2 text-emerald-400" />
                Move Vehicle Category
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select target category for vehicle <span className="text-emerald-400 font-mono font-bold">{selectedVehicle?.licensePlate}</span>:
            </p>
            <form onSubmit={handleChangeCategory} className="space-y-4 text-xs">
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white py-1">
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Move Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
