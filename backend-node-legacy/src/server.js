import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import { config } from './config/env.js';
import { testConnection, pool } from './config/db.js';
import { initSocketManager } from './sockets/socketManager.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runFleetMaintenanceEvaluation } from './engine/maintenanceEngine.js';
import apiRouter from './routes/index.js';

const app = express();
const server = http.createServer(app);

// 1. Initialize Real-Time WebSocket Gateway
initSocketManager(server);

// 2. Security & Core Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: config.cors.origin,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// 3. API Rate Limiting (Prevents Abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// 4. Mount API Routes
app.use('/api', apiRouter);

// 5. Global Error Handling
app.use(errorHandler);

// 6. Schedule Background Maintenance & Utilization Worker
if (config.env !== 'test') {
  cron.schedule(config.engine.cronSchedule, async () => {
    console.log('[Scheduler] Triggering periodic fleet maintenance evaluation...');
    await runFleetMaintenanceEvaluation();
  });
}

// 7. Start Server & Test Database Connection
async function startServer() {
  await testConnection();

  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Fleet Management Backend Server Started`);
    console.log(`📡 Port: ${config.port} | Mode: ${config.env}`);
    console.log(`🌐 API Endpoint: http://localhost:${config.port}/api`);
    console.log(`⚡ WebSocket Gateway: ws://localhost:${config.port}/socket.io/`);
    console.log(`⚙️ Core Engine Scheduler: Active (${config.engine.cronSchedule})`);
    console.log(`=======================================================`);
  });
}

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Gracefully closing server and database pool...`);
  server.close(async () => {
    try {
      await pool.end();
      console.log('[Shutdown] Database connection pool drained.');
      process.exit(0);
    } catch (err) {
      console.error('[Shutdown Error]', err);
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer().catch((err) => {
  console.error('[Startup Failure]', err);
  process.exit(1);
});

export { app, server };
