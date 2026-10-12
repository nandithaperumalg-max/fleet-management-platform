import { pool } from '../config/db.js';

/**
 * Persist an immutable audit log entry into MySQL
 * @param {Object} params
 * @param {string} params.tableName Name of the table altered
 * @param {number} params.recordId Primary key of the altered record
 * @param {'INSERT'|'UPDATE'|'DELETE'|'STATUS_TRANSITION'} params.action Action performed
 * @param {Object} [params.oldValues] Object representing before state
 * @param {Object} [params.newValues] Object representing after state
 * @param {number} [params.userId] User who performed the action
 * @param {string} [params.ipAddress] Client IP address
 * @param {import('mysql2/promise').Connection} [connection] Optional transactional connection
 */
export async function logAudit({
  tableName,
  recordId,
  action,
  oldValues = null,
  newValues = null,
  userId = null,
  ipAddress = null
}, connection = null) {
  const query = `
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, performed_by_user_id, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    tableName,
    recordId,
    action,
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null,
    userId,
    ipAddress
  ];

  try {
    const executor = connection || pool;
    await executor.execute(query, values);
  } catch (error) {
    console.error(`[Audit Log Failure] Could not record audit for ${tableName} #${recordId}: ${error.message}`);
  }
}
