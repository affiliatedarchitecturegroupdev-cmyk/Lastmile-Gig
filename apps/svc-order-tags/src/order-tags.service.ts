import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface OrderTag {
  id: string;
  name: string;
  color: string;
  description: string;
}

@Injectable()
export class OrderTagsService {
  private tags: Map<string, OrderTag> = new Map();
  private orderTags: Map<string, string[]> = new Map();

  constructor() {
    const defaultTags: OrderTag[] = [
      { id: 't1', name: 'Rush', color: '#FF0000', description: 'Urgent orders' },
      { id: 't2', name: 'Gift', color: '#FFD700', description: 'Gift orders' },
      { id: 't3', name: 'Large Order', color: '#0000FF', description: 'Orders over R500' },
      { id: 't4', name: 'Repeat Customer', color: '#00FF00', description: 'Returning customer' },
      { id: 't5', name: 'VIP', color: '#800080', description: 'VIP customers' },
    ];
    defaultTags.forEach(t => this.tags.set(t.id, t));
  }

  async getAvailableTags(): Promise<OrderTag[]> { return Array.from(this.tags.values()); }

  async createTag(data: { name: string; color: string; description: string }): Promise<OrderTag> {
    const tag: OrderTag = { id: uuidv4(), ...data };
    this.tags.set(tag.id, tag);
    return tag;
  }

  async tagOrder(orderId: string, tagId: string): Promise<boolean> {
    const orderTagList = this.orderTags.get(orderId) || [];
    if (!orderTagList.includes(tagId)) orderTagList.push(tagId);
    this.orderTags.set(orderId, orderTagList);
    return true;
  }

  async untagOrder(orderId: string, tagId: string): Promise<boolean> {
    const orderTagList = this.orderTags.get(orderId);
    if (!orderTagList) return false;
    this.orderTags.set(orderId, orderTagList.filter(t => t !== tagId));
    return true;
  }

  async getOrderTags(orderId: string): Promise<OrderTag[]> {
    const tagIds = this.orderTags.get(orderId) || [];
    return tagIds.map(id => this.tags.get(id)).filter(Boolean) as OrderTag[];
  }

  async getOrdersByTag(tagId: string): Promise<string[]> {
    const orders: string[] = [];
    for (const [orderId, tags] of this.orderTags.entries()) {
      if (tags.includes(tagId)) orders.push(orderId);
    }
    return orders;
  }

  async bulkTagOrders(orderIds: string[], tagId: string): Promise<{ tagged: number }> {
    let tagged = 0;
    for (const orderId of orderIds) {
      if (await this.tagOrder(orderId, tagId)) tagged++;
    }
    return { tagged };
  }
}