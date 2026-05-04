import { Injectable } from '@nestjs/common';

export enum OrderEventType {
  PLACED = 'order.placed',
  CONFIRMED = 'order.confirmed',
  PREPARING = 'order.preparing',
  DISPATCHED = 'order.dispatched',
  DELIVERED = 'order.delivered',
  CANCELLED = 'order.cancelled',
  MODIFIED = 'order.modified',
  RATED = 'order.rated',
}

export interface OrderEvent {
  id: string;
  orderId: string;
  type: OrderEventType;
  data: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class OrderEventsService {
  private events: Map<string, OrderEvent[]> = new Map();

  async emit(orderId: string, type: OrderEventType, data: Record<string, any>): Promise<void> {
    const event: OrderEvent = {
      id: crypto.randomUUID(),
      orderId,
      type,
      data,
      timestamp: new Date(),
    };

    const orderEvents = this.events.get(orderId) || [];
    orderEvents.push(event);
    this.events.set(orderId, orderEvents);

    // Publish to message queue (Kafka, RabbitMQ, etc.)
    await this.publish(event);
  }

  async getHistory(orderId: string): Promise<OrderEvent[]> {
    return this.events.get(orderId) || [];
  }

  async publish(event: OrderEvent): Promise<void> {
    console.log(`[Event] ${event.type}:`, event.data);
    // Kafka/RabbitMQ publish logic here
  }

  async getByType(orderId: string, type: OrderEventType): Promise<OrderEvent | null> {
    const events = this.events.get(orderId) || [];
    return events.find(e => e.type === type) || null;
  }

  async getLatest(orderId: string): Promise<OrderEvent | null> {
    const events = this.events.get(orderId) || [];
    return events[events.length - 1] || null;
  }
}