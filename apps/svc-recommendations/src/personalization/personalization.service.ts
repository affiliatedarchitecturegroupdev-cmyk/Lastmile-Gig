import { Injectable } from '@nestjs/common';

export interface UserProfile {
  userId: string;
  preferences: {
    cuisine: string[];
    dietary: string[];
    priceRange: [number, number];
  };
  behavior: {
    avgOrderValue: number;
    preferredTimes: string[];
    orderFrequency: number;
  };
  location?: { lat: number; lng: number };
}

@Injectable()
export class PersonalizationService {
  private profiles: Map<string, UserProfile> = new Map();

  /**
   * Get or create user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    let profile = this.profiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        preferences: {
          cuisine: ['Burgers', 'Pizza', 'Asian'],
          dietary: [],
          priceRange: [50, 300],
        },
        behavior: {
          avgOrderValue: 250,
          preferredTimes: ['12:00', '18:00'],
          orderFrequency: 4,
        },
      };
      this.profiles.set(userId, profile);
    }
    
    return profile;
  }

  /**
   * Update profile preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<UserProfile['preferences']>
  ): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);
    profile.preferences = { ...profile.preferences, ...preferences };
    this.profiles.set(userId, profile);
    return profile;
  }

  /**
   * Track user behavior
   */
  async trackOrder(
    userId: string,
    data: { orderValue: number; time: string; cuisine?: string }
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    // Update average order value
    const total = profile.behavior.avgOrderValue * profile.behavior.orderFrequency;
    profile.behavior.orderFrequency++;
    profile.behavior.avgOrderValue = (total + data.orderValue) / profile.behavior.orderFrequency;
    
    // Update preferred times
    const hour = data.time.split(':')[0];
    if (!profile.behavior.preferredTimes.includes(hour)) {
      profile.behavior.preferredTimes.push(hour);
    }
    
    // Update cuisine preferences
    if (data.cuisine && !profile.preferences.cuisine.includes(data.cuisine)) {
      profile.preferences.cuisine.push(data.cuisine);
    }
    
    this.profiles.set(userId, profile);
  }

  /**
   * Get personalized ranking score
   */
  getRankingScore(
    item: any,
    profile: UserProfile
  ): number {
    let score = 50; // Base score
    
    // Cuisine preference
    if (profile.preferences.cuisine.includes(item.category)) {
      score += 25;
    }
    
    // Price range
    if (item.price >= profile.preferences.priceRange[0] && 
        item.price <= profile.preferences.priceRange[1]) {
      score += 15;
    }
    
    // Dietary
    if (profile.preferences.dietary.length > 0) {
      const hasMatch = profile.preferences.dietary.some(d => item.tags?.includes(d));
      if (hasMatch) score += 10;
    }
    
    return score;
  }

  /**
   * Get recommended search filters
   */
  async getRecommendedFilters(userId: string): Promise<{
    cuisine: string[];
    priceRange: [number, number];
    dietary: string[];
  }> {
    const profile = await this.getUserProfile(userId);
    
    return {
      cuisine: profile.preferences.cuisine,
      priceRange: profile.preferences.priceRange,
      dietary: profile.preferences.dietary,
    };
  }
}