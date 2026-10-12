import { logAudit } from '../middleware/audit.js';
import { broadcastEvent, SOCKET_EVENTS } from '../sockets/socketManager.js';

export const VEHICLE_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  INACTIVE_RETIRED: 'INACTIVE_RETIRED'
};

export const TRIP_STATUSES = {
  DRAFT: 'DRAFT',
  DISPATCHED: 'DISPATCHED',
  IN_TRANSIT: 'IN_TRANSIT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

/**
 * Concurrency-safe check asserting vehicle is available for dispatch.
 * Locks the vehicle row with FOR UPDATE inside an active transaction.
 * @param {import('mysql2/promise').Connection} connection
 * @param {number} vehicleId
 */
export async function assertVehicleAvailableForDispatch(connection, vehicleId) {
  // Row-level lock to prevent double booking race conditions
  const [rows] = await connection.execute(
    `SELECT id, license_plate, status, current_odometer, is_deleted 
     FROM vehicles 
     WHERE id = ? FOR UPDATE`,
    [vehicleId]
  );

  if (!rows || rows.length === 0) {
    const error = new Error(`Vehicle with ID ${vehicleId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const vehicle = rows[0];

  if (vehicle.is_deleted) {
    const error = new Error(`Vehicle ${vehicle.license_plate} has been archived/deleted.`);
    error.statusCode = 400;
    throw error;
  }

  if (vehicle.status !== VEHICLE_STATUSES.AVAILABLE) {
    const error = new Error(
      `Vehicle ${vehicle.license_plate} cannot be dispatched. Current status is '${vehicle.status}' (Must be '${VEHICLE_STATUSES.AVAILABLE}').`
    );
    error.statusCode = 409;
    throw error;
  }

  // Check for active or scheduled maintenance
  const [workOrders] = await connection.execute(
    `SELECT id, work_order_no, status, priority 
     FROM maintenance_work_orders 
     WHERE vehicle_id = ? AND status IN ('SCHEDULED', 'IN_PROGRESS') 
     LIMIT 1`,
    [vehicleId]
  );

  if (workOrders && workOrders.length > 0) {
    const wo = workOrders[0];
    const error = new Error(
      `Dispatch blocked: Vehicle ${vehicle.license_plate} has active maintenance order #${wo.work_order_no} (${wo.status}).`
    );
    error.statusCode = 409;
    throw error;
  }

  // Check for critical overdue maintenance
  const [overduePlans] = await connection.execute(
    `SELECT vmp.id, mr.service_name 
     FROM vehicle_maintenance_plans vmp
     JOIN maintenance_rules mr ON vmp.rule_id = mr.id
     WHERE vmp.vehicle_id = ? AND vmp.maintenance_status = 'OVERDUE' AND mr.is_critical = TRUE
     LIMIT 1`,
    [vehicleId]
  );

  if (overduePlans && overduePlans.length > 0) {
    const plan = overduePlans[0];
    const error = new Error(
      `Dispatch blocked: Vehicle ${vehicle.license_plate} has overdue critical maintenance: ${plan.service_name}.`
    );
    error.statusCode = 409;
    throw error;
  }

  return vehicle;
}

/**
 * Concurrency-safe check asserting driver eligibility for dispatch.
 * @param {import('mysql2/promise').Connection} connection
 * @param {number} driverId
 */
export async function assertDriverEligibleForDispatch(connection, driverId) {
  const [rows] = await connection.execute(
    `SELECT d.id, d.license_number, d.license_expiry_date, d.employment_status, u.full_name
     FROM drivers d
     JOIN users u ON d.user_id = u.id
     WHERE d.id = ? FOR UPDATE`,
    [driverId]
  );

  if (!rows || rows.length === 0) {
    const error = new Error(`Driver with ID ${driverId} not found.`);
    error.statusCode = 404;
    throw error;
  }

  const driver = rows[0];

  if (driver.employment_status !== 'ACTIVE') {
    const error = new Error(
      `Driver ${driver.full_name} cannot be assigned. Employment status is '${driver.employment_status}'.`
    );
    error.statusCode = 400;
    throw error;
  }

  const today = new Date().toISOString().split('T')[0];
  if (driver.license_expiry_date <= today) {
    const error = new Error(
      `Driver ${driver.full_name}'s license (${driver.license_number}) expired on ${driver.license_expiry_date}. Assignment prohibited.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Check if driver is already on another active trip
  const [activeTrips] = await connection.execute(
    `SELECT trip_number, status 
     FROM trips 
     WHERE driver_id = ? AND status IN ('DISPATCHED', 'IN_TRANSIT') 
     LIMIT 1`,
    [driverId]
  );

  if (activeTrips && activeTrips.length > 0) {
    const trip = activeTrips[0];
    const error = new Error(
      `Driver ${driver.full_name} is already assigned to active trip ${trip.trip_number} (${trip.status}).`
    );
    error.statusCode = 409;
    throw error;
  }

  return driver;
}

/**
 * Atomically transitions vehicle status with audit logging and WebSocket event broadcast
 */
export async function setVehicleStatus(connection, vehicleId, newStatus, userId = null, req = null) {
  const [rows] = await connection.execute(
    `SELECT status, license_plate FROM vehicles WHERE id = ? FOR UPDATE`,
    [vehicleId]
  );

  if (!rows.length) return;
  const oldStatus = rows[0].status;

  if (oldStatus === newStatus) return;

  await connection.execute(
    `UPDATE vehicles SET status = ? WHERE id = ?`,
    [newStatus, vehicleId]
  );

  await logAudit({
    tableName: 'vehicles',
    recordId: vehicleId,
    action: 'STATUS_TRANSITION',
    oldValues: { status: oldStatus },
    newValues: { status: newStatus },
    userId,
    ipAddress: req?.ip
  }, connection);

  broadcastEvent(SOCKET_EVENTS.VEHICLE_STATUS_CHANGED, {
    vehicleId,
    licensePlate: rows[0].license_plate,
    oldStatus,
    newStatus
  });
}
