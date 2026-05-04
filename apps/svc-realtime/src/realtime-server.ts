import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

export interface WebSocketEvents {
  // Order events
  'order:created': (order: OrderEvent) => void;
  'order:statuschanged': (order: StatusChangeEvent) => void;
  'order:driverassigned': (order: DriverAssignedEvent) => void;
  'order:etaupdated': (order: ETAUpdateEvent) => void;
  'order:delivered': (order: OrderEvent) => void;
  
  // Driver events
  'driver:location': (location: DriverLocationEvent) => void;
  'driver:status': (status: DriverStatusEvent) => void;
  'driver:accepted': (data: { orderId: string; driverId: string }) => void;
  
  // General events
  'ping': () => void;
  'pong': () => void;
}

export interface OrderEvent {
  orderId: string;
  orderNumber: string;
  userId: string;
  status: string;
  timestamp: Date;
}

export interface StatusChangeEvent extends OrderEvent {
  previousStatus: string;
  newStatus: string;
}

export interface DriverAssignedEvent extends OrderEvent {
  driverId: string;
  driverName: string;
  driverPhone: string;
}

export interface ETAUpdateEvent extends OrderEvent {
  eta: number; // minutes
  distance: number; // km
}

export interface DriverLocationEvent {
  driverId: string;
  orderId?: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface DriverStatusEvent {
  driverId: string;
  status: 'online' | 'offline' | 'busy';
}

export class RealtimeServer {
  private io: Server;
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> socketIds

  constructor(httpServer?: createServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupAuth();
    this.setupConnection();
    this.setupHandlers();
  }

  private setupAuth() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET || 'secret');
        (socket as any).user = decoded;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupConnection() {
    this.io.on('connection', (socket) => {
      const user = (socket as any).user as any;
      console.log(`User connected: ${user.id} (${socket.id})`);

      // Join user-specific room
      socket.join(`user:${user.id}`);

      // Join role-specific rooms
      if (user.role === 'driver') {
        socket.join('drivers');
        this.io.to('drivers').emit('driver:online', { driverId: user.id });
      }

      socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${user.id} (${reason})`);
        
        if (user.role === 'driver') {
          this.io.to('drivers').emit('driver:offline', { driverId: user.id });
        }
      });
    });
  }

  private setupHandlers() {
    // Ping/pong for connection health
    this.io.on('connect', (socket) => {
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  // Order events
  emitOrderCreated(order: OrderEvent) {
    this.io.to(`user:${order.userId}`).emit('order:created', order);
    this.io.to('orders').emit('order:created', order);
  }

  emitOrderStatusChanged(event: StatusChangeEvent) {
    this.io.to(`user:${event.userId}`).emit('order:statuschanged', event);
    this.io.to('orders').emit('order:statuschanged', event);
  }

  emitDriverAssigned(event: DriverAssignedEvent) {
    this.io.to(`user:${event.userId}`).emit('order:driverassigned', event);
    this.io.to(`driver:${event.driverId}`).emit('order:driverassigned', event);
  }

  emitETAUpdate(event: ETAUpdateEvent) {
    this.io.to(`user:${event.userId}`).emit('order:etaupdated', event);
  }

  emitOrderDelivered(order: OrderEvent) {
    this.io.to(`user:${order.userId}`).emit('order:delivered', order);
    this.io.to('orders').emit('order:delivered', order);
  }

  // Driver events
  emitDriverLocation(event: DriverLocationEvent) {
    if (event.orderId) {
      this.io.to(`order:${event.orderId}`).emit('driver:location', {
        orderId: event.orderId,
        lat: event.lat,
        lng: event.lng,
        heading: event.heading,
        timestamp: event.timestamp,
      });
    }
    this.io.to('drivers').emit('driver:location', event);
  }

  emitDriverStatus(event: DriverStatusEvent) {
    this.io.to('drivers').emit('driver:status', event);
  }

  // Broadcast to order room
  joinOrderRoom(socketId: string, orderId: string) {
    const room = `order:${orderId}`;
    this.io.sockets.sockets.get(socketId)?.join(room);
    
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room)!.add(socketId);
  }

  leaveOrderRoom(socketId: string, orderId: string) {
    const room = `order:${orderId}`;
    this.io.sockets.sockets.get(socketId)?.leave(room);
    this.rooms.get(room)?.delete(socketId);
  }

  // Get connected users count
  getConnectedCount(): number {
    return this.io.engine.clientsCount;
  }

  // Get drivers online count
  getDriversOnlineCount(): number {
    let count = 0;
    const driverRoom = this.io.sockets.adapter.rooms.get('drivers');
    if (driverRoom) {
      count = driverRoom.size;
    }
    return count;
  }

  // Close server
  async close() {
    return this.io.close();
  }
}

export default RealtimeServer;