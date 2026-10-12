import mysql from 'mysql2/promise';
import { config } from './env.js';

// Initialize High-Throughput Connection Pool
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: config.db.waitForConnections,
  connectionLimit: config.db.connectionLimit,
  queueLimit: config.db.queueLimit,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
  decimalNumbers: true
});

// Test database connection with retry
export async function testConnection(retries = 5, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log(`[Database] Successfully connected to MySQL pool (${config.db.database}@${config.db.host}:${config.db.port})`);
      connection.release();
      return true;
    } catch (err) {
      console.warn(`[Database] Connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error(`[Database] Could not connect to MySQL database after ${retries} attempts.`);
        return false;
      }
    }
  }
}

/**
 * Execute work inside an ACID transaction with automatic commit/rollback
 * @param {Function} callback Function receiving connection parameter
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
