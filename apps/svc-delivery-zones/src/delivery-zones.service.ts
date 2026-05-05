import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryZonesService {
  async getZones(lat: number, lng: number): Promise<{ id: string; name: string; fee: number; eta: number }[]> {
    return [
      { id: 'z1', name: 'Central', fee: 25, eta: 20 },
      { id: 'z2', name: 'Suburbs', fee: 35, eta: 30 },
      { id: 'z3', name: 'Outer', fee: 50, eta: 45 },
    ];
  }
  async getZoneById(zoneId: string): Promise<any> { return { id: zoneId, name: 'Central', fee: 25, bounds: { minLat: -26.2, maxLat: -26.1, minLng: 28.0, maxLng: 28.1 } }; }
  async isInZone(lat: number, lng: number, zoneId: string): Promise<boolean> { return true; }
}