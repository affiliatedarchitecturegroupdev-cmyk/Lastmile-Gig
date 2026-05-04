import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

export interface LocationUpdate {
  orderId: string;
  driverId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

@Injectable()
export class TrackingService {
  private locations: Map<string, LocationUpdate[]> = new Map();
  private io: Server | null = null;

  setSocketServer(io: Server) {
    this.io = io;
  }

  async updateLocation(orderId: string, update: Omit<LocationUpdate, 'orderId' | 'timestamp'>): Promise<void> {
    const location: LocationUpdate = {
      orderId,
      ...update,
      timestamp: new Date(),
    };

    const orderLocations = this.locations.get(orderId) || [];
    orderLocations.push(location);
    this.locations.set(orderId, orderLocations);

    // Broadcast to subscribers
    if (this.io) {
      this.io.to(`order:${orderId}`).emit('location', location);
    }
  }

  async getLocationHistory(orderId: string, limit = 50): Promise<LocationUpdate[]> {
    return (this.locations.get(orderId) || []).slice(-limit);
  }

  async getCurrentLocation(orderId: string): Promise<LocationUpdate | null> {
    const locations = this.locations.get(orderId) || [];
    return locations[locations.length - 1] || null;
  }

  async subscribe(orderId: string, clientId: string): Promise<void> {
    // Client subscribes to order updates
    // In production, manage via Socket.IO rooms
  }

  async unsubscribe(orderId: string, clientId: string): Promise<void> {
    // Client unsubscribes
  }

  async broadcastStatus(orderId: string, status: string, data: any): Promise<void> {
    if (this.io) {
      this.io.to(`order:${orderId}`).emit('status', { status, data });
    }
  }
}