import { Injectable } from '@nestjs/common';

export interface DeliveryZone {
  id: string;
  partnerId: string;
  name: string;
  polygon: GeoJSON;
  deliveryFee: number;
  minimumOrder: number;
  estimatedMinutes: number;
}

export interface GeoJSON {
  type: 'Polygon';
  coordinates: number[][][];
}

@Injectable()
export class ZonesService {
  private zones: Map<string, DeliveryZone[]> = new Map();

  async create(partnerId: string, dto: any): Promise<DeliveryZone> {
    if (!this.validatePolygon(dto.polygon)) {
      throw new Error('Invalid polygon');
    }

    const zone: DeliveryZone = {
      id: crypto.randomUUID(),
      partnerId,
      name: dto.name,
      polygon: dto.polygon,
      deliveryFee: dto.deliveryFee || 35,
      minimumOrder: dto.minimumOrder || 100,
      estimatedMinutes: dto.estimatedMinutes || 30,
    };

    const partnerZones = this.zones.get(partnerId) || [];
    partnerZones.push(zone);
    this.zones.set(partnerId, partnerZones);

    return zone;
  }

  async findById(id: string): Promise<DeliveryZone | null> {
    for (const zones of this.zones.values()) {
      const zone = zones.find(z => z.id === id);
      if (zone) return zone;
    }
    return null;
  }

  async list(partnerId: string): Promise<DeliveryZone[]> {
    return this.zones.get(partnerId) || [];
  }

  async update(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone> {
    const zone = await this.findById(id);
    if (!zone) throw new Error('Zone not found');
    Object.assign(zone, data);
    return zone;
  }

  async delete(id: string): Promise<void> {
    for (const [partnerId, zones] of this.zones) {
      const idx = zones.findIndex(z => z.id === id);
      if (idx >= 0) {
        zones.splice(idx, 1);
        this.zones.set(partnerId, zones);
        return;
      }
    }
  }

  async findZoneContaining(partnerId: string, point: { lat: number; lng: number }): Promise<DeliveryZone | null> {
    const zones = await this.list(partnerId);
    for (const zone of zones) {
      if (this.pointInPolygon(point, zone.polygon)) {
        return zone;
      }
    }
    return null;
  }

  async calculateFee(partnerId: string, point: { lat: number; lng: number }): Promise<{ fee: number; zone: string; estimatedMinutes: number }> {
    const zone = await this.findZoneContaining(partnerId, point);
    if (zone) {
      return {
        fee: zone.deliveryFee,
        zone: zone.name,
        estimatedMinutes: zone.estimatedMinutes,
      };
    }
    // Not in any zone - return default
    return { fee: 0, zone: 'default', estimatedMinutes: 0 };
  }

  validatePolygon(polygon: GeoJSON): boolean {
    if (!polygon || polygon.type !== 'Polygon') return false;
    if (!polygon.coordinates || polygon.coordinates.length === 0) return false;

    // Check if polygon is closed
    const ring = polygon.coordinates[0];
    if (ring.length < 4) return false;
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      return false;
    }

    return true;
  }

  pointInPolygon(point: { lat: number; lng: number }, polygon: GeoJSON): boolean {
    const ring = polygon.coordinates[0];
    let inside = false;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];

      if (((yi > point.lng) !== (yj > point.lng)) &&
          (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }
}