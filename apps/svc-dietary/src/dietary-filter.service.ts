import { Injectable } from '@nestjs/common';

export type Allergen = 'gluten' | 'dairy' | 'nuts' | 'peanuts' | 'eggs' | 'soy' | 'fish' | 'shellfish' | 'sesame';
export type DietaryTag = 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'halal_certified' | 'keto' | 'paleo' | 'gf' | 'low_carb';

export interface AllergenFilter {
  allergen: Allergen;
  exclude: boolean;
}

export interface DietaryPreference {
  userId: string;
  excludes: Allergen[];
  preferences: DietaryTag[];
  customRestrictions: string[];
}

@Injectable()
export class DietaryFilterService {
  private preferences: Map<string, DietaryPreference> = new Map();

  /**
   * Set user dietary preferences
   */
  async setPreferences(
    userId: string,
    data: {
      excludes?: Allergen[];
      preferences?: DietaryTag[];
      customRestrictions?: string[];
    }
  ): Promise<DietaryPreference> {
    const preference: DietaryPreference = {
      userId,
      excludes: data.excludes || [],
      preferences: data.preferences || [],
      customRestrictions: data.customRestrictions || [],
    };

    this.preferences.set(userId, preference);
    return preference;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<DietaryPreference> {
    let pref = this.preferences.get(userId);
    if (!pref) {
      pref = {
        userId,
        excludes: [],
        preferences: [],
        customRestrictions: [],
      };
      this.preferences.set(userId, pref);
    }
    return pref;
  }

  /**
   * Filter items by dietary preferences
   */
  async filterItems(
    userId: string,
    items: any[]
  ): Promise<{ filtered: any[]; removedCount: number; reasons: Record<string, string[]> }> {
    const pref = await this.getPreferences(userId);
    const filtered: any[] = [];
    const removedReasons: Record<string, string[]> = {};

    for (const item of items) {
      let shouldRemove = false;
      const reasons: string[] = [];

      // Check allergens
      for (const allergen of pref.excludes) {
        if (item.allergens?.includes(allergen)) {
          shouldRemove = true;
          reasons.push(`contains ${allergen}`);
        }
      }

      // Check dietary tags
      for (const tag of pref.preferences) {
        if (item.dietaryTags && !item.dietaryTags.includes(tag)) {
          shouldRemove = true;
          reasons.push(`not ${tag}`);
        }
      }

      if (shouldRemove) {
        removedReasons[item.id] = reasons;
      } else {
        filtered.push(item);
      }
    }

    return {
      filtered,
      removedCount: items.length - filtered.length,
      reasons: removedReasons,
    };
  }

  /**
   * Get all allergens
   */
  async getAllAllergens(): Promise<{ id: Allergen; name: string; description: string }[]> {
    return [
      { id: 'gluten', name: 'Gluten', description: 'Wheat, barley, rye' },
      { id: 'dairy', name: 'Dairy', description: 'Milk, cheese, butter' },
      { id: 'nuts', name: 'Tree Nuts', description: 'Almonds, cashews, walnuts' },
      { id: 'peanuts', name: 'Peanuts', description: 'Peanut products' },
      { id: 'eggs', name: 'Eggs', description: 'Egg products' },
      { id: 'soy', name: 'Soy', description: 'Soy products' },
      { id: 'fish', name: 'Fish', description: 'Fish products' },
      { id: 'shellfish', name: 'Shellfish', description: 'Shrimp, crab, lobster' },
      { id: 'sesame', name: 'Sesame', description: 'Sesame products' },
    ];
  }

  /**
   * Get all dietary tags
   */
  async getDietaryTags(): Promise<{ id: DietaryTag; name: string; description: string }[]> {
    return [
      { id: 'vegetarian', name: 'Vegetarian', description: 'No meat or fish' },
      { id: 'vegan', name: 'Vegan', description: 'No animal products' },
      { id: 'halal', name: 'Halal', description: 'Halal certified' },
      { id: 'kosher', name: 'Kosher', description: 'Kosher certified' },
      { id: 'keto', name: 'Keto', description: 'Low carb, high fat' },
      { id: 'paleo', name: 'Paleo', description: 'Whole foods diet' },
      { id: 'gf', name: 'Gluten Free', description: 'No gluten' },
      { id: 'low_carb', name: 'Low Carb', description: 'Reduced carbohydrates' },
    ];
  }

  /**
   * Quick filter presets
   */
  async getPresets(): Promise<{
    name: string;
    excludes: Allergen[];
    preferences: DietaryTag[];
  }[]> {
    return [
      { name: 'Vegan', excludes: ['dairy', 'eggs', 'fish', 'shellfish'], preferences: ['vegan'] },
      { name: 'Vegetarian', excludes: ['fish', 'shellfish'], preferences: ['vegetarian'] },
      { name: 'Keto', excludes: [], preferences: ['keto', 'low_carb'] },
      { name: 'Halal', excludes: ['pork'], preferences: ['halal'] },
      { name: 'Gluten Free', excludes: ['gluten'], preferences: ['gf'] },
      { name: 'Nut Free', excludes: ['nuts', 'peanuts'], preferences: [] },
    ];
  }

  /**
   * Build filter query
   */
  async buildFilterQuery(userId: string): Promise<Record<string, any>> {
    const pref = await this.getPreferences(userId);
    const query: Record<string, any> = {};

    if (pref.excludes.length > 0) {
      query.allergens = { $not: { $in: pref.excludes } };
    }

    if (pref.preferences.length > 0) {
      query.dietaryTags = { $in: pref.preferences };
    }

    return query;
  }
}