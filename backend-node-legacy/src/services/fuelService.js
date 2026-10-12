import { pool, withTransaction } from '../config/db.js';
import { logAudit } from '../middleware/audit.js';
import { broadcastEvent, SOCKET_EVENTS } from '../sockets/socketManager.js';

export class FuelService {
  static async getAllFuelLogs(filters = {}) {
    let query = `
      SELECT fl.*, 
        v.license_plate, v.make, v.model,
        u.full_name AS driver_name
      FROM fuel_logs fl
      JOIN vehicles v ON fl.vehicle_id = v.id
      JOIN drivers d ON fl.driver_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.vehicle_id) {
      query += ` AND fl.vehicle_id = ?`;
      params.push(filters.vehicle_id);
    }
    if (filters.is_anomaly_flag !== undefined) {
      query += ` AND fl.is_anomaly_flag = ?`;
      params.push(filters.is_anomaly_flag);
    }

    query += ` ORDER BY fl.transaction_date DESC`;
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async logFuelTransaction(data, userId = null, req = null) {
    return await withTransaction(async (conn) => {
      const {
        vehicle_id, driver_id, trip_id, transaction_date,
        fuel_quantity_liters, unit_price, odometer_at_refuel,
        station_name, receipt_number
      } = data;

      const qty = parseFloat(fuel_quantity_liters);
      const price = parseFloat(unit_price);
      const totalCost = qty * price;
      const odo = parseFloat(odometer_at_refuel);

      // Find previous fuel transaction for this vehicle to compute km/L
      const [prevLogs] = await conn.execute(
        `SELECT odometer_at_refuel FROM fuel_logs 
         WHERE vehicle_id = ? ORDER BY transaction_date DESC, id DESC LIMIT 1`,
        [vehicle_id]
      );

      let fuelEconomy = null;
      let isAnomaly = false;

      if (prevLogs.length > 0) {
        const prevOdo = parseFloat(prevLogs[0].odometer_at_refuel);
        const distanceDelta = odo - prevOdo;
        if (distanceDelta > 0 && qty > 0) {
          fuelEconomy = parseFloat((distanceDelta / qty).toFixed(2));

          // Check rolling average for this vehicle
          const [avgRows] = await conn.execute(
            `SELECT AVG(fuel_economy_kml) AS avg_kml 
             FROM fuel_logs 
             WHERE vehicle_id = ? AND fuel_economy_kml IS NOT NULL`,
            [vehicle_id]
          );

          if (avgRows.length && avgRows[0].avg_kml) {
            const historicalAvg = parseFloat(avgRows[0].avg_kml);
            // Flag anomaly if consumption is 25% worse than historical average
            if (fuelEconomy < (historicalAvg * 0.75)) {
              isAnomaly = true;
            }
          }
        }
      }

      const [res] = await conn.execute(
        `INSERT INTO fuel_logs 
         (vehicle_id, driver_id, trip_id, transaction_date, fuel_quantity_liters, unit_price, total_cost, odometer_at_refuel, station_name, receipt_number, fuel_economy_kml, is_anomaly_flag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vehicle_id, driver_id, trip_id || null, transaction_date || new Date(), qty, price, totalCost, odo, station_name, receipt_number || null, fuelEconomy, isAnomaly]
      );

      const fuelLogId = res.insertId;

      if (isAnomaly) {
        broadcastEvent(SOCKET_EVENTS.FUEL_ANOMALY, {
          fuelLogId,
          vehicleId: vehicle_id,
          calculatedEconomy: fuelEconomy,
          message: `Fuel anomaly detected for vehicle ID ${vehicle_id}. Efficiency is 25% lower than normal.`
        });
      }

      await logAudit({
        tableName: 'fuel_logs',
        recordId: fuelLogId,
        action: 'INSERT',
        newValues: { vehicle_id, totalCost, fuelEconomy, isAnomaly },
        userId,
        ipAddress: req?.ip
      }, conn);

      return { id: fuelLogId, total_cost: totalCost, fuel_economy_kml: fuelEconomy, is_anomaly_flag: isAnomaly };
    });
  }
}
