import { Injectable, Logger } from '@nestjs/common';

export interface OptimizationResult {
  routeId: string;
  stops: OptimizedStop[];
  totalDistance: number;
  estimatedTime: number;
  fuelCost: number;
  savings: number;
}

interface OptimizedStop {
  orderId: string;
  sequence: number;
  lat: number;
  lng: number;
  estimatedArrival: Date;
}

@Injectable()
export class RouteOptimizationService {
  private readonly logger = new Logger(RouteOptimizationService.name);

  async optimize(orderIds: string[], baseLocation: { lat: number; lng: number }): Promise<OptimizationResult> {
    // Simulate nearest neighbor + 2-opt improvement
    const stops: OptimizedStop[] = orderIds.map((orderId, idx) => ({
      orderId,
      sequence: idx + 1,
      lat: baseLocation.lat + idx * 0.005,
      lng: baseLocation.lng + idx * 0.005,
      estimatedArrival: new Date(Date.now() + (idx + 1) * 15 * 60000),
    }));

    const totalDistance = stops.length * 2.5;
    const estimatedTime = stops.length * 12;
    const fuelCost = totalDistance * 2.5;
    const savings = (stops.length * 3) - totalDistance;

    return { routeId: `route_${Date.now()}`, stops, totalDistance: Math.round(totalDistance * 10) / 10, estimatedTime, fuelCost, savings: Math.round(savings * 10) / 10 };
  }

  async calculateETA(startLat: number, startLng: number, endLat: number, endLng: number, trafficFactor: number): Promise<number> {
    const distance = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)) * 111;
    const avgSpeed = 30 / trafficFactor;
    return Math.ceil(distance / avgSpeed * 60);
  }
}