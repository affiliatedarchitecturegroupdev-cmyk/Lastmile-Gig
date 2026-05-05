import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface StockItem {
  id: string;
  restaurantId: string;
  name: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
  cost: number;
  supplier: string;
  expiryDate?: Date;
  lastRestocked: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment' | 'waste';
  quantity: number;
  reason: string;
  timestamp: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  leadTime: number;
  minOrder: number;
}

@Injectable()
export class InventoryService {
  private stock: Map<string, StockItem> = new Map();
  private movements: Map<string, StockMovement[]> = new Map();
  private suppliers: Map<string, Supplier> = new Map();

  constructor() {
    this.initSuppliers();
  }

  private initSuppliers(): void {
    const suppliers: Supplier[] = [
      { id: 's1', name: 'Fresh Foods Co', contact: '+27 11 123 4567', leadTime: 2, minOrder: 500 },
      { id: 's2', name: 'Meat Masters', contact: '+27 11 234 5678', leadTime: 1, minOrder: 1000 },
      { id: 's3', name: 'Produce Direct', contact: '+27 11 345 6789', leadTime: 3, minOrder: 300 },
    ];
    suppliers.forEach(s => this.suppliers.set(s.id, s));
  }

  async addStockItem(data: {
    restaurantId: string;
    name: string;
    sku: string;
    quantity: number;
    reorderLevel: number;
    unit: string;
    cost: number;
    supplier: string;
    expiryDate?: Date;
  }): Promise<StockItem> {
    const item: StockItem = {
      id: uuidv4(),
      ...data,
      lastRestocked: new Date(),
    };
    this.stock.set(item.id, item);
    this.movements.set(item.id, []);
    return item;
  }

  async updateQuantity(itemId: string, quantity: number, type: StockMovement['type'], reason: string): Promise<boolean> {
    const item = this.stock.get(itemId);
    if (!item) return false;

    item.quantity += quantity;
    if (type === 'in') item.lastRestocked = new Date();

    const movement: StockMovement = {
      id: uuidv4(),
      itemId,
      type,
      quantity,
      reason,
      timestamp: new Date(),
    };

    const itemMovements = this.movements.get(itemId) || [];
    itemMovements.push(movement);
    this.movements.set(itemId, itemMovements);

    return true;
  }

  async getLowStockItems(restaurantId: string): Promise<StockItem[]> {
    return Array.from(this.stock.values()).filter(
      i => i.restaurantId === restaurantId && i.quantity <= i.reorderLevel
    );
  }

  async getExpiringItems(restaurantId: string, days: number = 7): Promise<StockItem[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return Array.from(this.stock.values()).filter(
      i => i.restaurantId === restaurantId && i.expiryDate && i.expiryDate <= cutoff
    );
  }

  async getItem(itemId: string): Promise<StockItem | null> {
    return this.stock.get(itemId) || null;
  }

  async getRestaurantInventory(restaurantId: string): Promise<StockItem[]> {
    return Array.from(this.stock.values()).filter(i => i.restaurantId === restaurantId);
  }

  async getMovementHistory(itemId: string, limit?: number): Promise<StockMovement[]> {
    const movements = this.movements.get(itemId) || [];
    return limit ? movements.slice(-limit) : movements;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async createPurchaseOrder(data: {
    supplierId: string;
    items: { itemId: string; quantity: number; cost: number }[];
  }): Promise<{
    orderId: string;
    total: number;
    expectedDelivery: Date;
  }> {
    const supplier = this.suppliers.get(data.supplierId);
    const total = data.items.reduce((sum, i) => sum + i.quantity * i.cost, 0);
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + (supplier?.leadTime || 3));

    return {
      orderId: uuidv4(),
      total,
      expectedDelivery: delivery,
    };
  }

  async getInventoryValue(restaurantId: string): Promise<{
    totalValue: number;
    byCategory: Record<string, number>;
    lowStockCount: number;
  }> {
    const items = await this.getRestaurantInventory(restaurantId);
    const totalValue = items.reduce((sum, i) => sum + i.quantity * i.cost, 0);
    const lowStockCount = items.filter(i => i.quantity <= i.reorderLevel).length;

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      byCategory: { ingredients: totalValue * 0.6, packaging: totalValue * 0.3, supplies: totalValue * 0.1 },
      lowStockCount,
    };
  }

  async getWasteReport(restaurantId: string, startDate: Date, endDate: Date): Promise<{
    totalWaste: number;
    wasteValue: number;
    topWasted: { name: string; quantity: number }[];
  }> {
    let totalWaste = 0;
    let wasteValue = 0;
    const topWasted: { name: string; quantity: number }[] = [];

    for (const item of this.stock.values()) {
      if (item.restaurantId !== restaurantId) continue;
      const movements = this.movements.get(item.id) || [];
      const wasteMovements = movements.filter(m => m.type === 'waste');
      for (const w of wasteMovements) {
        totalWaste += Math.abs(w.quantity);
        wasteValue += Math.abs(w.quantity) * item.cost;
      }
      if (wasteMovements.length > 0) {
        topWasted.push({ name: item.name, quantity: wasteMovements.reduce((s, m) => s + Math.abs(m.quantity), 0) });
      }
    }

    return { totalWaste, wasteValue: Math.round(wasteValue * 100) / 100, topWasted: topWasted.slice(0, 5) };
  }

  async bulkUpdate(restaurantId: string, updates: { itemId: string; quantity: number }[]): Promise<{
    updated: number;
    errors: string[];
  }> {
    let updated = 0;
    const errors: string[] = [];

    for (const u of updates) {
      const updated = await this.updateQuantity(u.itemId, u.quantity, 'adjustment', 'Bulk update');
      if (!updated) errors.push(`Failed to update ${u.itemId}`);
    }

    return { updated, errors };
  }
}