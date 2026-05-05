import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  isPopular: boolean;
  preparationTime: number;
  calories?: number;
  allergens: string[];
  dietaryInfo: DietaryTag[];
  modifiers: MenuModifierGroup[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuModifierGroup {
  id: string;
  name: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten_free' | 'dairy_free' | 'nut_free' | 'halal' | 'kosher' | 'low_carb' | 'keto';

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  available: boolean;
}

export interface MenuAvailability {
  itemId: string;
  available: boolean;
  reason?: string;
}

@Injectable()
export class RestaurantMenuService {
  private readonly logger = new Logger(RestaurantMenuService.name);
  private menuItems: Map<string, MenuItem> = new Map();
  private categories: Map<string, MenuCategory> = new Map();
  private itemAvailability: Map<string, { available: boolean; reason?: string }> = new Map();

  constructor() {
    this.seedMenuData();
  }

  private seedMenuData(): void {
    // Create sample categories
    const categories: MenuCategory[] = [
      { id: 'cat1', restaurantId: 'r1', name: 'Appetizers', description: 'Start your meal right', sortOrder: 1, available: true },
      { id: 'cat2', restaurantId: 'r1', name: 'Main Course', description: 'Hearty mains', sortOrder: 2, available: true },
      { id: 'cat3', restaurantId: 'r1', name: 'Desserts', description: 'Sweet treats', sortOrder: 3, available: true },
      { id: 'cat4', restaurantId: 'r1', name: 'Beverages', description: 'Refreshments', sortOrder: 4, available: true },
    ];
    categories.forEach(c => this.categories.set(c.id, c));

    // Create sample menu items
    const items: MenuItem[] = [
      {
        id: 'item1', restaurantId: 'r1', name: 'Crispy Spring Rolls', description: 'Golden fried vegetable spring rolls with sweet chili sauce',
        price: 65, category: 'Appetizers', available: true, isPopular: true, preparationTime: 15,
        calories: 280, allergens: ['gluten'], dietaryInfo: ['vegetarian'], modifiers: [], tags: ['popular', 'starter'],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'item2', restaurantId: 'r1', name: 'Grilled Chicken Burger', description: 'Juicy grilled chicken breast with fresh vegetables and mayo',
        price: 125, category: 'Main Course', available: true, isPopular: true, preparationTime: 20,
        calories: 650, allergens: ['gluten', 'eggs'], dietaryInfo: [], modifiers: [
          { id: 'mod1', name: 'Extras', required: false, minSelections: 0, maxSelections: 3, modifiers: [
            { id: 'm1', name: 'Extra Cheese', price: 15, available: true },
            { id: 'm2', name: 'Bacon', price: 25, available: true },
            { id: 'm3', name: 'Avocado', price: 20, available: true },
          ]},
        ], tags: ['popular', 'lunch'],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'item3', restaurantId: 'r1', name: 'Beef Steak', description: 'Premium beef steak with seasonal vegetables',
        price: 245, category: 'Main Course', available: true, isPopular: true, preparationTime: 25,
        calories: 850, allergens: [], dietaryInfo: ['gluten_free'], modifiers: [
          { id: 'mod2', name: 'Cooking', required: true, minSelections: 1, maxSelections: 1, modifiers: [
            { id: 'm4', name: 'Rare', price: 0, available: true },
            { id: 'm5', name: 'Medium Rare', price: 0, available: true },
            { id: 'm6', name: 'Medium', price: 0, available: true },
            { id: 'm7', name: 'Well Done', price: 0, available: true },
          ]},
        ], tags: ['premium', 'dinner'],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'item4', restaurantId: 'r1', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center',
        price: 75, category: 'Desserts', available: true, isPopular: true, preparationTime: 15,
        calories: 450, allergens: ['gluten', 'dairy', 'eggs'], dietaryInfo: [], modifiers: [], tags: ['sweet', 'popular'],
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: 'item5', restaurantId: 'r1', name: 'Fresh Orange Juice', description: ' freshly squeezed orange juice',
        price: 45, category: 'Beverages', available: true, isPopular: false, preparationTime: 5,
        calories: 120, allergens: [], dietaryInfo: ['vegan', 'gluten_free'], modifiers: [], tags: ['healthy', 'drink'],
        createdAt: new Date(), updatedAt: new Date(),
      },
    ];
    items.forEach(i => this.menuItems.set(i.id, i));
  }

  /**
   * Get menu by restaurant
   */
  async getRestaurantMenu(restaurantId: string, includeUnavailable?: boolean): Promise<{
    categories: MenuCategory[];
    items: MenuItem[];
  }> {
    let items = Array.from(this.menuItems.values()).filter(i => i.restaurantId === restaurantId);
    
    if (!includeUnavailable) {
      items = items.filter(i => i.available);
    }

    const categories = Array.from(this.categories.values())
      .filter(c => c.restaurantId === restaurantId && c.available)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return { categories, items };
  }

  /**
   * Create menu item
   */
  async createMenuItem(data: {
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    preparationTime: number;
    calories?: number;
    allergens: string[];
    dietaryInfo: DietaryTag[];
    tags?: string[];
  }): Promise<MenuItem> {
    const item: MenuItem = {
      id: uuidv4(),
      ...data,
      available: true,
      isPopular: false,
      modifiers: [],
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.menuItems.set(item.id, item);
    this.logger.log(`Menu item ${item.id} created: ${item.name}`);

    return item;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const item = this.menuItems.get(itemId);
    if (!item) {
      return null;
    }

    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.menuItems.set(itemId, updated);

    this.logger.log(`Menu item ${itemId} updated`);
    return updated;
  }

  /**
   * Toggle item availability
   */
  async toggleAvailability(itemId: string, available: boolean, reason?: string): Promise<boolean> {
    const item = this.menuItems.get(itemId);
    if (!item) {
      return false;
    }

    item.available = available;
    item.updatedAt = new Date();
    this.menuItems.set(itemId, item);

    this.itemAvailability.set(itemId, { available, reason });

    this.logger.log(`Item ${itemId} availability: ${available}`);
    return true;
  }

  /**
   * Get item by ID
   */
  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    return this.menuItems.get(itemId) || null;
  }

  /**
   * Search menu items
   */
  async searchMenuItems(
    restaurantId: string,
    query: string,
    filters?: {
      category?: string;
      maxPrice?: number;
      dietaryInfo?: DietaryTag[];
      availableOnly?: boolean;
    }
  ): Promise<MenuItem[]> {
    let items = Array.from(this.menuItems.values()).filter(i => i.restaurantId === restaurantId);

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply filters
    if (filters?.category) {
      items = items.filter(i => i.category === filters.category);
    }
    if (filters?.maxPrice !== undefined) {
      items = items.filter(i => i.price <= filters.maxPrice!);
    }
    if (filters?.dietaryInfo?.length) {
      items = items.filter(i =>
        filters.dietaryInfo!.every(d => i.dietaryInfo.includes(d))
      );
    }
    if (filters?.availableOnly !== false) {
      items = items.filter(i => i.available);
    }

    return items;
  }

  /**
   * Get popular items
   */
  async getPopularItems(restaurantId: string, limit?: number): Promise<MenuItem[]> {
    const items = Array.from(this.menuItems.values())
      .filter(i => i.restaurantId === restaurantId && i.isPopular && i.available)
      .sort((a, b) => b.preparationTime - a.preparationTime);

    return limit ? items.slice(0, limit) : items;
  }

  /**
   * Create category
   */
  async createCategory(data: {
    restaurantId: string;
    name: string;
    description?: string;
    sortOrder?: number;
  }): Promise<MenuCategory> {
    const existing = Array.from(this.categories.values())
      .filter(c => c.restaurantId === data.restaurantId);
    
    const sortOrder = data.sortOrder || existing.length + 1;

    const category: MenuCategory = {
      id: uuidv4(),
      ...data,
      sortOrder,
      available: true,
    };

    this.categories.set(category.id, category);
    return category;
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: string, updates: Partial<MenuCategory>): Promise<boolean> {
    const category = this.categories.get(categoryId);
    if (!category) {
      return false;
    }

    Object.assign(category, updates);
    this.categories.set(categoryId, category);
    return true;
  }

  /**
   * Get menu statistics
   */
  async getMenuStatistics(restaurantId: string): Promise<{
    totalItems: number;
    availableItems: number;
    categories: number;
    averagePrice: number;
    popularItems: number;
    itemsByCategory: Record<string, number>;
  }> {
    const items = Array.from(this.menuItems.values()).filter(i => i.restaurantId === restaurantId);
    const categories = Array.from(this.categories.values()).filter(c => c.restaurantId === restaurantId);

    const totalItems = items.length;
    const availableItems = items.filter(i => i.available).length;
    const averagePrice = items.reduce((sum, i) => sum + i.price, 0) / totalItems;
    const popularItems = items.filter(i => i.isPopular).length;

    const itemsByCategory: Record<string, number> = {};
    for (const item of items) {
      itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
    }

    return {
      totalItems,
      availableItems,
      categories: categories.length,
      averagePrice: Math.round(averagePrice * 100) / 100,
      popularItems,
      itemsByCategory,
    };
  }

  /**
   * Bulk update items
   */
  async bulkUpdateItems(updates: { itemId: string; available: boolean }[]): Promise<{ updated: number }> {
    let updated = 0;
    for (const u of updates) {
      if (await this.toggleAvailability(u.itemId, u.available)) {
        updated++;
      }
    }
    return { updated };
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(restaurantId: string, category: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(i => i.restaurantId === restaurantId && i.category === category && i.available);
  }

  /**
   * Add modifier to item
   */
  async addModifierGroup(
    itemId: string,
    modifierGroup: MenuModifierGroup
  ): Promise<boolean> {
    const item = this.menuItems.get(itemId);
    if (!item) {
      return false;
    }

    item.modifiers.push(modifierGroup);
    item.updatedAt = new Date();
    this.menuItems.set(itemId, item);

    return true;
  }

  /**
   * Remove modifier from item
   */
  async removeModifierGroup(itemId: string, groupId: string): Promise<boolean> {
    const item = this.menuItems.get(itemId);
    if (!item) {
      return false;
    }

    item.modifiers = item.modifiers.filter(m => m.id !== groupId);
    item.updatedAt = new Date();
    this.menuItems.set(itemId, item);

    return true;
  }

  /**
   * Get dietary-tagged items
   */
  async getItemsByDietaryTag(restaurantId: string, tag: DietaryTag): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(i => i.restaurantId === restaurantId && i.dietaryInfo.includes(tag) && i.available);
  }
}