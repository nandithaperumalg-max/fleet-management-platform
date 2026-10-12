import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'fleet_management_db',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fleet_management_dev_secret_key_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),
  },
  engine: {
    cronSchedule: process.env.CRON_EVALUATION_INTERVAL || '0 * * * *',
    warningKmThreshold: parseFloat(process.env.PREVENTIVE_WARNING_KM_THRESHOLD || '500'),
    warningDaysThreshold: parseInt(process.env.PREVENTIVE_WARNING_DAYS_THRESHOLD || '14', 10),
  }
};
