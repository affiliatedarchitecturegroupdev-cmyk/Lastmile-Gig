import { Injectable } from '@nestjs/common';

export interface MultiVendorOrder {
  groupId: string;
  multiVendor: boolean;
  customerId: string;
  orders: VendorOrder[];
  status: string;
  createdAt: Date;
}

export interface VendorOrder {
  id: string;
  groupId: string;
  partnerId: string;
  partnerName: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  tip: number;
  total: number;
  status: string;
  deliveryAddress: string;
  createdAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

@Injectable()
export class MultiVendorOrderService {
  private orders: Map<string, MultiVendorOrder> = new Map();
  private vendorOrders: Map<string, VendorOrder> = new Map();
  private orderCounter: number = 1000;

  async createOrdersFromCart(
    userId: string,
    cart: any,
    deliveryAddress: string,
    paymentMethod: string
  ): Promise<MultiVendorOrder> {
    const groupId = crypto.randomUUID();
    const orders: VendorOrder[] = [];
    
    const vendors = cart.vendors || [];
    const vendorList = Array.isArray(vendors) ? vendors : Array.from(vendors.values());
    
    for (const vendorGroup of vendorList) {
      if (!vendorGroup.items || vendorGroup.items.length === 0) continue;
      
      const vendorOrder = this.createVendorOrder(
        groupId,
        userId,
        vendorGroup,
        deliveryAddress,
        paymentMethod
      );
      
      orders.push(vendorOrder);
      this.vendorOrders.set(vendorOrder.id, vendorOrder);
    }
    
    const multiVendorOrder: MultiVendorOrder = {
      groupId,
      multiVendor: orders.length > 1,
      customerId: userId,
      orders,
      status: 'pending',
      createdAt: new Date(),
    };
    
    this.orders.set(groupId, multiVendorOrder);
    
    return multiVendorOrder;
  }

  private createVendorOrder(
    groupId: string,
    userId: string,
    vendorGroup: any,
    deliveryAddress: string,
    paymentMethod: string
  ): VendorOrder {
    const orderNumber = this.generateOrderNumber();
    const subtotal = vendorGroup.subtotal || 0;
    const deliveryFee = vendorGroup.deliveryFee || 35;
    const serviceFee = Math.round(subtotal * 0.05);
    const tip = 0;
    const total = subtotal + deliveryFee + serviceFee + tip;
    
    return {
      id: crypto.randomUUID(),
      groupId,
      partnerId: vendorGroup.partnerId,
      partnerName: vendorGroup.partnerName,
      orderNumber,
      customerId: userId,
      items: vendorGroup.items || [],
      subtotal,
      deliveryFee,
      serviceFee,
      tip,
      total,
      status: 'placed',
      deliveryAddress,
      createdAt: new Date(),
    };
  }

  private generateOrderNumber(): string {
    this.orderCounter++;
    const date = new Date();
    const prefix = `LM${date.getFullYear().toString().slice(-2)}${date.getMonth() + 1}${date.getDate()}`;
    return `${prefix}${this.orderCounter.toString().padStart(4, '0')}`;
  }

  async getGroupOrder(groupId: string): Promise<MultiVendorOrder | null> {
    return this.orders.get(groupId) || null;
  }

  async getVendorOrder(orderId: string): Promise<VendorOrder | null> {
    return this.vendorOrders.get(orderId) || null;
  }

  async getVendorOrderByGroup(groupId: string): Promise<VendorOrder[]> {
    const groupOrder = this.orders.get(groupId);
    return groupOrder?.orders || [];
  }

  async updateVendorOrderStatus(
    orderId: string,
    status: string
  ): Promise<VendorOrder | null> {
    const order = this.vendorOrders.get(orderId);
    
    if (order) {
      order.status = status;
      
      // Update group status
      const groupOrder = this.orders.get(order.groupId);
      if (groupOrder) {
        groupOrder.status = this.calculateGroupStatus(groupOrder.orders);
      }
    }
    
    return order || null;
  }

  private calculateGroupStatus(orders: VendorOrder[]): string {
    const statuses = orders.map(o => o.status);
    
    if (statuses.every(s => s === 'delivered')) return 'delivered';
    if (statuses.some(s => s === 'cancelled')) return 'partially_cancelled';
    if (statuses.every(s => s === 'confirmed' || s === 'preparing' || s === 'ready' || s === 'dispatched' || s === 'delivered')) return 'processing';
    if (statuses.every(s => s === 'confirmed')) return 'confirmed';
    return 'pending';
  }

  async getUserOrders(userId: string): Promise<MultiVendorOrder[]> {
    return Array.from(this.orders.values())
      .filter(o => o.customerId === userId);
  }

  // Calculate combined totals
  calculateGroupTotals(groupId: string): {
    totalOrders: number;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    tip: number;
    total: number;
  } {
    const group = this.orders.get(groupId);
    if (!group) return { totalOrders: 0, subtotal: 0, deliveryFee: 0, serviceFee: 0, tip: 0, total: 0 };
    
    const orders = group.orders;
    const subtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const deliveryFee = orders.reduce((sum, o) => sum + o.deliveryFee, 0);
    const serviceFee = orders.reduce((sum, o) => sum + o.serviceFee, 0);
    const tip = orders.reduce((sum, o) => sum + o.tip, 0);
    const total = subtotal + deliveryFee + serviceFee + tip;
    
    return {
      totalOrders: orders.length,
      subtotal,
      deliveryFee,
      serviceFee,
      tip,
      total,
    };
  }

  // Individual vendor order status
  async cancelVendorOrder(orderId: string, reason: string): Promise<VendorOrder | null> {
    const order = this.vendorOrders.get(orderId);
    
    if (order && ['placed', 'confirmed'].includes(order.status)) {
      order.status = 'cancelled';
      
      // Update group
      const groupOrder = this.orders.get(order.groupId);
      if (groupOrder) {
        groupOrder.status = this.calculateGroupStatus(groupOrder.orders);
      }
    }
    
    return order || null;
  }
}