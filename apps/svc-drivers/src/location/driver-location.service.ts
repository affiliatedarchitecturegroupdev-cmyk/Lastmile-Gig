import { Injectable } from '@nestjs/common';

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  accuracy: number;
  altitude: number | null;
  timestamp: Date;
}

export interface DriverZone {
  driverId: string;
  zone: string;
  enteredAt: Date;
}

@Injectable()
export class DriverLocationService {
  private locations: Map<string, DriverLocation[]> = new Map();
  private zones: Map<string, DriverZone> = new Map();

  async updateLocation(driverId: string, location: Omit<DriverLocation, 'driverId' | 'timestamp'>): Promise<DriverLocation> {
    const loc: DriverLocation = {
      driverId,
      ...location,
      timestamp: new Date(),
    };

    const driverLocations = this.locations.get(driverId) || [];
    driverLocations.push(loc);
    
    // Keep last 100 locations
    if (driverLocations.length > 100) {
      driverLocations.shift();
    }
    this.locations.set(driverId, driverLocations);

    // Check zone change
    const newZone = this.calculateZone(location.lat, location.lng);
    const current = this.zones.get(driverId);
    
    if (!current || current.zone !== newZone) {
      this.zones.set(driverId, { driverId, zone: newZone, enteredAt: new Date() });
    }

    return loc;
  }

  async getCurrentLocation(driverId: string): Promise<DriverLocation | null> {
    const locations = this.locations.get(driverId);
    return locations ? locations[locations.length - 1] : null;
  }

  async getLocationHistory(driverId: string, limit = 100): Promise<DriverLocation[]> {
    return (this.locations.get(driverId) || []).slice(-limit);
  }

  async getNearbyDrivers(lat: number, lng: number, radiusKm: number): Promise<DriverLocation[]> {
    const nearby: DriverLocation[] = [];
    
    for (const [driverId, locations] of this.locations) {
      const current = locations[locations.length - 1];
      if (!current) continue;
      
      const distance = this.calculateDistance({ lat, lng }, current);
      if (distance <= radiusKm) {
        nearby.push(current);
      }
    }
    
    return nearby;
  }

  async getZone(driverId: string): Promise<DriverZone | null> {
    return this.zones.get(driverId) || null;
  }

  async findDriversInZone(zone: string): Promise<string[]> {
    const inZone: string[] = [];
    for (const [driverId, driverZone] of this.zones) {
      if (driverZone.zone === zone) {
        inZone.push(driverId);
      }
    }
    return inZone;
  }

  private calculateZone(lat: number, lng: number): string {
    // Simplified zone calculation
    const latZone = Math.floor(lat * 100) / 100;
    const lngZone = Math.floor(lng * 100) / 100;
    return `zone_${latZone}_${lngZone}`;
  }

  private calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}