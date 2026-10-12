import { Server } from 'socket.io';
import { config } from '../config/env.js';

let ioInstance = null;

export const SOCKET_EVENTS = {
  VEHICLE_STATUS_CHANGED: 'vehicle:status_changed',
  TRIP_DISPATCHED: 'trip:dispatched',
  TRIP_COMPLETED: 'trip:completed',
  MAINTENANCE_ALERT: 'maintenance:alert',
  WORK_ORDER_UPDATED: 'work_order:updated',
  FUEL_ANOMALY: 'fuel:anomaly_detected',
  METRICS_REFRESH: 'metrics:refresh'
};

/**
 * Initialize Socket.io server
 * @param {import('http').Server} httpServer
 */
export function initSocketManager(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`[WebSocket] Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return ioInstance;
}

/**
 * Broadcast event to all connected clients or a specific room
 * @param {string} event Event name from SOCKET_EVENTS
 * @param {any} data Payload
 * @param {string} [room] Optional target room
 */
export function broadcastEvent(event, data, room = null) {
  if (!ioInstance) {
    return;
  }
  if (room) {
    ioInstance.to(room).emit(event, { ...data, timestamp: new Date().toISOString() });
  } else {
    ioInstance.emit(event, { ...data, timestamp: new Date().toISOString() });
  }
}
