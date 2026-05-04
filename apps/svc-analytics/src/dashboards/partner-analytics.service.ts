import { Injectable } from '@nestjs/common';

export interface PartnerMetrics {
  partnerId: string;
  partnerName: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  avgPrepTime: number;
  rating: number;
  acceptanceRate: number;
}

export interface PartnerInsights {
  partnerId: string;
  topItems: { name: string; orders: number; revenue: number }[];
  busyHours: { hour: number; orders: number }[];
  customerRating: number;
  repeatCustomerRate: number;
}

@Injectable()
export class PartnerAnalyticsService {
  /**
   * Get partner performance metrics
   */
  async getPartnerMetrics(partnerId: string): Promise<PartnerMetrics> {
    return {
      partnerId,
      partnerName: 'Burger King Sandton',
      totalOrders: 2450,
      totalRevenue: 686000,
      avgOrderValue: 280,
      avgPrepTime: 18.5,
      rating: 4.5,
      acceptanceRate: 92,
    };
  }

  /**
   * Get all partners ranked
   */
  async getPartnerRankings(): Promise<{
    rank: number;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
  }[]> {
    return [
      { rank: 1, name: 'Burger King Sandton', orders: 2450, revenue: 686000, rating: 4.5 },
      { rank: 2, name: 'Sushi World', orders: 1820, revenue: 546000, rating: 4.7 },
      { rank: 3, name: 'Pizza Hub', orders: 1680, revenue: 420000, rating: 4.3 },
      { rank: 4, name: 'Wingstop', orders: 1450, revenue: 362500, rating: 4.4 },
      { rank: 5, name: 'Healthy Eats', orders: 1200, revenue: 300000, rating: 4.6 },
    ];
  }

  /**
   * Get partner insights
   */
  async getPartnerInsights(partnerId: string): Promise<PartnerInsights> {
    return {
      partnerId,
      topItems: [
        { name: 'Whopper Meal', orders: 850, revenue: 297500 },
        { name: 'Chicken Fries', orders: 620, revenue: 124000 },
        { name: 'Onion Rings', orders: 480, revenue: 48000 },
        { name: 'Soft Drink', orders: 1200, revenue: 60000 },
      ],
      busyHours: [
        { hour: 12, orders: 350 }, { hour: 13, orders: 280 },
        { hour: 18, orders: 420 }, { hour: 19, orders: 385 },
        { hour: 20, orders: 250 },
      ],
      customerRating: 4.5,
      repeatCustomerRate: 65,
    };
  }

  /**
   * Get kitchen performance
   */
  async getKitchenPerformance(): Promise<{
    avgPrepTime: number;
    onTimeRate: number;
    slowOrders: number;
    fastOrders: number;
  }> {
    return {
      avgPrepTime: 16.5,
      onTimeRate: 88,
      slowOrders: 125,
      fastOrders: 2150,
    };
  }

  /**
   * Get revenue by time period
   */
  async getPartnerRevenueByPeriod(
    partnerId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<{date: string; revenue: number}[]> {
    const days = period === 'daily' ? 30 : period === 'weekly' ? 12 : 6;
    const data: {date: string; revenue: number}[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'daily') date.setDate(date.getDate() - i);
      else date.setDate(date.getDate() - i * 7);

      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 25000) + 15000,
      });
    }

    return data;
  }

  /**
   * Get menu item performance
   */
  async getMenuItemPerformance(partnerId: string): Promise<{
    name: string;
    orders: number;
    revenue: number;
    category: string;
  }[]> {
    return [
      { name: 'Whopper Meal', orders: 1250, revenue: 437500, category: 'Mains' },
      { name: 'Chicken Fries', orders: 980, revenue: 196000, category: 'Sides' },
      { name: 'Onion Rings', orders: 720, revenue: 108000, category: 'Sides' },
      { name: 'Whopper Jr', orders: 650, revenue: 162500, category: 'Mains' },
      { name: 'Milkshake', orders: 580, revenue: 58000, category: 'Drinks' },
    ];
  }

  /**
   * Get customer demographics
   */
  async getCustomerDemographics(partnerId: string): Promise<{
    segment: string;
    percentage: number;
  }[]> {
    return [
      { segment: 'Individual', percentage: 45 },
      { segment: 'Corporate', percentage: 35 },
      { segment: 'Family', percentage: 15 },
      { segment: 'Other', percentage: 5 },
    ];
  }

  /**
   * Compare with competitors
   */
  async getCompetitorComparison(partnerId: string): Promise<{
    metric: string;
    partner: number;
    avgPlatform: number;
    topPartner: number;
  }[]> {
    return [
      { metric: 'Orders', partner: 2450, avgPlatform: 1200, topPartner: 2800 },
      { metric: 'Rating', partner: 4.5, avgPlatform: 4.2, topPartner: 4.8 },
      { metric: 'Prep Time', partner: 16, avgPlatform: 18, topPartner: 14 },
      { metric: 'Acceptance', partner: 92, avgPlatform: 85, topPartner: 95 },
    ];
  }
}