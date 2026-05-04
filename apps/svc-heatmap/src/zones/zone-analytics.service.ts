import { Injectable } from '@nestjs/common';

export interface Zone {
  id: string;
  name: string;
  polygon: { lat: number; lng: number }[];
  status: 'active' | 'inactive' | 'restricted';
  driverCapacity: number;
  activeDrivers: number;
}

export interface ZoneAnalytics {
  zoneId: string;
  period: string;
  orders: number;
  revenue: number;
  avgDeliveryTime: number;
  driverUtilization: number;
  demandVsSupply: number;
}

@Injectable()
export class ZoneAnalyticsService {
  private zones: Map<string, Zone> = new Map();

  constructor() {
    this.initializeZones();
  }

  private initializeZones(): void {
    const defaultZones: Zone[] = [
      { id: 'sandton', name: 'Sandton', polygon: [{ lat: -26.1076, lng: 28.0561 }], status: 'active', driverCapacity: 50, activeDrivers: 35 },
      { id: 'rosebank', name: 'Rosebank', polygon: [{ lat: -26.1275, lng: 28.0393 }], status: 'active', driverCapacity: 30, activeDrivers: 22 },
      { id: 'midrand', name: 'Midrand', polygon: [{ lat: -26.0100, lng: 28.0700 }], status: 'active', driverCapacity: 25, activeDrivers: 18 },
      { id: 'centurion', name: 'Centurion', polygon: [{ lat: -25.8600, lng: 28.1800 }], status: 'active', driverCapacity: 20, activeDrivers: 15 },
      { id: 'jhb_cbd', name: 'Johannesburg CBD', polygon: [{ lat: -26.2041, lng: 28.0473 }], status: 'active', driverCapacity: 45, activeDrivers: 38 },
      { id: 'alexandra', name: 'Alexandra', polygon: [{ lat: -26.1000, lng: 28.1000 }], status: 'active', driverCapacity: 15, activeDrivers: 8 },
    ];

    for (const zone of defaultZones) {
      this.zones.set(zone.id, zone);
    }
  }

  /**
   * Get all zones
   */
  async getAllZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  /**
   * Get zone by ID
   */
  async getZone(zoneId: string): Promise<Zone | null> {
    return this.zones.get(zoneId) || null;
  }

  /**
   * Get zone analytics
   */
  async getZoneAnalytics(zoneId: string): Promise<ZoneAnalytics> {
    const zone = this.zones.get(zoneId);
    
    const orders = Math.floor(Math.random() * 500) + 200;
    const revenue = orders * 250;
    const avgDeliveryTime = 22 + Math.random() * 10;
    const driverUtilization = (orders / (zone?.driverCapacity || 50)) * 100;

    return {
      zoneId,
      period: 'Last 7 days',
      orders,
      revenue,
      avgDeliveryTime,
      driverUtilization,
      demandVsSupply: driverUtilization > 80 ? 1 : 0,
    };
  }

  /**
   * Get zone performance ranking
   */
  async getZoneRanking(): Promise<{
    rank: number;
    zoneId: string;
    name: string;
    orders: number;
    revenue: number;
    utilization: number;
  }[]> {
    const zones = Array.from(this.zones.values());
    
    return zones.map((zone, i) => ({
      rank: i + 1,
      zoneId: zone.id,
      name: zone.name,
      orders: Math.floor(Math.random() * 500) + 200,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      utilization: Math.floor(Math.random() * 100),
    }));
  }

  /**
   * Check zone coverage
   */
  async checkZoneCoverage(zoneId: string): Promise<{
    covered: boolean;
    coverage: number;
    recommendation: string;
  }> {
    const zone = this.zones.get(zoneId);
    if (!zone) return { covered: false, coverage: 0, recommendation: 'Unknown zone' };

    const coverage = (zone.activeDrivers / zone.driverCapacity) * 100;
    
    return {
      covered: coverage >= 60,
      coverage: Math.floor(coverage),
      recommendation: coverage < 60 ? 'Add more drivers' : 'Zone well covered',
    };
  }

  /**
   * Get demand heatmap
   */
  async getDemandHeatmap(): Promise<{
    zoneId: string;
    demand: number;
    coordinates: { lat: number; lng: number };
  }[]> {
    return Array.from(this.zones.values()).map(zone => ({
      zoneId: zone.id,
      demand: Math.floor(Math.random() * 100),
      coordinates: zone.polygon[0],
    }));
  }

  /**
   * Recommend zones for expansion
   */
  async recommendExpansion(): Promise<{
    zoneId: string;
    currentDemand: number;
    currentDrivers: number;
    expansionPriority: 'high' | 'medium' | 'low';
  }[]> {
    const zones = Array.from(this.zones.values());
    
    return zones.map(zone => {
      const demand = Math.floor(Math.random() * 100);
      const priority = demand > 80 ? 'high' : demand > 50 ? 'medium' : 'low';
      
      return {
        zoneId: zone.id,
        currentDemand: demand,
        currentDrivers: zone.activeDrivers,
        expansionPriority: priority,
      };
    });
  }

  /**
   * Get zone health score
   */
  async getZoneHealth(zoneId: string): Promise<{
    score: number;
    status: 'healthy' | 'warning' | 'critical';
    factors: { name: string; value: number; weight: number };
  }> {
    const analytics = await this.getZoneAnalytics(zoneId);
    
    const score = Math.min(100, analytics.driverUtilization);
    const status = score >= 70 ? 'healthy' : score >= 40 ? 'warning' : 'critical';
    
    return {
      score: Math.floor(score),
      status,
      factors: [
        { name: 'Driver Utilization', value: analytics.driverUtilization, weight: 0.4 },
        { name: 'Delivery Time', value: 100 - analytics.avgDeliveryTime, weight: 0.3 },
        { name: 'Order Volume', value: analytics.orders / 5, weight: 0.3 },
      ],
    };
  }
}