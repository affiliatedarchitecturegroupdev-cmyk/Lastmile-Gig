import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface DarkKitchen {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  menus: string[];
  status: 'active' | 'inactive';
  ordersToday: number;
}

@Injectable()
export class DarkKitchenService {
  private kitchens: Map<string, DarkKitchen> = new Map();
  private orders: Map<string, { kitchenId: string; items: string[] }> = new Map();

  constructor() {
    const kitchens: DarkKitchen[] = [
      { id: 'dk1', name: 'Urban Grill Express', location: { lat: -26.2041, lng: 28.0473 }, menus: ['burgers', 'wings'], status: 'active', ordersToday: 145 },
      { id: 'dk2', name: 'Healthy Bites Kitchens', location: { lat: -26.2090, lng: 28.0500 }, menus: ['salads', 'bowls'], status: 'active', ordersToday: 98 },
      { id: 'dk3', name: 'Late Night Eats', location: { lat: -26.1950, lng: 28.0340 }, menus: ['pizza', 'wings'], status: 'active', ordersToday: 210 },
    ];
    kitchens.forEach(k => this.kitchens.set(k.id, k));
  }

  async getKitchens(zone?: string): Promise<DarkKitchen[]> { return Array.from(this.kitchens.values()).filter(k => k.status === 'active'); }

  async getKitchen(kitchenId: string): Promise<DarkKitchen | null> { return this.kitchens.get(kitchenId) || null; }

  async getNearestKitchens(lat: number, lng: number, limit?: number): Promise<DarkKitchen[]> {
    return Array.from(this.kitchens.values()).sort(() => Math.random() - 0.5).slice(0, limit || 3);
  }

  async createOrder(kitchenId: string, orderId: string, items: string[]): Promise<boolean> {
    this.orders.set(orderId, { kitchenId, items });
    const kitchen = this.kitchens.get(kitchenId);
    if (kitchen) { kitchen.ordersToday++; }
    return true;
  }

  async getKitchenStats(kitchenId: string): Promise<{ ordersToday: number; revenue: number; avgTime: number }> {
    const kitchen = this.kitchens.get(kitchenId);
    return { ordersToday: kitchen?.ordersToday || 0, revenue: (kitchen?.ordersToday || 0) * 120, avgTime: 22 };
  }

  async addMenu(kitchenId: string, menuId: string): Promise<boolean> {
    const kitchen = this.kitchens.get(kitchenId);
    if (!kitchen) return false;
    kitchen.menus.push(menuId);
    return true;
  }

  async getInventory(kitchenId: string): Promise<{ item: string; stock: number; reorderLevel: number }[]> {
    return [
      { item: 'Beef patties', stock: 150, reorderLevel: 50 },
      { item: 'Chicken', stock: 80, reorderLevel: 30 },
      { item: 'Buns', stock: 120, reorderLevel: 40 },
    ];
  }
}