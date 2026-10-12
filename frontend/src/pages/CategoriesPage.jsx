import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryCode, setCategoryCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', { categoryCode, name, description });
      setShowAddModal(false);
      setCategoryCode('');
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/categories/${id}/toggle-status`);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Vehicle Category Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamically classify vehicles (Trucks, SUVs, Vans, EVs, etc.) with real-time asset counts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center self-start transition-colors shadow-lg shadow-emerald-950"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center py-12 text-slate-500">Loading categories...</div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-emerald-400">
                    {c.categoryCode}
                  </span>
                  <button
                    onClick={() => handleToggle(c.id)}
                    className="text-xs"
                    title="Toggle active status"
                  >
                    {c.isActive ? (
                      <span className="inline-flex items-center text-emerald-400 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500 text-[11px]">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Inactive
                      </span>
                    )}
                  </button>
                </div>
                <h3 className="text-base font-bold text-white">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description || 'No description provided.'}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Assigned Fleet</span>
                <span className="text-lg font-bold text-white font-mono">{c.vehicleCount || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <FolderTree className="w-4 h-4 mr-2 text-emerald-400" />
                Add Vehicle Category
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category Code (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELECTRIC_VANS"
                  value={categoryCode}
                  onChange={(e) => setCategoryCode(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Commercial Vans"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Operational scope of this vehicle category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
