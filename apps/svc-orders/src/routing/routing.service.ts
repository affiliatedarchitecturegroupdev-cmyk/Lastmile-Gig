import { Injectable } from '@nestjs/common';

export interface Route {
  distance: number;
  duration: number;
  polyline: string;
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}

@Injectable()
export class RoutingService {
  private routes: Map<string, Route[]> = new Map();

  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: { lat: number; lng: number }[]
  ): Promise<Route> {
    // Simplified routing - in production, integrate with GoRouter/Maps API
    const distance = this.calculateDistance(origin, destination);
    const avgSpeed = 30; // km/h
    const duration = Math.ceil((distance / avgSpeed) * 60);
    
    const route: Route = {
      distance,
      duration,
      polyline: '',
      steps: [
        {
          instruction: `Drive ${distance.toFixed(1)} km to destination`,
          distance,
          duration,
          startLocation: origin,
          endLocation: destination,
        },
      ],
    };
    
    // Cache route
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    this.routes.set(cacheKey, [route]);
    
    return route;
  }

  async optimizeMultiStop(
    stops: { id: string; lat: number; lng: number }[]
  ): Promise<{ order: string[]; totalDistance: number; totalDuration: number }> {
    if (stops.length <= 2) {
      return {
        order: stops.map(s => s.id),
        totalDistance: 0,
        totalDuration: 0,
      };
    }

    // Simplified nearest-neighbor optimization
    const visited: string[] = [];
    const unvisited = [...stops];
    let current = unvisited.shift()!;
    visited.push(current.id);
    
    let totalDistance = 0;
    let totalDuration = 0;

    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let nearestDist = this.calculateDistance(current, nearest);

      for (const stop of unvisited) {
        const dist = this.calculateDistance(current, stop);
        if (dist < nearestDist) {
          nearest = stop;
          nearestDist = dist;
        }
      }

      totalDistance += nearestDist;
      current = nearest;
      visited.push(current.id);
      const idx = unvisited.findIndex(s => s.id === current.id);
      unvisited.splice(idx, 1);
    }

    return {
      order: visited,
      totalDistance,
      totalDuration,
    };
  }

  calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.toRad(from.lat)) * Math.cos(this.toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}