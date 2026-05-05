import { Injectable } from '@nestjs/common';

export interface UserPreferences {
  userId: string;
  favorites: string[];
  dietaryRestrictions: string[];
  notifications: { orderUpdates: boolean; promotions: boolean; newPartners: boolean };
  language: string;
  location: { lat: number; lng: number; address: string };
}

@Injectable()
export class UserPreferencesService {
  private prefs = new Map<string, UserPreferences>();

  async getPreferences(userId: string): Promise<UserPreferences | null> { return this.prefs.get(userId) || null; }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<boolean> {
    const current = this.prefs.get(userId) || { userId, favorites: [], dietaryRestrictions: [], notifications: { orderUpdates: true, promotions: true, newPartners: true }, language: 'en', location: { lat: 0, lng: 0, address: '' } };
    this.prefs.set(userId, { ...current, ...updates });
    return true;
  }

  async addFavorite(userId: string, restaurantId: string): Promise<boolean> {
    const p = this.prefs.get(userId) || { userId, favorites: [], dietaryRestrictions: [], notifications: { orderUpdates: true, promotions: true, newPartners: true }, language: 'en', location: { lat: 0, lng: 0, address: '' } };
    if (!p.favorites.includes(restaurantId)) p.favorites.push(restaurantId);
    return true;
  }

  async removeFavorite(userId: string, restaurantId: string): Promise<boolean> {
    const p = this.prefs.get(userId);
    if (!p) return false;
    p.favorites = p.favorites.filter(f => f !== restaurantId);
    return true;
  }
}