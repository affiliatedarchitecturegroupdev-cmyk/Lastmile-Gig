import { Injectable } from '@nestjs/common';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-100
  orderCount: number;
  revenue: number;
}

export interface GridCell {
  id: string;
  lat: number;
  lng: number;
  latDelta: number;
  lngDelta: number;
  metrics: {
    orders: number;
    revenue: number;
    avgDeliveryTime: number;
    activeDrivers: number;
    demand: number;
  };
}

export interface ZoneMetrics {
  zoneId: string;
  zoneName: string;
  center: { lat: number; lng: number };
  cells: GridCell[];
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  hotSpots: HeatmapPoint[];
}

@Injectable()
export class HeatmapService {
  private gridData: Map<string, GridCell[]> = new Map();

  /**
   * Get heatmap for area
   */
  async getHeatmap(data: {
    centerLat: number;
    centerLng: number;
    radiusKm: number;
  }): Promise<HeatmapPoint[]> {
    const points: HeatmapPoint[] = [];
    
    // Generate grid points around center
    const gridSize = 10;
    const latStep = data.radiusKm / 111 * 2 / gridSize;
    const lngStep = data.radiusKm / 111 * 2 / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const lat = data.centerLat + (i - gridSize / 2) * latStep;
        const lng = data.centerLng + (j - gridSize / 2) * lngStep;
        
        // Calculate intensity based on (simulated) order density
        const distance = Math.sqrt(Math.pow(i - gridSize/2, 2) + Math.pow(j - gridSize/2, 2));
        const maxDist = Math.sqrt(2) * gridSize / 2;
        const intensity = Math.max(0, 100 * (1 - distance / maxDist));
        
        // Add variation
        const variation = (Math.random() - 0.5) * 40;
        const finalIntensity = Math.min(100, Math.max(0, intensity + variation));

        points.push({
          lat,
          lng,
          intensity: finalIntensity,
          orderCount: Math.floor(finalIntensity * 0.5),
          revenue: Math.floor(finalIntensity * 150),
        });
      }
    }

    return points;
  }

  /**
   * Get zone metrics
   */
  async getZoneMetrics(zoneId: string): Promise<ZoneMetrics> {
    const zoneCells = this.gridData.get(zoneId) || this.generateZoneData(zoneId);
    
    const totalOrders = zoneCells.reduce((sum, c) => sum + c.metrics.orders, 0);
    const totalRevenue = zoneCells.reduce((sum, c) => sum + c.metrics.revenue, 0);

    return {
      zoneId,
      zoneName: zoneId.charAt(0).toUpperCase() + zoneId.slice(1),
      center: { lat: -26.2041, lng: 28.0473 },
      cells: zoneCells,
      totalOrders,
      totalRevenue,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      hotSpots: this.findHotSpots(zoneCells),
    };
  }

  /**
   * Generate zone data
   */
  private generateZoneData(zoneId: string): GridCell[] {
    const cells: GridCell[] = [];
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const demand = Math.floor(Math.random() * 100);
        cells.push({
          id: `${zoneId}_${i}_${j}`,
          lat: -26.2 + i * 0.01,
          lng: 28.0 + j * 0.01,
          latDelta: 0.01,
          lngDelta: 0.01,
          metrics: {
            orders: demand * 2,
            revenue: demand * 250,
            avgDeliveryTime: 20 + Math.random() * 15,
            activeDrivers: Math.floor(demand * 0.3),
            demand,
          },
        });
      }
    }

    return cells;
  }

  /**
   * Find hot spots
   */
  private findHotSpots(cells: GridCell[]): HeatmapPoint[] {
    return cells
      .filter(c => c.metrics.demand > 70)
      .map(c => ({
        lat: c.lat,
        lng: c.lng,
        intensity: c.metrics.demand,
        orderCount: c.metrics.orders,
        revenue: c.metrics.revenue,
      }));
  }

  /**
   * Get demand by hour
   */
  async getHourlyDemand(zoneId: string, date?: string): Promise<{ hour: number; demand: number }[]> {
    const hourly: { hour: number; demand: number }[] = [];
    
    for (let hour = 6; hour < 24; hour++) {
      // Simulate lunch/dinner peaks
      let demand = 20;
      if (hour >= 11 && hour < 14) demand = 60 + Math.random() * 30;
      else if (hour >= 18 && hour < 21) demand = 80 + Math.random() * 20;
      else if (hour >= 21 && hour < 23) demand = 40 + Math.random() * 20;
      
      hourly.push({ hour, demand: Math.floor(demand) });
    }

    return hourly;
  }

  /**
   * Compare zones
   */
  async compareZones(zoneIds: string[]): Promise<{
    zoneId: string;
    orders: number;
    revenue: number;
    avgDeliveryTime: number;
  }[]> {
    const comparison: any[] = [];
    
    for (const zoneId of zoneIds) {
      const metrics = await this.getZoneMetrics(zoneId);
      comparison.push({
        zoneId,
        orders: metrics.totalOrders,
        revenue: metrics.totalRevenue,
        avgDeliveryTime: 25 + Math.random() * 10,
      });
    }

    return comparison;
  }

  /**
   * Get top performing cells
   */
  async getTopCells(zoneId: string, limit: number = 5): Promise<GridCell[]> {
    const cells = this.gridData.get(zoneId) || this.generateZoneData(zoneId);
    return cells
      .sort((a, b) => b.metrics.demand - a.metrics.demand)
      .slice(0, limit);
  }
}