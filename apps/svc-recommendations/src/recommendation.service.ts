import { Injectable } from '@nestjs/common';

export interface Recommendation {
  id: string;
  itemId: string;
  itemName: string;
  partnerId: string;
  partnerName: string;
  category: string;
  score: number;
  reason: string;
  type: 'personalized' | 'trending' | 'similar' | 'frequently_ordered';
}

export interface RecommendationRequest {
  userId: string;
  location?: { lat: number; lng: number };
  limit?: number;
  excludeItems?: string[];
}

@Injectable()
export class RecommendationService {
  private userPreferences: Map<string, Record<string, any>> = new Map();
  private orderHistory: Map<string, string[][]> = new Map();

  /**
   * Get personalized recommendations
   */
  async getRecommendations(request: RecommendationRequest): Promise<Recommendation[]> {
    const limit = request.limit || 10;
    const recommendations: Recommendation[] = [];

    // Get user preferences
    const prefs = await this.getUserPreferences(request.userId);
    
    // Get personalized recommendations
    const personalized = await this.getPersonalizedRecommendations(request.userId, prefs, limit);
    recommendations.push(...personalized);

    // Get trending items
    const trending = await this.getTrendingItems(request.userId, limit - recommendations.length);
    recommendations.push(...trending);

    // Filter excluded items
    if (request.excludeItems?.length) {
      return recommendations.filter(r => !request.excludeItems!.includes(r.itemId));
    }

    return recommendations.slice(0, limit);
  }

  /**
   * Get user preferences
   */
  private async getUserPreferences(userId: string): Promise<{
    favoriteCategories: string[];
    favoritePartners: string[];
    dietaryRestrictions: string[];
  }> {
    const prefs = this.userPreferences.get(userId);
    
    if (!prefs) {
      return {
        favoriteCategories: ['Burgers', 'Pizza', 'Asian'],
        favoritePartners: [],
        dietaryRestrictions: [],
      };
    }
    
    return prefs;
  }

  /**
   * Get personalized recommendations
   */
  private async getPersonalizedRecommendations(
    userId: string,
    prefs: any,
    limit: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const categories = prefs.favoriteCategories || [];

    // Generate recommendations based on preferences
    if (categories.includes('Burgers')) {
      recommendations.push({
        id: 'rec_1',
        itemId: 'item_001',
        itemName: 'Classic Burger',
        partnerId: 'partner_1',
        partnerName: 'Burger King',
        category: 'Burgers',
        score: 0.95,
        reason: 'Based on your preference for burgers',
        type: 'personalized',
      });
    }

    if (categories.includes('Pizza')) {
      recommendations.push({
        id: 'rec_2',
        itemId: 'item_002',
        itemName: 'Pepperoni Supreme',
        partnerId: 'partner_2',
        partnerName: 'Pizza Hub',
        category: 'Pizza',
        score: 0.88,
        reason: 'Popular in your area',
        type: 'personalized',
      });
    }

    if (categories.includes('Asian')) {
      recommendations.push({
        id: 'rec_3',
        itemId: 'item_003',
        itemName: 'Chicken Fried Rice',
        partnerId: 'partner_3',
        partnerName: 'Wok Express',
        category: 'Asian',
        score: 0.82,
        reason: 'Frequently ordered by users like you',
        type: 'personalized',
      });
    }

    return recommendations.slice(0, limit);
  }

  /**
   * Get trending items
   */
  private async getTrendingItems(userId: string, limit: number): Promise<Recommendation[]> {
    const trending: Recommendation[] = [
      {
        id: 'trending_1',
        itemId: 'item_101',
        itemName: 'Loaded Fries',
        partnerId: 'partner_10',
        partnerName: 'Wingstop',
        category: 'Sides',
        score: 0.92,
        reason: 'Trending now',
        type: 'trending',
      },
      {
        id: 'trending_2',
        itemId: 'item_102',
        itemName: 'Avocado Smash',
        partnerId: 'partner_11',
        partnerName: 'Healthy Eats',
        category: 'Healthy',
        score: 0.88,
        reason: 'Trending this week',
        type: 'trending',
      },
      {
        id: 'trending_3',
        itemId: 'item_103',
        itemName: 'Beef Wrap',
        partnerId: 'partner_12',
        partnerName: 'Wrap City',
        category: 'Wraps',
        score: 0.85,
        reason: 'Hot seller',
        type: 'trending',
      },
    ];

    return trending.slice(0, limit);
  }

  /**
   * Get similar items
   */
  async getSimilarItems(itemId: string, limit: number = 5): Promise<Recommendation[]> {
    return [
      {
        id: `similar_${itemId}_1`,
        itemId: 'item_201',
        itemName: 'Cheese Burger',
        partnerId: 'partner_1',
        partnerName: 'Burger King',
        category: 'Burgers',
        score: 0.91,
        reason: 'Similar to what you viewed',
        type: 'similar',
      },
      {
        id: `similar_${itemId}_2`,
        itemId: 'item_202',
        itemName: 'Bacon Burger',
        partnerId: 'partner_1',
        partnerName: 'Burger King',
        category: 'Burgers',
        score: 0.88,
        reason: 'Frequently ordered together',
        type: 'similar',
      },
    ];
  }

  /**
   * Get frequently ordered together
   */
  async getFrequentlyOrderedTogether(itemId: string): Promise<Recommendation[]> {
    return [
      {
        id: 'frequently_1',
        itemId: 'item_301',
        itemName: 'Onion Rings',
        partnerId: 'partner_1',
        partnerName: 'Burger King',
        category: 'Sides',
        score: 0.78,
        reason: 'Frequently ordered together',
        type: 'frequently_ordered',
      },
      {
        id: 'frequently_2',
        itemId: 'item_302',
        itemName: 'Milkshake',
        partnerId: 'partner_1',
        partnerName: 'Burger King',
        category: 'Drinks',
        score: 0.72,
        reason: 'Popular combo',
        type: 'frequently_ordered',
      },
    ];
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: {
      favoriteCategories?: string[];
      favoritePartners?: string[];
      dietaryRestrictions?: string[];
    }
  ): Promise<void> {
    const current = this.userPreferences.get(userId) || {
      favoriteCategories: [],
      favoritePartners: [],
      dietaryRestrictions: [],
    };
    
    this.userPreferences.set(userId, { ...current, ...preferences });
  }

  /**
   * Record order for learning
   */
  async recordOrder(userId: string, items: string[]): Promise<void> {
    const history = this.orderHistory.get(userId) || [];
    history.push(items);
    this.orderHistory.set(userId, history);
    
    // Update preferences based on order
    if (history.length > 0) {
      // Would update preferences here
    }
  }

  /**
   * Get recommendations score
   */
  calculateScore(factors: {
    popularity: number;
    relevance: number;
    location: number;
    frequency: number;
  }): number {
    const weights = { popularity: 0.3, relevance: 0.35, location: 0.15, frequency: 0.2 };
    return (
      factors.popularity * weights.popularity +
      factors.relevance * weights.relevance +
      factors.location * weights.location +
      factors.frequency * weights.frequency
    );
  }
}