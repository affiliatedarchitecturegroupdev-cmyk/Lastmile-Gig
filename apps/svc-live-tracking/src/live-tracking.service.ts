import { Injectable } from '@nestjs/common';

export interface Location { lat: number; lng: number; timestamp: Date; }
export interface LiveTracking { orderId: string; driverId: string; status: string; location: Location; eta: number; }

@Injectable()
export class LiveTrackingService {
  private tracking: Map<string, LiveTracking> = new Map();

  async startTracking(orderId: string, driverId: string): Promise<LiveTracking> {
    const track: LiveTracking = { orderId, driverId, status: 'picking_up', location: { lat: -26.2041, lng: 28.0473, timestamp: new Date() }, eta: 25 };
    this.tracking.set(orderId, track);
    return track;
  }

  async updateLocation(orderId: string, lat: number, lng: number): Promise<boolean> {
    const track = this.tracking.get(orderId);
    if (!track) return false;
    track.location = { lat, lng, timestamp: new Date() };
    track.eta = Math.max(1, track.eta - 1);
    return true;
  }

  async getTracking(orderId: string): Promise<LiveTracking | null> { return this.tracking.get(orderId) || null; }

  async confirmDelivery(orderId: string, photoUrl?: string): Promise<boolean> {
    const track = this.tracking.get(orderId);
    if (!track) return false;
    track.status = 'delivered';
    return true;
  }

  async getEta(orderId: string): Promise<number> {
    const track = this.tracking.get(orderId);
    return track?.eta || 0;
  }

  async getRoute(driverId: string): Promise<{ points: Location[]; distance: number }> {
    return { points: [{ lat: -26.2041, lng: 28.0473, timestamp: new Date() }], distance: 5.2 };
  }
}