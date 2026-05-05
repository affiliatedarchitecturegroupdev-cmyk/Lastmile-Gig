import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface GroupOrder {
  id: string;
  hostId: string;
  restaurantId: string;
  items: GroupOrderItem[];
  participants: GroupParticipant[];
  status: 'open' | 'ordering' | 'checkout' | 'completed';
  deadline: Date;
  total: number;
}

export interface GroupOrderItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface GroupParticipant {
  userId: string;
  name: string;
  joinedAt: Date;
  contributed: number;
}

@Injectable()
export class GroupOrderingService {
  private groups: Map<string, GroupOrder> = new Map();

  async createGroup(data: { hostId: string; restaurantId: string; deadline: Date }): Promise<GroupOrder> {
    return { id: uuidv4(), hostId: data.hostId, restaurantId: data.restaurantId, items: [], participants: [], status: 'open', deadline: data.deadline, total: 0 };
  }

  async addParticipant(groupId: string, userId: string, name: string): Promise<GroupOrder | null> {
    const group = this.groups.get(groupId);
    if (!group) return null;
    group.participants.push({ userId, name, joinedAt: new Date(), contributed: 0 });
    return group;
  }

  async addItem(groupId: string, data: { userId: string; name: string; quantity: number; price: number; notes?: string }): Promise<GroupOrderItem | null> {
    const group = this.groups.get(groupId);
    if (!group) return null;
    const item: GroupOrderItem = { id: uuidv4(), ...data };
    group.items.push(item);
    group.total += data.price * data.quantity;
    return item;
  }

  async getGroup(groupId: string): Promise<GroupOrder | null> { return this.groups.get(groupId) || null; }

  async closeOrder(groupId: string): Promise<boolean> {
    const group = this.groups.get(groupId);
    if (!group) return false;
    group.status = 'checkout';
    return true;
  }

  async splitBill(groupId: string): Promise<{ perPerson: number; itemsByPerson: Record<string, number> }> {
    const group = this.groups.get(groupId);
    if (!group) return { perPerson: 0, itemsByPerson: {} };
    const perPerson = group.total / Math.max(1, group.participants.length);
    const itemsByPerson: Record<string, number> = {};
    group.participants.forEach(p => { itemsByPerson[p.userId] = p.contributed; });
    return { perPerson: Math.round(perPerson), itemsByPerson };
  }
}