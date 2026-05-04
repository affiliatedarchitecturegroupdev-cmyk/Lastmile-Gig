import { Server } from 'socket.io';
import { DriverLocationEvent } from './events.types';

export class DriverLocationService {
  private io: Server;
  private locations: Map<string, DriverLocationEvent> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly MAX_HISTORY = 100;
  private locationHistory: Map<string, DriverLocationEvent[]> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  // Handle driver location update
  handleLocationUpdate(event: DriverLocationEvent) {
    // Store current location
    this.locations.set(event.driverId, event);

    // Store in history
    const history = this.locationHistory.get(event.driverId) || [];
    history.push(event);
    if (history.length > this.MAX_HISTORY) {
      history.shift();
    }
    this.locationHistory.set(event.driverId, history);

    // Broadcast to order room if tracking an order
    if (event.orderId) {
      this.io.to(`order:${event.orderId}`).emit('driver:location', {
        orderId: event.orderId,
        lat: event.lat,
        lng: event.lng,
        heading: event.heading,
        speed: event.speed,
        timestamp: event.timestamp,
      });

      // Also send to customer
      this.io.to(`order:${event.orderId}`).emit('driver:location', {
        driverId: event.driverId,
        lat: event.lat,
        lng: event.lng,
        heading: event.heading,
        speed: event.speed,
        timestamp: event.timestamp,
      });
    }

    // Broadcast to driver room for nearby driver discovery
    this.io.to('drivers').emit('driver:location:sparse', {
      driverId: event.driverId,
      lat: event.lat,
      lng: event.lng,
      orderId: event.orderId,
    });
  }

  // Get driver's current location
  getLocation(driverId: string): DriverLocationEvent | undefined {
    return this.locations.get(driverId);
  }

  // Get driver's location history
  getHistory(driverId: string, limit = 10): DriverLocationEvent[] {
    const history = this.locationHistory.get(driverId) || [];
    return history.slice(-limit);
  }

  // Get nearby drivers
  async getNearbyDrivers(lat: number, lng: number, radiusKm: number): Promise<DriverLocationEvent[]> {
    const nearby: DriverLocationEvent[] = [];
    
    for (const [driverId, location] of this.locations) {
      const distance = this.calculateDistance(
        lat, lng,
        location.lat, location.lng
      );
      
      if (distance <= radiusKm) {
        nearby.push({
          driverId,
          lat: location.lat,
          lng: location.lng,
          distance,
          timestamp: location.timestamp,
        });
      }
    }

    return nearby.sort((a, b) => (a as any).distance - (b as any).distance);
  }

  // Calculate distance between two points
  private calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Remove driver when offline
  removeDriver(driverId: string) {
    this.locations.delete(driverId);
    this.locationHistory.delete(driverId);
    
    const interval = this.updateIntervals.get(driverId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(driverId);
    }

    this.io.to('drivers').emit('driver:offline', { driverId });
  }

  // Cleanup
  cleanup() {
    for (const interval of this.updateIntervals.values()) {
      clearInterval(interval);
    }
    this.locations.clear();
    this.locationHistory.clear();
    this.updateIntervals.clear();
  }
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