import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number;
  coordinates?: { lat: number; lng: number }[];
  rules: { allowed: boolean; speedLimit?: number; deliveryFee?: number };
}

@Injectable()
export class GeofencingService {
  private geofences: Map<string, Geofence> = new Map();

  async createGeofence(data: { name: string; type: 'circle' | 'polygon'; center: { lat: number; lng: number }; radius?: number; rules: { allowed: boolean; speedLimit?: number; deliveryFee?: number } }): Promise<Geofence> {
    const geofence: Geofence = { id: uuidv4(), ...data };
    this.geofences.set(geofence.id, geofence);
    return geofence;
  }

  async checkLocation(lat: number, lng: number): Promise<{ inside: boolean; geofence?: Geofence; rules: { allowed: boolean; speedLimit?: number; deliveryFee?: number } }> {
    for (const g of this.geofences.values()) {
      if (g.type === 'circle' && g.center && g.radius) {
        const dist = Math.sqrt(Math.pow(lat - g.center!.lat, 2) + Math.pow(lng - g.center!.lng, 2)) * 111;
        if (dist <= g.radius) return { inside: true, geofence: g, rules: g.rules };
      }
    }
    return { inside: false, rules: { allowed: true } };
  }

  async getGeofences(): Promise<Geofence[]> { return Array.from(this.geofences.values()); }
  async deleteGeofence(id: string): Promise<boolean> { return this.geofences.delete(id); }
  async updateGeofence(id: string, updates: Partial<Geofence>): Promise<boolean> {
    const g = this.geofences.get(id);
    if (!g) return false;
    this.geofences.set(id, { ...g, ...updates });
    return true;
  }
}