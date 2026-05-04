import { Injectable } from '@nestjs/common';

export interface RevenueReport {
  period: string;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  breakdown: RevenueBreakdown;
}

export interface RevenueBreakdown {
  food: number;
  delivery: number;
  tips: number;
  serviceFee: number;
  vat: number;
}

export interface DailyRevenue {
  date: Date;
  revenue: number;
  orders: number;
  growth: number;
}

export interface PartnerRevenue {
  partnerId: string;
  partnerName: string;
  revenue: number;
  orders: number;
  commission: number;
  netRevenue: number;
}

@Injectable()
export class RevenueService {
  /**
   * Get revenue for date range
   */
  async getRevenueReport(
    startDate: Date,
    endDate: Date
  ): Promise<RevenueReport> {
    const totalRevenue = 2450000;
    const totalOrders = 9850;
    const avgOrderValue = totalRevenue / totalOrders;

    return {
      period: startDate.toLocaleDateString() + ' - ' + endDate.toLocaleDateString(),
      startDate,
      endDate,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      breakdown: {
        food: totalRevenue * 0.75,
        delivery: totalRevenue * 0.10,
        tips: totalRevenue * 0.08,
        serviceFee: totalRevenue * 0.05,
        vat: totalRevenue * 0.15,
      },
    };
  }

  /**
   * Get daily revenue for last N days
   */
  async getDailyRevenue(days: number = 30): Promise<DailyRevenue[]> {
    const revenues: DailyRevenue[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const baseRevenue = 80000 + Math.random() * 30000;
      const growth = i > 0 ? ((baseRevenue - 80000) / 80000) * 100 : 0;

      revenues.push({
        date,
        revenue: baseRevenue,
        orders: Math.floor(baseRevenue / 250),
        growth: growth,
      });
    }

    return revenues;
  }

  /**
   * Get revenue by partner
   */
  async getPartnerRevenue(companyId?: string): Promise<PartnerRevenue[]> {
    return [
      { partnerId: '1', partnerName: 'Burger King Sandton', revenue: 450000, orders: 1850, commission: 45000, netRevenue: 405000 },
      { partnerId: '2', partnerName: 'Sushi World', revenue: 380000, orders: 1420, commission: 38000, netRevenue: 342000 },
      { partnerId: '3', partnerName: 'Pizza Hub', revenue: 320000, orders: 1650, commission: 32000, netRevenue: 288000 },
      { partnerId: '4', partnerName: 'Wingstop', revenue: 280000, orders: 1100, commission: 28000, netRevenue: 252000 },
      { partnerId: '5', partnerName: 'Healthy Eats', revenue: 220000, orders: 980, commission: 22000, netRevenue: 198000 },
    ];
  }

  /**
   * Calculate revenue share by category
   */
  async getCategoryRevenue(): Promise<{[category: string]: number}> {
    return {
      'Fast Food': 850000,
      'Pizza': 420000,
      'Asian': 380000,
      'Healthy': 180000,
      'Desserts': 120000,
    };
  }

  /**
   * Get payment method breakdown
   */
  async getPaymentMethodBreakdown(): Promise<{[method: string]: number}> {
    return {
      'card': 65,
      'apple_pay': 20,
      'cash': 10,
      'corporate': 5,
    };
  }

  /**
   * Hourly revenue distribution
   */
  async getHourlyRevenue(): Promise<{hour: number; revenue: number}[]> {
    return [
      { hour: 6, revenue: 5000 }, { hour: 7, revenue: 12000 }, { hour: 8, revenue: 25000 },
      { hour: 9, revenue: 35000 }, { hour: 10, revenue: 28000 }, { hour: 11, revenue: 45000 },
      { hour: 12, revenue: 85000 }, { hour: 13, revenue: 72000 }, { hour: 14, revenue: 48000 },
      { hour: 15, revenue: 35000 }, { hour: 16, revenue: 42000 }, { hour: 17, revenue: 65000 },
      { hour: 18, revenue: 120000 }, { hour: 19, revenue: 145000 }, { hour: 20, revenue: 98000 },
      { hour: 21, revenue: 65000 }, { hour: 22, revenue: 35000 }, { hour: 23, revenue: 15000 },
    ];
  }

  /**
   * Revenue forecast
   */
  async forecastRevenue(days: number = 7): Promise<{date: Date; forecast: number; range: [number, number]}>[] {
    const forecast: any[] = [];
    const now = new Date();

    for (let i = 1; i <= days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const baseRevenue = 95000 + Math.random() * 15000;
      const variance = baseRevenue * 0.1;

      forecast.push({
        date,
        forecast: baseRevenue,
        range: [baseRevenue - variance, baseRevenue + variance],
      });
    }

    return forecast;
  }
}