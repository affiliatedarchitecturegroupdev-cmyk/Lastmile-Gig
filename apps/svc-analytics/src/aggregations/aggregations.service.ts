import { Injectable } from '@nestjs/common';

export interface OrderMetric {
  date: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgDeliveryTime: number;
}

export interface PartnerMetric {
  partnerId: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  avgRating: number;
  slaCompliance: number;
}

export interface DriverMetric {
  driverId: string;
  date: string;
  totalDeliveries: number;
  totalEarnings: number;
  avgRating: number;
  acceptanceRate: number;
}

@Injectable()
export class AggregationsService {
  async aggregateOrdersByDay(startDate: Date, endDate: Date): Promise<OrderMetric[]> {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
    const metrics: OrderMetric[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 86400000);
      metrics.push({
        date: date.toISOString().split('T')[0],
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        avgDeliveryTime: 0,
      });
    }
    
    return metrics;
  }

  async aggregatePartnerPerformance(partnerId: string, days = 30): Promise<PartnerMetric> {
    return {
      partnerId,
      date: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalRevenue: 0,
      avgRating: 0,
      slaCompliance: 0,
    };
  }

  async aggregateDriverPerformance(driverId: string, days = 30): Promise<DriverMetric> {
    return {
      driverId,
      date: new Date().toISOString().split('T')[0],
      totalDeliveries: 0,
      totalEarnings: 0,
      avgRating: 0,
      acceptanceRate: 0,
    };
  }

  async getHourlyStats(date: Date): Promise<{ hour: number; orders: number; revenue: number }[]> {
    const stats = [];
    for (let hour = 0; hour < 24; hour++) {
      stats.push({ hour, orders: 0, revenue: 0 });
    }
    return stats;
  }

  async getWeeklyTrend(startDate: Date): Promise<{ day: string; orders: number; revenue: number }[]> {
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startDate.getTime() - i * 86400000);
      trend.push({
        day: date.toISOString().split('T')[0],
        orders: 0,
        revenue: 0,
      });
    }
    return trend;
  }
}