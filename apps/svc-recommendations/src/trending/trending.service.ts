import { Injectable } from '@nestjs/common';

export interface TrendingItem {
  itemId: string;
  itemName: string;
  partnerId: string;
  partnerName: string;
  category: string;
  ordersToday: number;
  ordersGrowth: number;
  rank: number;
}

export interface TrendingPartner {
  partnerId: string;
  partnerName: string;
  category: string;
  rating: number;
  ordersGrowth: number;
}

@Injectable()
export class TrendingService {
  /**
   * Get trending items
   */
  async getTrendingItems(
    category?: string,
    limit: number = 10
  ): Promise<TrendingItem[]> {
    const items: TrendingItem[] = [
      { itemId: 't1', itemName: 'Classic Burger', partnerId: 'p1', partnerName: 'Burger King', category: 'Burgers', ordersToday: 450, ordersGrowth: 25, rank: 1 },
      { itemId: 't2', itemName: 'Loaded Fries', partnerId: 'p2', partnerName: 'Wingstop', category: 'Sides', ordersToday: 380, ordersGrowth: 18, rank: 2 },
      { itemId: 't3', itemName: 'Pepperoni Pizza', partnerId: 'p3', partnerName: 'Pizza Hub', category: 'Pizza', ordersToday: 320, ordersGrowth: 12, rank: 3 },
      { itemId: 't4', itemName: 'Chicken Wings', partnerId: 'p2', partnerName: 'Wingstop', category: 'Chicken', ordersToday: 290, ordersGrowth: 15, rank: 4 },
      { itemId: 't5', itemName: 'Salmon Sashimi', partnerId: 'p4', partnerName: 'Sushi World', category: 'Japanese', ordersToday: 245, ordersGrowth: 22, rank: 5 },
      { itemId: 't6', itemName: 'Beef Wrap', partnerId: 'p5', partnerName: 'Wrap City', category: 'Wraps', ordersToday: 210, ordersGrowth: 8, rank: 6 },
      { itemId: 't7', itemName: 'Avocado Salad', partnerId: 'p6', partnerName: 'Healthy Eats', category: 'Healthy', ordersToday: 195, ordersGrowth: 30, rank: 7 },
      { itemId: 't8', itemName: 'BBQ Ribs', partnerId: 'p7', partnerName: 'Smoke House', category: 'BBQ', ordersToday: 180, ordersGrowth: 10, rank: 8 },
    ];

    if (category) {
      return items.filter(i => i.category === category).slice(0, limit);
    }
    return items.slice(0, limit);
  }

  /**
   * Get trending by category
   */
  async getTrendingByCategory(): Promise<{
    category: string;
    item: TrendingItem;
  }[]> {
    const categories = ['Burgers', 'Pizza', 'Sides', 'Chicken', 'Asian', 'Healthy'];
    const results: any[] = [];

    for (const category of categories) {
      const trending = await this.getTrendingItems(category, 1);
      if (trending.length > 0) {
        results.push({ category, item: trending[0] });
      }
    }
    return results;
  }

  /**
   * Get newly trending (rising)
   */
  async getRisingItems(limit: number = 5): Promise<TrendingItem[]> {
    const items = [
      { itemId: 'r1', itemName: 'Taco Bowl', partnerId: 'p8', partnerName: 'Mama Mexico', category: 'Mexican', ordersToday: 85, ordersGrowth: 85, rank: 1 },
      { itemId: 'r2', itemName: 'Poke Bowl', partnerId: 'p4', partnerName: 'Sushi World', category: 'Japanese', ordersToday: 65, ordersGrowth: 72, rank: 2 },
      { itemId: 'r3', itemName: 'Acai Bowl', partnerId: 'p6', partnerName: 'Healthy Eats', category: 'Healthy', ordersToday: 55, ordersGrowth: 65, rank: 3 },
    ];
    return items.slice(0, limit);
  }

  /**
   * Get trending partners
   */
  async getTrendingPartners(limit: number = 10): Promise<TrendingPartner[]> {
    return [
      { partnerId: 'p1', partnerName: 'Burger King', category: 'Burgers', rating: 4.5, ordersGrowth: 15 },
      { partnerId: 'p2', partnerName: 'Wingstop', category: 'Chicken', rating: 4.4, ordersGrowth: 18 },
      { partnerId: 'p3', partnerName: 'Pizza Hub', category: 'Pizza', rating: 4.3, ordersGrowth: 12 },
      { partnerId: 'p4', partnerName: 'Sushi World', category: 'Japanese', rating: 4.7, ordersGrowth: 22 },
      { partnerId: 'p6', partnerName: 'Healthy Eats', category: 'Healthy', rating: 4.6, ordersGrowth: 30 },
    ];
  }

  /**
   * Get category trends
   */
  async getCategoryTrends(): Promise<{
    category: string;
    orders: number;
    growth: number;
  }[]> {
    return [
      { category: 'Burgers', orders: 1250, growth: 8 },
      { category: 'Pizza', orders: 980, growth: 5 },
      { category: 'Chicken', orders: 850, growth: 12 },
      { category: 'Asian', orders: 720, growth: 15 },
      { category: 'Healthy', orders: 480, growth: 25 },
      { category: 'Mexican', orders: 320, growth: 35 },
      { category: 'Sides', orders: 680, growth: 10 },
    ];
  }

  /**
   * Get time-based trends
   */
  async getTimeBasedTrends(): Promise<{
    hour: number;
    topCategory: string;
    orders: number;
  }[]> {
    return [
      { hour: 12, topCategory: 'Burgers', orders: 450 },
      { hour: 13, topCategory: 'Pizza', orders: 380 },
      { hour: 18, topCategory: 'Chicken', orders: 520 },
      { hour: 19, topCategory: 'Pizza', orders: 480 },
      { hour: 20, topCategory: 'Burgers', orders: 350 },
    ];
  }
}