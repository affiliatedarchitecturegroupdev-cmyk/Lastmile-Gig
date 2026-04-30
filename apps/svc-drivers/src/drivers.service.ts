import { Injectable, NotFoundException } from '@nestjs/common';
export type DriverStatus = 'active' | 'idle' | 'offline' | 'busy';
export interface Driver { id: string; userId: string; status: DriverStatus; vehicleType: string; vehiclePlate: string; currentLatitude: number; currentLongitude: number; lastLocationAt: Date; currentZone: string; totalDeliveries: number; acceptanceRate: number; performanceScore: number; createdAt: Date; }
@Injectable()
export class DriversService { private drivers: Map<string, Driver> = new Map();
  async create(data: Partial<Driver>): Promise<Driver> { const driver: Driver = { id: crypto.randomUUID(), userId: data.userId!, status: 'offline', vehicleType: data.vehicleType || 'scooter', vehiclePlate: data.vehiclePlate || '', currentLatitude: 0, currentLongitude: 0, lastLocationAt: new Date(), currentZone: '', totalDeliveries: 0, acceptanceRate: 100, performanceScore: 0, createdAt: new Date() }; this.drivers.set(driver.id, driver); return driver; }
  async findById(id: string): Promise<Driver> { const driver = this.drivers.get(id); if (!driver) throw new NotFoundException('Driver not found'); return driver; }
  async findNearby(lat: number, lng: number, radiusKm: number): Promise<Driver[]> { return Array.from(this.drivers.values()).filter(d => (d.status === 'active' || d.status === 'idle') && this.isWithinRadius(lat, lng, d.currentLatitude, d.currentLongitude, radiusKm)); }
  async updateStatus(id: string, status: string): Promise<Driver> { const driver = await this.findById(id); driver.status = status as DriverStatus; return driver; }
  async updateLocation(id: string, lat: number, lng: number): Promise<Driver> { const driver = await this.findById(id); driver.currentLatitude = lat; driver.currentLongitude = lng; driver.lastLocationAt = new Date(); return driver; }
  async acceptOrder(driverId: string, orderId: string): Promise<{ accepted: boolean }> { const driver = await this.findById(driverId); driver.status = 'busy'; return { accepted: true }; }
  private isWithinRadius(lat1: number, lng1: number, lat2: number, lng2: number, radiusKm: number): boolean { const R = 6371; const dLat = this.toRad(lat2 - lat1); const dLng = this.toRad(lng2 - lng1); const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLng / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= radiusKm; }
  private toRad(deg: number): number { return deg * (Math.PI / 180); }
}
