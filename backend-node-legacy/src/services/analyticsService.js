import { pool } from '../config/db.js';

export class AnalyticsService {
  static async getDashboardKPIs() {
    // 1. Vehicle status counts
    const [statusRows] = await pool.execute(`
      SELECT 
        COUNT(*) AS total_vehicles,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available_count,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned_count,
        SUM(CASE WHEN status = 'UNDER_MAINTENANCE' THEN 1 ELSE 0 END) AS maintenance_count,
        SUM(CASE WHEN status = 'INACTIVE_RETIRED' THEN 1 ELSE 0 END) AS retired_count
      FROM vehicles WHERE is_deleted = FALSE
    `);

    // 2. Active Trips
    const [tripRows] = await pool.execute(`
      SELECT 
        COUNT(*) AS total_trips,
        SUM(CASE WHEN status IN ('DISPATCHED', 'IN_TRANSIT') THEN 1 ELSE 0 END) AS active_dispatched,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_trips,
        COALESCE(SUM(distance_km), 0) AS total_distance_km
      FROM trips
    `);

    // 3. Maintenance metrics
    const [maintenanceRows] = await pool.execute(`
      SELECT 
        COUNT(*) AS total_work_orders,
        SUM(CASE WHEN status IN ('SCHEDULED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS active_work_orders,
        COALESCE(SUM(total_cost), 0) AS total_maintenance_spend,
        COALESCE(SUM(downtime_hours), 0) AS total_downtime_hours
      FROM maintenance_work_orders
    `);

    // 4. Overdue Alerts
    const [alertRows] = await pool.execute(`
      SELECT COUNT(*) AS overdue_alerts_count 
      FROM vehicle_maintenance_plans 
      WHERE maintenance_status = 'OVERDUE'
    `);

    // 5. Fuel metrics
    const [fuelRows] = await pool.execute(`
      SELECT 
        COALESCE(SUM(total_cost), 0) AS total_fuel_spend,
        COALESCE(SUM(fuel_quantity_liters), 0) AS total_fuel_liters,
        COALESCE(AVG(fuel_economy_kml), 0) AS avg_fleet_kml
      FROM fuel_logs
    `);

    const stats = statusRows[0] || {};
    const trips = tripRows[0] || {};
    const maint = maintenanceRows[0] || {};
    const alerts = alertRows[0] || {};
    const fuel = fuelRows[0] || {};

    // Calculate CPK: (Fuel Spend + Maintenance Spend) / Total Distance
    const totalSpend = parseFloat(fuel.total_fuel_spend) + parseFloat(maint.total_maintenance_spend);
    const totalDistance = parseFloat(trips.total_distance_km);
    const costPerKm = totalDistance > 0 ? (totalSpend / totalDistance).toFixed(2) : '0.00';

    // Calculate Fleet Availability Rate %
    const totalVehicles = stats.total_vehicles || 1;
    const maintenanceVehicles = stats.maintenance_count || 0;
    const availabilityRate = (((totalVehicles - maintenanceVehicles) / totalVehicles) * 100).toFixed(1);

    return {
      fleet: {
        total: stats.total_vehicles,
        available: stats.available_count,
        assigned: stats.assigned_count,
        under_maintenance: stats.maintenance_count,
        retired: stats.retired_count,
        availability_rate_pct: availabilityRate
      },
      trips: {
        total: trips.total_trips,
        active: trips.active_dispatched,
        completed: trips.completed_trips,
        total_distance_km: parseFloat(trips.total_distance_km).toFixed(1)
      },
      maintenance: {
        active_orders: maint.active_work_orders,
        total_spend: parseFloat(maint.total_maintenance_spend).toFixed(2),
        total_downtime_hours: parseFloat(maint.total_downtime_hours).toFixed(1),
        overdue_alerts: alerts.overdue_alerts_count
      },
      fuel: {
        total_spend: parseFloat(fuel.total_fuel_spend).toFixed(2),
        total_liters: parseFloat(fuel.total_fuel_liters).toFixed(1),
        avg_fleet_kml: parseFloat(fuel.avg_fleet_kml).toFixed(2)
      },
      financials: {
        cost_per_km: costPerKm,
        total_operational_spend: totalSpend.toFixed(2)
      }
    };
  }

  static async getUtilizationView() {
    const [rows] = await pool.execute(`SELECT * FROM vw_fleet_utilization_summary`);
    return rows;
  }

  static async getUpcomingMaintenanceView() {
    const [rows] = await pool.execute(`SELECT * FROM vw_upcoming_overdue_maintenance ORDER BY days_remaining_until_service ASC`);
    return rows;
  }

  static async getFuelEfficiencyView() {
    const [rows] = await pool.execute(`SELECT * FROM vw_fuel_efficiency_summary`);
    return rows;
  }
}
