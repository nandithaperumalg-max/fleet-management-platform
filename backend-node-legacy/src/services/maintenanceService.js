import { pool, withTransaction } from '../config/db.js';
import { setVehicleStatus, VEHICLE_STATUSES } from '../engine/stateGuard.js';
import { logAudit } from '../middleware/audit.js';
import { broadcastEvent, SOCKET_EVENTS } from '../sockets/socketManager.js';

export class MaintenanceService {
  static async getAllWorkOrders(filters = {}) {
    let query = `
      SELECT wo.*, 
        v.license_plate, v.make, v.model,
        mr.service_name, mr.service_code,
        u.full_name AS mechanic_name
      FROM maintenance_work_orders wo
      JOIN vehicles v ON wo.vehicle_id = v.id
      LEFT JOIN maintenance_rules mr ON wo.rule_id = mr.id
      LEFT JOIN users u ON wo.assigned_mechanic_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ` AND wo.status = ?`;
      params.push(filters.status);
    }
    if (filters.vehicle_id) {
      query += ` AND wo.vehicle_id = ?`;
      params.push(filters.vehicle_id);
    }

    query += ` ORDER BY wo.id DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getWorkOrderById(id) {
    const [orders] = await pool.execute(
      `SELECT wo.*, 
        v.license_plate, v.make, v.model,
        mr.service_name,
        u.full_name AS mechanic_name
       FROM maintenance_work_orders wo
       JOIN vehicles v ON wo.vehicle_id = v.id
       LEFT JOIN maintenance_rules mr ON wo.rule_id = mr.id
       LEFT JOIN users u ON wo.assigned_mechanic_id = u.id
       WHERE wo.id = ?`,
      [id]
    );

    if (!orders.length) return null;

    // Fetch consumed parts
    const [parts] = await pool.execute(
      `SELECT wop.*, sp.part_name, sp.part_sku, sp.category 
       FROM work_order_parts wop
       JOIN spare_parts sp ON wop.part_id = sp.id
       WHERE wop.work_order_id = ?`,
      [id]
    );

    return { ...orders[0], consumed_parts: parts };
  }

  static async createWorkOrder(orderData, userId = null, req = null) {
    return await withTransaction(async (conn) => {
      const {
        vehicle_id, rule_id, service_type, priority,
        description, scheduled_date, assigned_mechanic_id, parts = []
      } = orderData;

      const workOrderNo = `WO-${Date.now().toString().slice(-6)}`;

      // Calculate parts cost and check inventory
      let totalPartsCost = 0;
      for (const item of parts) {
        const [pRows] = await conn.execute(
          `SELECT unit_cost, stock_quantity, part_name FROM spare_parts WHERE id = ? FOR UPDATE`,
          [item.part_id]
        );
        if (!pRows.length) throw new Error(`Part ID ${item.part_id} not found.`);
        if (pRows[0].stock_quantity < item.quantity) {
          throw new Error(`Insufficient inventory for part '${pRows[0].part_name}'. Available: ${pRows[0].stock_quantity}, requested: ${item.quantity}`);
        }
        totalPartsCost += parseFloat(pRows[0].unit_cost) * item.quantity;
      }

      const [res] = await conn.execute(
        `INSERT INTO maintenance_work_orders 
         (work_order_no, vehicle_id, rule_id, service_type, priority, description, scheduled_date, parts_cost, total_cost, assigned_mechanic_id, status, created_by_user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?)`,
        [workOrderNo, vehicle_id, rule_id || null, service_type, priority || 'MEDIUM', description, scheduled_date, totalPartsCost, totalPartsCost, assigned_mechanic_id || null, userId || 1]
      );

      const workOrderId = res.insertId;

      // Link parts and decrement warehouse stock
      for (const item of parts) {
        const [pRows] = await conn.execute(`SELECT unit_cost FROM spare_parts WHERE id = ?`, [item.part_id]);
        const unitCost = pRows[0].unit_cost;

        await conn.execute(
          `INSERT INTO work_order_parts (work_order_id, part_id, quantity_used, unit_price)
           VALUES (?, ?, ?, ?)`,
          [workOrderId, item.part_id, item.quantity, unitCost]
        );

        await conn.execute(
          `UPDATE spare_parts SET stock_quantity = stock_quantity - ? WHERE id = ?`,
          [item.quantity, item.part_id]
        );
      }

      await logAudit({
        tableName: 'maintenance_work_orders',
        recordId: workOrderId,
        action: 'INSERT',
        newValues: { workOrderNo, vehicle_id, status: 'SCHEDULED' },
        userId,
        ipAddress: req?.ip
      }, conn);

      broadcastEvent(SOCKET_EVENTS.WORK_ORDER_UPDATED, {
        workOrderId,
        workOrderNo,
        vehicleId: vehicle_id,
        status: 'SCHEDULED'
      });

      return { id: workOrderId, work_order_no: workOrderNo, status: 'SCHEDULED' };
    });
  }

  static async updateWorkOrderStatus(workOrderId, statusData, userId = null, req = null) {
    return await withTransaction(async (conn) => {
      const { status, labor_hours, labor_rate_per_hour = 50 } = statusData;

      const [orders] = await conn.execute(
        `SELECT * FROM maintenance_work_orders WHERE id = ? FOR UPDATE`,
        [workOrderId]
      );
      if (!orders.length) throw new Error('Work order not found');
      const order = orders[0];

      if (status === 'IN_PROGRESS') {
        await conn.execute(
          `UPDATE maintenance_work_orders SET status = 'IN_PROGRESS', start_time = COALESCE(start_time, NOW()) WHERE id = ?`,
          [workOrderId]
        );
        // Automatically put vehicle under maintenance
        await setVehicleStatus(conn, order.vehicle_id, VEHICLE_STATUSES.UNDER_MAINTENANCE, userId, req);
      } else if (status === 'COMPLETED') {
        const startTime = order.start_time ? new Date(order.start_time) : new Date();
        const completionTime = new Date();
        const downtimeHours = Math.max(0.5, ((completionTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))).toFixed(2);
        const lHours = parseFloat(labor_hours || order.labor_hours || 2);
        const laborCost = lHours * parseFloat(labor_rate_per_hour);
        const totalCost = parseFloat(order.parts_cost) + laborCost;

        await conn.execute(
          `UPDATE maintenance_work_orders 
           SET status = 'COMPLETED', completion_time = NOW(), downtime_hours = ?, labor_hours = ?, labor_cost = ?, total_cost = ?
           WHERE id = ?`,
          [downtimeHours, lHours, laborCost, totalCost, workOrderId]
        );

        // Reset vehicle maintenance plan if tied to a rule
        if (order.rule_id) {
          const [vRows] = await conn.execute(`SELECT current_odometer FROM vehicles WHERE id = ?`, [order.vehicle_id]);
          const [ruleRows] = await conn.execute(`SELECT interval_km, interval_days FROM maintenance_rules WHERE id = ?`, [order.rule_id]);

          if (vRows.length && ruleRows.length) {
            const curOdo = parseFloat(vRows[0].current_odometer);
            const nextOdo = curOdo + parseFloat(ruleRows[0].interval_km);
            const nextDate = new Date(Date.now() + (ruleRows[0].interval_days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

            await conn.execute(
              `UPDATE vehicle_maintenance_plans 
               SET last_service_odometer = ?, last_service_date = CURDATE(), next_due_odometer = ?, next_due_date = ?, maintenance_status = 'NORMAL'
               WHERE vehicle_id = ? AND rule_id = ?`,
              [curOdo, nextOdo, nextDate, order.vehicle_id, order.rule_id]
            );
          }

          // Mark recommendation resolved
          await conn.execute(
            `UPDATE maintenance_recommendations 
             SET is_resolved = TRUE, resolved_work_order_id = ?
             WHERE vehicle_id = ? AND rule_id = ? AND is_resolved = FALSE`,
            [workOrderId, order.vehicle_id, order.rule_id]
          );
        }

        // Restore vehicle to AVAILABLE
        await setVehicleStatus(conn, order.vehicle_id, VEHICLE_STATUSES.AVAILABLE, userId, req);
      }

      broadcastEvent(SOCKET_EVENTS.WORK_ORDER_UPDATED, { workOrderId, status });
      broadcastEvent(SOCKET_EVENTS.METRICS_REFRESH, { reason: 'Work Order Updated' });

      return { workOrderId, status };
    });
  }

  static async getSparePartsInventory() {
    const [parts] = await pool.execute(`SELECT * FROM spare_parts ORDER BY category, part_name`);
    return parts;
  }
}
