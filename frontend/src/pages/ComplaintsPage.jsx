import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  AlertCircle,
  Plus,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ShieldAlert,
  FileText,
  Truck,
  Navigation,
  MessageSquare,
  X,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const isManagerOrAdmin = ['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(role);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'GENERAL',
    subject: '',
    description: '',
    vehicleId: '',
    tripId: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Update State (Admin / Manager)
  const [updateStatus, setUpdateStatus] = useState('IN_REVIEW');
  const [updateResolution, setUpdateResolution] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const endpoint = isManagerOrAdmin ? '/complaints' : '/complaints/my';
      const res = await api.get(endpoint);
      if (res.success && Array.isArray(res.data)) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      setErrorMsg(err.message || 'Unable to load complaints from server. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user, isManagerOrAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        category: formData.category,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      };
      if (formData.vehicleId) {
        payload.vehicleId = Number(formData.vehicleId);
      }
      if (formData.tripId) {
        payload.tripId = Number(formData.tripId);
      }

      const res = await api.post('/complaints', payload);
      if (res.success) {
        setShowSubmitModal(false);
        setFormData({
          category: 'GENERAL',
          subject: '',
          description: '',
          vehicleId: '',
          tripId: '',
        });
        setSuccessMsg('Complaint submitted successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchComplaints();
      } else {
        setFormError(res.message || 'Submission failed');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to submit complaint. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateStatus(complaint.status || 'IN_REVIEW');
    setUpdateResolution(complaint.resolution || '');
    setUpdateError('');
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    setUpdateError('');

    try {
      const res = await api.put(`/complaints/${selectedComplaint.id}/status`, {
        status: updateStatus,
        resolution: updateResolution.trim(),
      });
      if (res.success) {
        setShowDetailModal(false);
        setSuccessMsg(`Complaint #${selectedComplaint.id} updated to ${updateStatus}.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchComplaints();
      } else {
        setUpdateError(res.message || 'Failed to update complaint');
      }
    } catch (err) {
      setUpdateError(err.message || 'Error updating complaint status');
    } finally {
      setUpdating(false);
    }
  };

  // Filter complaints client-side
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !search ||
      c.subject?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search);
    const matchesCategory = !selectedCategory || c.category === selectedCategory;
    const matchesStatus = !selectedStatus || c.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalCount = complaints.length;
  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inReviewCount = complaints.filter((c) => c.status === 'IN_REVIEW').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-rose-400" />
            Complaints &amp; Issue Escalation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isManagerOrAdmin
              ? 'Review, track, and resolve operational issues, driver grievances, and safety tickets'
              : 'Report operational defects, trip discrepancies, or vehicle malfunctions directly to management'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchComplaints}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFormError('');
              setShowSubmitModal(true);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center shadow-lg shadow-rose-950 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchComplaints}
            className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded text-[11px] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 mb-1">Total {isManagerOrAdmin ? 'Recorded' : 'My Issues'}</div>
          <div className="text-2xl font-bold text-white">{totalCount}</div>
        </div>
        <div className="bg-slate-900 border border-amber-500/20 p-4 rounded-xl">
          <div className="text-xs text-amber-400 mb-1">Open &amp; Pending</div>
          <div className="text-2xl font-bold text-amber-400">{openCount}</div>
        </div>
        <div className="bg-slate-900 border border-blue-500/20 p-4 rounded-xl">
          <div className="text-xs text-blue-400 mb-1">Under Investigation</div>
          <div className="text-2xl font-bold text-blue-400">{inReviewCount}</div>
        </div>
        <div className="bg-slate-900 border border-emerald-500/20 p-4 rounded-xl">
          <div className="text-xs text-emerald-400 mb-1">Resolved / Closed</div>
          <div className="text-2xl font-bold text-emerald-400">{resolvedCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, subject, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="VEHICLE">Vehicle Defect</option>
            <option value="TRIP">Trip Issue</option>
            <option value="SAFETY">Safety Concern</option>
            <option value="DRIVER">Driver Grievance</option>
            <option value="SERVICE">Service Request</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Complaints List / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Ticket / Subject</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                {isManagerOrAdmin && <th className="px-5 py-3.5">Submitted By</th>}
                <th className="px-5 py-3.5">Related To</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={isManagerOrAdmin ? 7 : 6} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading registered complaints...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={isManagerOrAdmin ? 7 : 6} className="px-5 py-12 text-center text-slate-500">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    {search || selectedCategory || selectedStatus
                      ? 'No complaints match the selected filters.'
                      : 'No complaints logged. Operations are running normally.'}
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-200 truncate">{c.subject}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">#{c.id}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium border border-slate-700">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    {isManagerOrAdmin && (
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-slate-300 font-medium">{c.submittedBy?.fullName || c.submittedBy?.username || 'Unknown'}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{c.submittedBy?.role?.replace('_', ' ') || 'User'}</div>
                      </td>
                    )}
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                      {c.vehicleId && (
                        <div className="flex items-center text-[11px] text-slate-300">
                          <Truck className="w-3 h-3 mr-1 text-slate-500" /> Vehicle #{c.vehicleId}
                        </div>
                      )}
                      {c.tripId && (
                        <div className="flex items-center text-[11px] text-slate-300 mt-0.5">
                          <Navigation className="w-3 h-3 mr-1 text-slate-500" /> Trip #{c.tripId}
                        </div>
                      )}
                      {!c.vehicleId && !c.tripId && <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400">
                      {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(c)}
                        className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors border ${
                          isManagerOrAdmin
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {isManagerOrAdmin ? 'Review & Resolve' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Report New Issue */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-sm">Report New Fleet Issue</h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                    required
                  >
                    <option value="GENERAL">General</option>
                    <option value="VEHICLE">Vehicle Defect</option>
                    <option value="TRIP">Trip Issue</option>
                    <option value="SAFETY">Safety Concern</option>
                    <option value="DRIVER">Driver Grievance</option>
                    <option value="SERVICE">Service Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Related Vehicle ID <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Related Trip ID <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 4"
                  value={formData.tripId}
                  onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Subject / Summary <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue (e.g. Brake warning light flashing)"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  placeholder="Provide complete details, symptoms, exact location, or sequence of events..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-none h-28"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-rose-950 flex items-center"
                >
                  {submitting ? 'Submitting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: View Details & Management Resolution */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl my-8">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm">Complaint #{selectedComplaint.id}</h3>
                <span className="text-[10px] text-slate-400">
                  Logged on {selectedComplaint.submittedAt ? new Date(selectedComplaint.submittedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Complaint Overview */}
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium border border-slate-700">
                    Category: {selectedComplaint.category}
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Subject</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{selectedComplaint.subject}</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Description</div>
                  <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">Submitted By:</span>{' '}
                    <span className="text-slate-300 font-medium">
                      {selectedComplaint.submittedBy?.fullName || selectedComplaint.submittedBy?.username || 'User'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Role:</span>{' '}
                    <span className="text-slate-300 capitalize">
                      {selectedComplaint.submittedBy?.role?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  {selectedComplaint.vehicleId && (
                    <div>
                      <span className="text-slate-500">Vehicle ID:</span>{' '}
                      <span className="text-slate-300 font-medium">#{selectedComplaint.vehicleId}</span>
                    </div>
                  )}
                  {selectedComplaint.tripId && (
                    <div>
                      <span className="text-slate-500">Trip ID:</span>{' '}
                      <span className="text-slate-300 font-medium">#{selectedComplaint.tripId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Notes Section */}
              {isManagerOrAdmin ? (
                /* Admin & Manager can update status and add resolution */
                <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Administrative Action &amp; Resolution
                  </h4>

                  {updateError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                      <span>{updateError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Update Status</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="OPEN">OPEN (Under Review Queue)</option>
                      <option value="IN_REVIEW">IN_REVIEW (Active Investigation)</option>
                      <option value="RESOLVED">RESOLVED (Action Taken)</option>
                      <option value="CLOSED">CLOSED (Resolved &amp; Closed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Resolution Notes / Corrective Actions
                    </label>
                    <textarea
                      placeholder="Detail the investigation findings, repairs authorized, or outcome communicated to the reporter..."
                      value={updateResolution}
                      onChange={(e) => setUpdateResolution(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none h-24"
                    />
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-lg shadow-emerald-950 flex items-center"
                    >
                      {updating ? 'Saving...' : 'Save Updates'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Driver and Dispatcher read-only view of resolution */
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Management Resolution</div>
                  {selectedComplaint.resolution ? (
                    <p className="text-xs text-emerald-400 mt-1 whitespace-pre-wrap leading-relaxed">
                      {selectedComplaint.resolution}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      Pending review by the fleet management team.
                    </p>
                  )}
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
