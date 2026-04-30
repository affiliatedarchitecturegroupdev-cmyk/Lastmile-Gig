import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStateMachine } from './state-machine/order-state-machine.service';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  partnerId: string;
  driverId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentRef: string;
  deliveryAddress: any;
  slaDeadline?: Date;
  placedAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
  cancelReason?: string;
  customerRating?: number;
  customerFeedback?: string;
  driverRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

@Injectable()
export class OrdersService {
  private orders: Map<string, Order> = new Map();
  private orderNumberCounter = 1000;

  constructor(private readonly stateMachine: OrderStateMachine) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = this.calculateDeliveryFee(dto.deliveryAddress);
    
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      customerId: dto.customerId,
      partnerId: dto.partnerId,
      status: 'placed',
      items: dto.items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentRef: dto.paymentRef,
      deliveryAddress: dto.deliveryAddress,
      placedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    let result = Array.from(this.orders.values());
    
    if (filters.customerId) {
      result = result.filter(o => o.customerId === filters.customerId);
    }
    if (filters.partnerId) {
      result = result.filter(o => o.partnerId === filters.partnerId);
    }
    if (filters.status) {
      result = result.filter(o => o.status === filters.status);
    }

    const total = result.length;
    const start = (filters.page - 1) * filters.limit;
    result = result.slice(start, start + filters.limit);

    return { orders: result, total };
  }

  async transition(id: string, newStatus: string): Promise<Order> {
    const order = await this.findById(id);
    
    if (!this.stateMachine.canTransition(order.status as any, newStatus as any)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    order.status = newStatus as any;
    order.updatedAt = new Date();

    // Set timestamps based on status
    if (newStatus === 'confirmed') order.confirmedAt = new Date();
    if (newStatus === 'preparing') order.preparingAt = new Date();
    if (newStatus === 'dispatched') order.dispatchedAt = new Date();
    if (newStatus === 'delivered') order.deliveredAt = new Date();

    return order;
  }

  async dispatch(id: string, driverId: string): Promise<Order> {
    const order = await this.findById(id);
    order.driverId = driverId;
    return this.transition(id, 'dispatched');
  }

  async deliver(id: string, dto: DeliverOrderDto): Promise<Order> {
    const order = await this.findById(id);
    order.deliveredAt = new Date();
    order.status = 'delivered';
    order.updatedAt = new Date();
    return order;
  }

  async cancel(id: string, reason: string): Promise<Order> {
    const order = await this.findById(id);
    
    if (!this.stateMachine.canTransition(order.status as any, 'cancelled')) {
      throw new BadRequestException('Cannot cancel this order');
    }

    order.status = 'cancelled';
    order.cancelReason = reason;
    order.updatedAt = new Date();
    return order;
  }

  async getStatusHistory(id: string): Promise<any[]> {
    // Return status history
    return [];
  }

  async rate(id: string, rating: number, feedback?: string): Promise<Order> {
    const order = await this.findById(id);
    order.customerRating = rating;
    order.customerFeedback = feedback;
    order.updatedAt = new Date();
    return order;
  }

  private generateOrderNumber(): string {
    const now = new Date();
    const num = ++this.orderNumberCounter;
    return `LM${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(num).padStart(5, '0')}`;
  }

  private calculateDeliveryFee(address: any): number {
    return 35; // Base fee
  }
}

interface CreateOrderDto {
  customerId: string;
  partnerId: string;
  items: OrderItem[];
  deliveryAddress: any;
  paymentMethod: string;
  paymentRef: string;
}

interface OrderFilters {
  customerId?: string;
  partnerId?: string;
  status?: string;
  page: number;
  limit: number;
}

interface DeliverOrderDto {
  latitude: number;
  longitude: number;
  photoUrl?: string;
}