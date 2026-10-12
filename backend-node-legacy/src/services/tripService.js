import { pool, withTransaction } from '../config/db.js';
import { assertVehicleAvailableForDispatch, assertDriverEligibleForDispatch, setVehicleStatus, VEHICLE_STATUSES } from '../engine/stateGuard.js';
import { evaluateVehicleMaintenance } from '../engine/maintenanceEngine.js';
import { logAudit } from '../middleware/audit.js';
import { broadcastEvent, SOCKET_EVENTS } from '../sockets/socketManager.js';

export class TripService {
  static async getAllTrips(filters = {}) {
    let query = `
      SELECT t.*, 
        v.license_plate, v.make, v.model, v.vehicle_type,
        u.full_name AS driver_name, d.license_number
      FROM trips t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND t.status = ?`;
      params.push(filters.status);
    }
    if (filters.vehicle_id) {
      query += ` AND t.vehicle_id = ?`;
      params.push(filters.vehicle_id);
    }
    if (filters.driver_id) {
      query += ` AND t.driver_id = ?`;
      params.push(filters.driver_id);
    }

    query += ` ORDER BY t.id DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getTripById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, 
        v.license_plate, v.make, v.model, v.vehicle_type,
        u.full_name AS driver_name, d.license_number, d.phone AS driver_phone
       FROM trips t
       JOIN vehicles v ON t.vehicle_id = v.id
       JOIN drivers d ON t.driver_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Dispatch a new trip with transactional guardrails:
   * 1. Checks vehicle status == AVAILABLE, no active maintenance, no overdue critical service.
   * 2. Checks driver employment_status == ACTIVE, valid license, not on active trip.
   * 3. Locks vehicle state to ASSIGNED.
   * 4. Logs audit trail and notifies connected clients.
   */
  static async dispatchTrip(tripData, userId = null, req = null) {
    return await withTransaction(async (conn) => {
      const { vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end, cargo_weight_kg, notes } = tripData;

      // 1. Enforce vehicle availability guardrail
      const vehicle = await assertVehicleAvailableForDispatch(conn, vehicle_id);

      // 2. Enforce driver eligibility guardrail
      const driver = await assertDriverEligibleForDispatch(conn, driver_id);

      const tripNumber = `TRP-${Date.now().toString().slice(-6)}`;
      const startOdometer = vehicle.current_odometer;

      // 3. Create trip record
      const [insertResult] = await conn.execute(
        `INSERT INTO trips 
         (trip_number, vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end, actual_start, start_odometer, cargo_weight_kg, status, notes, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, 'DISPATCHED', ?, ?)`,
        [tripNumber, vehicle_id, driver_id, origin, destination, scheduled_start, scheduled_end, startOdometer, cargo_weight_kg || 0, notes || null, userId || 1]
      );

      const tripId = insertResult.insertId;

      // 4. Atomically transition vehicle status to ASSIGNED
      await setVehicleStatus(conn, vehicle_id, VEHICLE_STATUSES.ASSIGNED, userId, req);

      // 5. Audit Log
      await logAudit({
        tableName: 'trips',
        recordId: tripId,
        action: 'INSERT',
        newValues: { tripNumber, vehicle_id, driver_id, status: 'DISPATCHED', startOdometer },
        userId,
        ipAddress: req?.ip
      }, conn);

      const dispatchPayload = {
        tripId,
        tripNumber,
        vehicleId: vehicle_id,
        licensePlate: vehicle.license_plate,
        driverId: driver_id,
        driverName: driver.full_name,
        origin,
        destination,
        status: 'DISPATCHED'
      };

      broadcastEvent(SOCKET_EVENTS.TRIP_DISPATCHED, dispatchPayload);

      return dispatchPayload;
    });
  }

  /**
   * Complete trip and feed the Utilization & Maintenance Engine
   */
  static async completeTrip(tripId, { end_odometer, notes }, userId = null, req = null) {
    return await withTransaction(async (conn) => {
      const [tripRows] = await conn.execute(
        `SELECT * FROM trips WHERE id = ? FOR UPDATE`,
        [tripId]
      );

      if (!tripRows.length) {
        const err = new Error('Trip not found');
        err.statusCode = 404;
        throw err;
      }

      const trip = tripRows[0];
      if (trip.status === 'COMPLETED') {
        const err = new Error('Trip is already completed');
        err.statusCode = 400;
        throw err;
      }

      const parsedEndOdo = parseFloat(end_odometer);
      if (isNaN(parsedEndOdo) || parsedEndOdo < parseFloat(trip.start_odometer)) {
        const err = new Error(
          `End odometer (${end_odometer}) must be greater than or equal to start odometer (${trip.start_odometer}).`
        );
        err.statusCode = 400;
        throw err;
      }

      const distanceCovered = parsedEndOdo - parseFloat(trip.start_odometer);

      // 1. Update Trip Record
      await conn.execute(
        `UPDATE trips 
         SET status = 'COMPLETED', actual_end = NOW(), end_odometer = ?, notes = COALESCE(?, notes)
         WHERE id = ?`,
        [parsedEndOdo, notes || null, tripId]
      );

      // 2. Update Vehicle Current Odometer
      await conn.execute(
        `UPDATE vehicles SET current_odometer = ? WHERE id = ?`,
        [parsedEndOdo, trip.vehicle_id]
      );

      // 3. Restore vehicle status to AVAILABLE
      await setVehicleStatus(conn, trip.vehicle_id, VEHICLE_STATUSES.AVAILABLE, userId, req);

      // 4. Audit Log
      await logAudit({
        tableName: 'trips',
        recordId: tripId,
        action: 'STATUS_TRANSITION',
        oldValues: { status: trip.status, end_odometer: trip.end_odometer },
        newValues: { status: 'COMPLETED', end_odometer: parsedEndOdo, distance_km: distanceCovered },
        userId,
        ipAddress: req?.ip
      }, conn);

      // 5. Trigger Core Engine maintenance threshold evaluation for this vehicle
      await evaluateVehicleMaintenance(trip.vehicle_id, conn);

      const completionPayload = {
        tripId,
        tripNumber: trip.trip_number,
        vehicleId: trip.vehicle_id,
        distanceCovered,
        newVehicleOdometer: parsedEndOdo,
        status: 'COMPLETED'
      };

      broadcastEvent(SOCKET_EVENTS.TRIP_COMPLETED, completionPayload);
      broadcastEvent(SOCKET_EVENTS.METRICS_REFRESH, { reason: 'Trip Completed' });

      return completionPayload;
    });
  }
}
