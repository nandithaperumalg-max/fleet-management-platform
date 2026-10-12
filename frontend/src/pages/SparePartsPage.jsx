import React, { useState, useEffect } from 'react';
import { Boxes, Plus, AlertTriangle, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

export default function SparePartsPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [formData, setFormData] = useState({
    partSku: '',
    partName: '',
    category: 'ENGINE',
    unitCost: 1200,
    stockQuantity: 10,
    reorderThreshold: 3,
    supplierName: 'AutoParts Direct India',
  });

  const fetchParts = async () => {
    setLoading(true);
    try {
      const endpoint = showLowStockOnly ? '/parts/low-stock' : '/parts';
      const res = await api.get(endpoint);
      if (res.success && res.data) setParts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParts(); }, [showLowStockOnly]);

  const handleAddPart = async (e) => {
    e.preventDefault();
    try {
      await api.post('/parts', formData);
      setShowModal(false);
      setFormData({
        partSku: '',
        partName: '',
        category: 'ENGINE',
        unitCost: 1200,
        stockQuantity: 10,
        reorderThreshold: 3,
        supplierName: 'AutoParts Direct India',
      });
      fetchParts();
    } catch (err) {
      alert(err.message || 'Failed to add part. If SKU already exists, please enter a new SKU.');
    }
  };

  const handleRestock = async (id, name) => {
    const qty = window.prompt(`Enter restock quantity for "${name}":`, '10');
    if (!qty || isNaN(qty)) return;
    try {
      await api.put(`/parts/${id}/restock?quantity=${parseInt(qty)}`);
      fetchParts();
    } catch (err) {
      alert(err.message || 'Failed to restock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Spare Parts Inventory Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track stock levels, auto-deduction on work order completion, and low-stock alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center transition-colors border ${
              showLowStockOnly
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            {showLowStockOnly ? 'Show All' : 'Low Stock Only'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center transition-colors shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Spare Part
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Part SKU</th>
                <th className="px-5 py-3.5">Part Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Unit Cost</th>
                <th className="px-5 py-3.5">Stock / Threshold</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-500">Loading inventory...</td></tr>
              ) : parts.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-slate-500">No spare parts in inventory.</td></tr>
              ) : (
                parts.map((p) => {
                  const isLow = p.stockQuantity <= p.reorderThreshold;
                  return (
                    <tr key={p.id} className={`hover:bg-slate-800/40 transition-colors ${isLow ? 'border-l-2 border-amber-500' : ''}`}>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{p.partSku}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{p.partName}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">{p.category}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">₹{p.unitCost?.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold text-base ${isLow ? 'text-amber-400' : 'text-white'}`}>
                            {p.stockQuantity}
                          </span>
                          <span className="text-slate-500">/ {p.reorderThreshold} min</span>
                          {isLow && (
                            <span className="inline-flex items-center text-[10px] font-semibold text-amber-400">
                              <AlertTriangle className="w-3 h-3 mr-0.5" /> LOW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{p.supplierName || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleRestock(p.id, p.partName)}
                          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold inline-flex items-center transition-colors"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <Boxes className="w-4 h-4 mr-2 text-emerald-400" />
                Add Spare Part to Inventory
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleAddPart} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Part SKU</label>
                  <input type="text" required placeholder="e.g. OIL-FILT-MAN-001" value={formData.partSku}
                    onChange={(e) => setFormData({ ...formData, partSku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white">
                    <option value="ENGINE">Engine</option>
                    <option value="BRAKES">Brakes</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="TYRES">Tyres</option>
                    <option value="FILTERS">Filters</option>
                    <option value="HYDRAULICS">Hydraulics</option>
                    <option value="COOLING">Cooling</option>
                    <option value="TRANSMISSION">Transmission</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Part Name</label>
                <input type="text" required placeholder="e.g. Mahle OC-123 Oil Filter" value={formData.partName}
                  onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Cost (₹)</label>
                  <input type="number" value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Stock Qty</label>
                  <input type="number" value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Reorder At</label>
                  <input type="number" value={formData.reorderThreshold}
                    onChange={(e) => setFormData({ ...formData, reorderThreshold: parseInt(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supplier Name</label>
                <input type="text" value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg">Add to Inventory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
