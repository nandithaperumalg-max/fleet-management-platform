import { pool, withTransaction } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';
import { broadcastEvent, SOCKET_EVENTS } from '../sockets/socketManager.js';
import { evaluateVehicleMaintenance } from '../engine/maintenanceEngine.js';

export class VehicleService {
  static async getAllVehicles(filters = {}) {
    let query = `
      SELECT v.*, 
        (SELECT COUNT(*) FROM maintenance_work_orders wo WHERE wo.vehicle_id = v.id AND wo.status IN ('SCHEDULED', 'IN_PROGRESS')) AS active_work_orders,
        (SELECT COUNT(*) FROM vehicle_maintenance_plans vmp WHERE vmp.vehicle_id = v.id AND vmp.maintenance_status = 'OVERDUE') AS overdue_plans_count
      FROM vehicles v
      WHERE v.is_deleted = FALSE
    `;
    const params = [];

    if (filters.status) {
      query += ` AND v.status = ?`;
      params.push(filters.status);
    }
    if (filters.vehicle_type) {
      query += ` AND v.vehicle_type = ?`;
      params.push(filters.vehicle_type);
    }

    query += ` ORDER BY v.id DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getVehicleById(id) {
    const [vehicles] = await pool.execute(
      `SELECT * FROM vehicles WHERE id = ? AND is_deleted = FALSE`,
      [id]
    );
    if (!vehicles.length) return null;

    const vehicle = vehicles[0];

    // Fetch maintenance plans
    const [plans] = await pool.execute(
      `SELECT vmp.*, mr.service_name, mr.service_code, mr.interval_km, mr.interval_days, mr.is_critical
       FROM vehicle_maintenance_plans vmp
       JOIN maintenance_rules mr ON vmp.rule_id = mr.id
       WHERE vmp.vehicle_id = ?`,
      [id]
    );

    // Fetch recent trips
    const [trips] = await pool.execute(
      `SELECT id, trip_number, origin, destination, scheduled_start, status, distance_km 
       FROM trips WHERE vehicle_id = ? ORDER BY id DESC LIMIT 5`,
      [id]
    );

    return { ...vehicle, maintenance_plans: plans, recent_trips: trips };
  }

  static async getAvailableVehicles() {
    const [rows] = await pool.execute(
      `SELECT * FROM vw_vehicle_availability WHERE dispatch_eligibility = 'DISPATCH_READY'`
    );
    return rows;
  }

  static async createVehicle(vehicleData, userId = null) {
    return await withTransaction(async (conn) => {
      const {
        vin, license_plate, make, model, year_manufactured,
        vehicle_type, capacity_kg, passenger_capacity,
        fuel_type, current_odometer, acquisition_date, acquisition_cost
      } = vehicleData;

      const [result] = await conn.execute(
        `INSERT INTO vehicles 
         (vin, license_plate, make, model, year_manufactured, vehicle_type, capacity_kg, passenger_capacity, fuel_type, current_odometer, acquisition_date, acquisition_cost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')`,
        [vin, license_plate, make, model, year_manufactured, vehicle_type, capacity_kg || 0, passenger_capacity || 0, fuel_type, current_odometer || 0, acquisition_date, acquisition_cost || 0]
      );

      const newId = result.insertId;

      // Automatically attach default preventive maintenance rules
      const [rules] = await conn.execute(`SELECT id, interval_km, interval_days FROM maintenance_rules`);
      const today = new Date();

      for (const rule of rules) {
        const nextDueKm = (parseFloat(current_odometer) || 0) + parseFloat(rule.interval_km);
        const nextDueDate = new Date(today.getTime() + (rule.interval_days * 24 * 60 * 60 * 1000));

        await conn.execute(
          `INSERT INTO vehicle_maintenance_plans 
           (vehicle_id, rule_id, last_service_odometer, last_service_date, next_due_odometer, next_due_date, maintenance_status)
           VALUES (?, ?, ?, ?, ?, ?, 'NORMAL')`,
          [newId, rule.id, current_odometer || 0, acquisition_date, nextDueKm, nextDueDate.toISOString().split('T')[0]]
        );
      }

      await logAudit({
        tableName: 'vehicles',
        recordId: newId,
        action: 'INSERT',
        newValues: vehicleData,
        userId
      }, conn);

      broadcastEvent(SOCKET_EVENTS.VEHICLE_STATUS_CHANGED, {
        vehicleId: newId,
        licensePlate: license_plate,
        status: 'AVAILABLE'
      });

      return { id: newId, ...vehicleData };
    });
  }

  static async updateVehicleStatus(id, newStatus, userId = null) {
    return await withTransaction(async (conn) => {
      const [curr] = await conn.execute(`SELECT status, license_plate FROM vehicles WHERE id = ? FOR UPDATE`, [id]);
      if (!curr.length) throw new Error('Vehicle not found');

      const oldStatus = curr[0].status;
      await conn.execute(`UPDATE vehicles SET status = ? WHERE id = ?`, [newStatus, id]);

      await logAudit({
        tableName: 'vehicles',
        recordId: id,
        action: 'STATUS_TRANSITION',
        oldValues: { status: oldStatus },
        newValues: { status: newStatus },
        userId
      }, conn);

      broadcastEvent(SOCKET_EVENTS.VEHICLE_STATUS_CHANGED, {
        vehicleId: id,
        licensePlate: curr[0].license_plate,
        oldStatus,
        newStatus
      });

      return { id, oldStatus, newStatus };
    });
  }
}
