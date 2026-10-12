import { pool } from '../config/db.js';
import { config } from '../config/env.js';
import { broadcastEvent, SOCKET_EVENTS } from '../sockets/socketManager.js';

/**
 * Evaluates maintenance thresholds for a specific vehicle.
 * @param {number} vehicleId
 * @param {import('mysql2/promise').Connection} [connection]
 */
export async function evaluateVehicleMaintenance(vehicleId, connection = null) {
  const executor = connection || pool;

  // 1. Fetch current vehicle odometer and details
  const [vehicleRows] = await executor.execute(
    `SELECT id, license_plate, make, model, current_odometer, status 
     FROM vehicles 
     WHERE id = ? AND is_deleted = FALSE`,
    [vehicleId]
  );

  if (!vehicleRows || vehicleRows.length === 0) return;
  const vehicle = vehicleRows[0];

  // 2. Fetch maintenance plans for this vehicle
  const [plans] = await executor.execute(
    `SELECT vmp.id AS plan_id, vmp.rule_id, vmp.last_service_odometer, vmp.last_service_date,
            vmp.next_due_odometer, vmp.next_due_date, vmp.maintenance_status,
            mr.service_code, mr.service_name, mr.is_critical, mr.interval_km, mr.interval_days
     FROM vehicle_maintenance_plans vmp
     JOIN maintenance_rules mr ON vmp.rule_id = mr.id
     WHERE vmp.vehicle_id = ?`,
    [vehicleId]
  );

  const today = new Date();
  const warningKm = config.engine.warningKmThreshold;
  const warningDays = config.engine.warningDaysThreshold;

  for (const plan of plans) {
    const kmRemaining = plan.next_due_odometer - vehicle.current_odometer;
    const dueDate = new Date(plan.next_due_date);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStatus = 'NORMAL';
    let isOverdue = false;
    let isUpcoming = false;

    if (kmRemaining <= 0 || daysRemaining <= 0) {
      newStatus = 'OVERDUE';
      isOverdue = true;
    } else if (kmRemaining <= warningKm || daysRemaining <= warningDays) {
      newStatus = 'UPCOMING';
      isUpcoming = true;
    }

    // Update maintenance plan status if changed
    if (newStatus !== plan.maintenance_status) {
      await executor.execute(
        `UPDATE vehicle_maintenance_plans SET maintenance_status = ? WHERE id = ?`,
        [newStatus, plan.plan_id]
      );
    }

    // Proactively generate or update recommendation
    if (isOverdue || isUpcoming) {
      const severity = isOverdue 
        ? (plan.is_critical ? 'CRITICAL' : 'HIGH') 
        : (plan.is_critical ? 'HIGH' : 'MEDIUM');

      const recType = isOverdue ? 'OVERDUE_SERVICE' : 'PREVENTIVE_THRESHOLD';
      const title = `${plan.service_name} ${isOverdue ? 'OVERDUE' : 'Upcoming'} for ${vehicle.license_plate}`;
      const reason = isOverdue
        ? `Exceeded due target by ${Math.abs(kmRemaining).toFixed(0)} km or ${Math.abs(daysRemaining)} days.`
        : `Service threshold approaching: ${kmRemaining.toFixed(0)} km or ${daysRemaining} days remaining.`;

      // Check if an unresolved recommendation already exists
      const [existingRec] = await executor.execute(
        `SELECT id FROM maintenance_recommendations 
         WHERE vehicle_id = ? AND rule_id = ? AND is_resolved = FALSE`,
        [vehicleId, plan.rule_id]
      );

      if (existingRec.length === 0) {
        await executor.execute(
          `INSERT INTO maintenance_recommendations 
           (vehicle_id, rule_id, recommendation_type, severity, title, reason, projected_due_date, projected_due_odometer)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            vehicleId,
            plan.rule_id,
            recType,
            severity,
            title,
            reason,
            plan.next_due_date,
            plan.next_due_odometer
          ]
        );

        broadcastEvent(SOCKET_EVENTS.MAINTENANCE_ALERT, {
          vehicleId,
          licensePlate: vehicle.license_plate,
          serviceName: plan.service_name,
          severity,
          title,
          reason
        });
      }
    }
  }
}

/**
 * Background Engine Worker: Scans entire fleet for maintenance milestones and utilization anomalies
 */
export async function runFleetMaintenanceEvaluation() {
  console.log('[Core Engine] Running Fleet-wide Maintenance & Utilization Evaluation...');
  try {
    const [vehicles] = await pool.execute(
      `SELECT id FROM vehicles WHERE is_deleted = FALSE AND status != 'INACTIVE_RETIRED'`
    );

    for (const v of vehicles) {
      await evaluateVehicleMaintenance(v.id);
    }

    // Broadcast live metrics refresh to connected dashboard clients
    broadcastEvent(SOCKET_EVENTS.METRICS_REFRESH, { evaluatedCount: vehicles.length });
    console.log(`[Core Engine] Evaluation completed across ${vehicles.length} fleet assets.`);
  } catch (error) {
    console.error('[Core Engine Failure] Maintenance evaluation failed:', error);
  }
}
