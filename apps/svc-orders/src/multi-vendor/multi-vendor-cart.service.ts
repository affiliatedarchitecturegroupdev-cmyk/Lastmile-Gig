import { Injectable } from '@nestjs/common';

export interface MultiVendorCartItem {
  id: string;
  partnerId: string;
  partnerName: string;
  menuItemId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface VendorGroup {
  partnerId: string;
  partnerName: string;
  items: MultiVendorCartItem[];
  subtotal: number;
  deliveryFee: number;
}

export interface MultiVendorCart {
  userId: string;
  vendors: Map<string, VendorGroup>;
  items: MultiVendorCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MultiVendorCartService {
  private carts: Map<string, MultiVendorCart> = new Map();

  async getCart(userId: string): Promise<MultiVendorCart> {
    let cart = this.carts.get(userId);
    
    if (!cart) {
      cart = {
        userId,
        vendors: new Map(),
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.carts.set(userId, cart);
    }
    
    return cart;
  }

  async addItem(userId: string, item: Omit<MultiVendorCartItem, 'id'>): Promise<MultiVendorCart> {
    const cart = await this.getCart(userId);
    
    // Create cart item with ID
    const cartItem: MultiVendorCartItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    
    // Add to items array
    cart.items.push(cartItem);
    
    // Group by vendor
    let vendorGroup = cart.vendors.get(item.partnerId);
    
    if (!vendorGroup) {
      vendorGroup = {
        partnerId: item.partnerId,
        partnerName: item.partnerName,
        items: [],
        subtotal: 0,
        deliveryFee: 35, // Default delivery fee
      };
      cart.vendors.set(item.partnerId, vendorGroup);
    }
    
    vendorGroup.items.push(cartItem);
    vendorGroup.subtotal += cartItem.price * cartItem.quantity;
    
    cart.updatedAt = new Date();
    
    return cart;
  }

  async removeItem(userId: string, itemId: string): Promise<MultiVendorCart> {
    const cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(i => i.id === itemId);
    
    if (itemIndex >= 0) {
      const item = cart.items[itemIndex];
      const vendorGroup = cart.vendors.get(item.partnerId);
      
      if (vendorGroup) {
        // Remove from vendor group
        const vendorItemIndex = vendorGroup.items.findIndex(i => i.id === itemId);
        if (vendorItemIndex >= 0) {
          vendorGroup.items.splice(vendorItemIndex, 1);
          vendorGroup.subtotal -= item.price * item.quantity;
          
          // Remove vendor if no items left
          if (vendorGroup.items.length === 0) {
            cart.vendors.delete(item.partnerId);
          }
        }
      }
      
      cart.items.splice(itemIndex, 1);
    }
    
    cart.updatedAt = new Date();
    
    return cart;
  }

  async updateQuantity(userId: string, itemId: string, delta: number): Promise<MultiVendorCart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find(i => i.id === itemId);
    
    if (item) {
      const newQty = item.quantity + delta;
      
      if (newQty <= 0) {
        return this.removeItem(userId, itemId);
      }
      
      // Update item quantity
      const oldTotal = item.price * item.quantity;
      item.quantity = newQty;
      const newTotal = item.price * item.quantity;
      
      // Update vendor group
      const vendorGroup = cart.vendors.get(item.partnerId);
      if (vendorGroup) {
        vendorGroup.subtotal = vendorGroup.subtotal - oldTotal + newTotal;
      }
    }
    
    cart.updatedAt = new Date();
    
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    this.carts.delete(userId);
  }

  // Calculate totals
  calculateTotals(cart: MultiVendorCart): {
    itemsCount: number;
    vendorsCount: number;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    total: number;
  } {
    const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const vendorsCount = cart.vendors.size;
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Each vendor charges delivery fee
    const deliveryFee = Array.from(cart.vendors.values())
      .reduce((sum, v) => sum + (v.items.length > 0 ? v.deliveryFee : 0), 0);
    
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + deliveryFee + serviceFee;
    
    return {
      itemsCount,
      vendorsCount,
      subtotal,
      deliveryFee,
      serviceFee,
      total,
    };
  }

  // Get items grouped by vendor
  async getVendorGroups(userId: string): Promise<VendorGroup[]> {
    const cart = await this.getCart(userId);
    return Array.from(cart.vendors.values())
      .filter(v => v.items.length > 0);
  }

  // Validation
  async validateCart(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];
    
    // Check vendor hours
    for (const [partnerId, group] of cart.vendors) {
      if (group.items.length === 0) continue;
      
      // Would check operating hours here
      // For now, assume all open
      
      // Check minimum order
      if (group.subtotal < 100) {
        errors.push(`${group.partnerName}: Minimum order R100`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}