import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Wrench,
  Navigation,
  Fuel,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const role = user?.role;

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.success) {
          setKpi(res.data);
        }
      } catch (err) {
        console.error('Failed to load KPIs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3"></div>
        Loading Fleet Intelligence...
      </div>
    );
  }

  const availabilityPieData = [
    { name: 'Available', value: kpi?.availableVehicles || 0, color: '#10b981' },
    { name: 'Assigned', value: kpi?.assignedVehicles || 0, color: '#3b82f6' },
    { name: 'Maintenance', value: kpi?.underMaintenanceVehicles || 0, color: '#f43f5e' },
    { name: 'Inactive', value: kpi?.inactiveVehicles || 0, color: '#64748b' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white">Fleet Operations & Utilization Command Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status, preventive maintenance schedules, and financial telemetry
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER', 'DISPATCHER'].includes(role) && (
            <Link
              to="/trips"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center transition-colors shadow-lg shadow-emerald-950"
            >
              <Navigation className="w-3.5 h-3.5 mr-1.5" />
              Dispatch Trip
            </Link>
          )}
          {['ADMIN', 'SUPER_ADMIN', 'FLEET_MANAGER'].includes(role) && (
            <Link
              to="/maintenance"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 mr-1.5" />
              Schedule Service
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Fleet */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Fleet Assets</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{kpi?.totalVehicles || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 8 Dynamic Categories</div>
        </div>

        {/* Available Vehicles */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Available For Dispatch</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{kpi?.availableVehicles || 0}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            {kpi?.totalVehicles ? Math.round(((kpi.availableVehicles || 0) / kpi.totalVehicles) * 100) : 0}% Fleet Availability
          </div>
        </div>

        {/* Assigned on Trips */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Operations</span>
            <Navigation className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{kpi?.assignedVehicles || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">{kpi?.activeTrips || 0} Active Trip Routes</div>
        </div>

        {/* Under Maintenance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Under Maintenance</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{kpi?.underMaintenanceVehicles || 0}</div>
          <div className="text-[11px] text-rose-500/80 mt-1">
            {kpi?.overdueMaintenanceCount || 0} Overdue / {kpi?.upcomingMaintenanceCount || 0} Upcoming
          </div>
        </div>
      </div>

      {/* Operational Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Proactive Recommendations Alert */}
        <div className="bg-slate-900 border border-amber-500/20 p-5 rounded-xl flex items-start space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Maintenance Advisory</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {kpi?.activeRecommendationsCount || 0} vehicle(s) flagged for service thresholds or wear patterns.
            </p>
            <Link to="/recommendations" className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center mt-2">
              View Recommendations <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Fuel Economy & Spend */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Total Fuel Spend</h4>
            <div className="text-lg font-bold text-white mt-0.5">
              ₹{(kpi?.totalFuelExpenditure || 0).toLocaleString()}
            </div>
            <Link to="/fuel" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center mt-2">
              Fuel Logs & Anomalies <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Spare Parts Inventory */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-start space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white">Inventory Threshold</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {kpi?.lowStockPartsCount || 0} spare parts currently at or below minimum reorder point.
            </p>
            <Link to="/spare-parts" className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center mt-2">
              Manage Inventory <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-white mb-4">Fleet Availability Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={availabilityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {availabilityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-slate-300">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Costs Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Monthly Operational Expenditure (₹)</h3>
            <span className="text-xs text-slate-500">Fuel vs. Maintenance</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpi?.monthlyCosts || []}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val) => `₹${val.toLocaleString()}`}
                />
                <Legend formatter={(val) => <span className="text-xs text-slate-300 capitalize">{val}</span>} />
                <Bar dataKey="fuel" fill="#10b981" name="Fuel Cost" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" fill="#f43f5e" name="Maintenance" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
