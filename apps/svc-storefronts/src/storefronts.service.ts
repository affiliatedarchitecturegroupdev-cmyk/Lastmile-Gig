import { Injectable, NotFoundException } from '@nestjs/common';

export type StorefrontStatus = 'active' | 'inactive' | 'suspended';

export interface Storefront {
  id: string;
  partnerId: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  status: StorefrontStatus;
  timezone: string;
  hours: Record<string, { open: string; close: string }>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class StorefrontsService {
  private storefronts: Map<string, Storefront> = new Map();

  async createStorefront(dto: any): Promise<Storefront> {
    const storefront: Storefront = {
      id: crypto.randomUUID(),
      partnerId: dto.partnerId,
      name: dto.name,
      address: dto.address,
      phone: dto.phone || null,
      email: dto.email || null,
      status: 'active',
      timezone: dto.timezone || 'America/New_York',
      hours: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.storefronts.set(storefront.id, storefront);
    return storefront;
  }

  async listStorefronts(status?: string, page: number = 1, limit: number = 20): Promise<{ data: Storefront[]; total: number }> {
    let storefronts = Array.from(this.storefronts.values());
    if (status) storefronts = storefronts.filter(s => s.status === status);
    const start = (page - 1) * limit;
    return { data: storefronts.slice(start, start + limit), total: storefronts.length };
  }

  async getStorefront(id: string): Promise<Storefront> {
    const storefront = this.storefronts.get(id);
    if (!storefront) throw new NotFoundException('Storefront not found');
    return storefront;
  }

  async updateStorefront(id: string, dto: any): Promise<Storefront> {
    const storefront = await this.getStorefront(id);
    if (dto.name) storefront.name = dto.name;
    if (dto.address) storefront.address = dto.address;
    if (dto.phone) storefront.phone = dto.phone;
    if (dto.email) storefront.email = dto.email;
    storefront.updatedAt = new Date();
    return storefront;
  }

  async updateStatus(id: string, status: StorefrontStatus): Promise<Storefront> {
    const storefront = await this.getStorefront(id);
    storefront.status = status;
    storefront.updatedAt = new Date();
    return storefront;
  }

  async getAnalytics(id: string, startDate?: string): Promise<any> {
    return { totalOrders: 0, revenue: 0, avgOrderValue: 0 };
  }

  async getHours(id: string): Promise<Record<string, { open: string; close: string }>> {
    const storefront = await this.getStorefront(id);
    return storefront.hours;
  }

  async updateHours(id: string, hours: Record<string, { open: string; close: string }>): Promise<Storefront> {
    const storefront = await this.getStorefront(id);
    storefront.hours = hours;
    storefront.updatedAt = new Date();
    return storefront;
  }
}