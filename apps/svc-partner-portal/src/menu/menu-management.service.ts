import { Injectable } from '@nestjs/common';

export interface MenuItem {
  id: string;
  partnerId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  tags: string[];
  allergens: string[];
  preparationTime: number;
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  itemCount: number;
}

@Injectable()
export class MenuManagementService {
  private menus: Map<string, MenuItem[]> = new Map();
  private categories: Map<string, MenuCategory[]> = new Map();

  /**
   * Get partner menu
   */
  async getMenu(partnerId: string): Promise<MenuItem[]> {
    const menu = this.menus.get(partnerId) || [];
    return menu.filter(item => item.isActive);
  }

  /**
   * Add menu item
   */
  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}`,
    };

    const menu = this.menus.get(item.partnerId) || [];
    menu.push(newItem);
    this.menus.set(item.partnerId, menu);

    return newItem;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    partnerId: string,
    itemId: string,
    updates: Partial<MenuItem>
  ): Promise<MenuItem | null> {
    const menu = this.menus.get(partnerId) || [];
    const item = menu.find(i => i.id === itemId);
    
    if (item) {
      Object.assign(item, updates);
      this.menus.set(partnerId, menu);
      return item;
    }
    return null;
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(partnerId: string, itemId: string): Promise<boolean> {
    const menu = this.menus.get(partnerId) || [];
    const index = menu.findIndex(i => i.id === itemId);
    
    if (index >= 0) {
      menu[index].isActive = false;
      this.menus.set(partnerId, menu);
      return true;
    }
    return false;
  }

  /**
   * Toggle item availability
   */
  async toggleAvailability(partnerId: string, itemId: string): Promise<boolean> {
    const menu = this.menus.get(partnerId) || [];
    const item = menu.find(i => i.id === itemId);
    
    if (item) {
      item.available = !item.available;
      this.menus.set(partnerId, menu);
      return item.available;
    }
    return false;
  }

  /**
   * Get categories
   */
  async getCategories(partnerId: string): Promise<MenuCategory[]> {
    return this.categories.get(partnerId) || [
      { id: 'c1', name: 'Burgers', sortOrder: 1, itemCount: 5 },
      { id: 'c2', name: 'Sides', sortOrder: 2, itemCount: 4 },
      { id: 'c3', name: 'Drinks', sortOrder: 3, itemCount: 3 },
    ];
  }

  /**
   * Reorder items
   */
  async reorderItems(partnerId: string, itemIds: string[]): Promise<void> {
    const menu = this.menus.get(partnerId) || [];
    const reordered = itemIds.map((id, index) => {
      const item = menu.find(i => i.id === id);
      if (item) {
        return { ...item, category: String(index) };
      }
      return null;
    }).filter(Boolean);
    
    this.menus.set(partnerId, reordered as MenuItem[]);
  }

  /**
   * Bulk update prices
   */
  async bulkUpdatePrices(
    partnerId: string,
    updates: { itemId: string; price: number }[]
  ): Promise<number> {
    const menu = this.menus.get(partnerId) || [];
    let updated = 0;

    for (const u of updates) {
      const item = menu.find(i => i.id === u.itemId);
      if (item) {
        item.price = u.price;
        updated++;
      }
    }

    this.menus.set(partnerId, menu);
    return updated;
  }

  /**
   * Get menu summary
   */
  async getMenuSummary(partnerId: string): Promise<{
    totalItems: number;
    availableItems: number;
    categories: string[];
  }> {
    const menu = this.menus.get(partnerId) || [];
    const availableItems = menu.filter(i => i.available && i.isActive);
    const categorySet = new Set(menu.map(i => i.category));

    return {
      totalItems: menu.length,
      availableItems: availableItems.length,
      categories: Array.from(categorySet),
    };
  }
}