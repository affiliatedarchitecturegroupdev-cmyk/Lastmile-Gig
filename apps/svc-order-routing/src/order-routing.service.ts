import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Route {
  id: string;
  orderIds: string[];
  driverId: string;
  stops: RouteStop[];
  status: RouteStatus;
  totalDistance: number;
  estimatedDuration: number;
  optimizedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface RouteStop {
  orderId: string;
  sequence: number;
  address: string;
  lat: number;
  lng: number;
  estimatedArrival?: Date;
  actualArrival?: Date;
  status: 'pending' | 'arrived' | 'delivered';
}

export type RouteStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

@Injectable()
export class OrderRoutingService {
  private readonly logger = new Logger(OrderRoutingService.name);
  private routes: Map<string, Route> = new Map();

  async optimizeRoute(orderIds: string[], startLocation: { lat: number; lng: number }): Promise<Route> {
    const stops: RouteStop[] = orderIds.map((orderId, index) => ({
      orderId, sequence: index + 1,
      address: `${index + 1} Delivery St`,
      lat: startLocation.lat + index * 0.01,
      lng: startLocation.lng + index * 0.01,
      status: 'pending',
    }));

    const route: Route = {
      id: uuidv4(), orderIds, driverId: '', stops,
      status: 'pending', totalDistance: 15.5, estimatedDuration: 45,
      optimizedAt: new Date(),
    };

    this.routes.set(route.id, route);
    return route;
  }

  async assignDriver(routeId: string, driverId: string): Promise<boolean> {
    const route = this.routes.get(routeId);
    if (!route) return false;
    route.driverId = driverId;
    this.routes.set(routeId, route);
    return true;
  }

  async startRoute(routeId: string): Promise<boolean> {
    const route = this.routes.get(routeId);
    if (!route) return false;
    route.status = 'in_progress';
    route.startedAt = new Date();
    this.routes.set(routeId, route);
    return true;
  }

  async completeStop(routeId: string, orderId: string): Promise<boolean> {
    const route = this.routes.get(routeId);
    if (!route) return false;
    const stop = route.stops.find(s => s.orderId === orderId);
    if (!stop) return false;
    stop.status = 'delivered';
    stop.actualArrival = new Date();
    this.routes.set(routeId, route);
    return true;
  }

  async getRoute(routeId: string): Promise<Route | null> { return this.routes.get(routeId) || null; }
  async getDriverRoutes(driverId: string): Promise<Route[]> { return Array.from(this.routes.values()).filter(r => r.driverId === driverId); }
}