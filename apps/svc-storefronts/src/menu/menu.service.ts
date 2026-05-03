import { Injectable, NotFoundException } from '@nestjs/common';

export interface MenuItem {
  id: string;
  storefrontId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MenuService {
  private menuItems: Map<string, MenuItem> = new Map();

  async createMenuItem(storefrontId: string, dto: any): Promise<MenuItem> {
    const item: MenuItem = {
      id: crypto.randomUUID(),
      storefrontId,
      name: dto.name,
      description: dto.description || '',
      price: dto.price,
      category: dto.category || 'default',
      imageUrl: dto.imageUrl || null,
      available: dto.available !== false,
      allergens: dto.allergens || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.menuItems.set(item.id, item);
    return item;
  }

  async getMenu(storefrontId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(i => i.storefrontId === storefrontId);
  }

  async getItem(id: string): Promise<MenuItem> {
    const item = this.menuItems.get(id);
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async updateItem(id: string, dto: any): Promise<MenuItem> {
    const item = await this.getItem(id);
    if (dto.name) item.name = dto.name;
    if (dto.description) item.description = dto.description;
    if (dto.price) item.price = dto.price;
    if (dto.category) item.category = dto.category;
    if (dto.available !== undefined) item.available = dto.available;
    item.updatedAt = new Date();
    return item;
  }

  async deleteItem(id: string): Promise<void> {
    this.menuItems.delete(id);
  }

  async updateAvailability(id: string, available: boolean): Promise<MenuItem> {
    const item = await this.getItem(id);
    item.available = available;
    item.updatedAt = new Date();
    return item;
  }
}