import { Injectable } from '@nestjs/common';

export enum PartnerStatus {
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum PartnerType {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  FAST_FOOD = 'fast_food',
  GROCERY = 'grocery',
  CONVENIENCE = 'convenience',
}

export interface Partner {
  id: string;
  userId: string;
  name: string;
  slug: string;
  type: PartnerType;
  status: PartnerStatus;
  description: string | null;
  logo: string | null;
  coverImage: string | null;
  phone: string;
  email: string;
  address: string;
  location: { lat: number; lng: number };
  cipcNumber: string | null;
  vatNumber: string | null;
  bankAccount: string | null;
  bankCode: string | null;
  deliveryFee: number;
  minimumOrder: number;
  slaMinutes: number;
  prepTimeEstimate: number;
  rating: number;
  totalOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PartnersService {
  private partners: Map<string, Partner> = new Map();

  async register(dto: any): Promise<Partner> {
    // Verify CIPC if provided
    if (dto.cipcNumber) {
      const valid = await this.verifyCipc(dto.cipcNumber);
      if (!valid && !dto.skipCipcVerification) {
        throw new Error('Invalid CIPC number');
      }
    }

    // Check slug
    const slug = this.generateSlug(dto.name);
    const slugTaken = await this.checkSlug(slug);
    if (slugTaken) {
      throw new Error('Slug already taken');
    }

    const partner: Partner = {
      id: crypto.randomUUID(),
      userId: dto.userId,
      name: dto.name,
      slug,
      type: dto.type || PartnerType.RESTAURANT,
      status: PartnerStatus.PENDING_APPROVAL,
      description: dto.description || null,
      logo: dto.logo || null,
      coverImage: dto.coverImage || null,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      location: dto.location,
      cipcNumber: dto.cipcNumber || null,
      vatNumber: dto.vatNumber || null,
      bankAccount: dto.bankAccount || null,
      bankCode: dto.bankCode || null,
      deliveryFee: dto.deliveryFee || 35,
      minimumOrder: dto.minimumOrder || 100,
      slaMinutes: dto.slaMinutes || 45,
      prepTimeEstimate: dto.prepTimeEstimate || 25,
      rating: 5.0,
      totalOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.partners.set(partner.id, partner);
    return partner;
  }

  async findById(id: string): Promise<Partner | null> {
    return this.partners.get(id) || null;
  }

  async findBySlug(slug: string): Promise<Partner | null> {
    for (const p of this.partners.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }

  async findByUserId(userId: string): Promise<Partner | null> {
    for (const p of this.partners.values()) {
      if (p.userId === userId) return p;
    }
    return null;
  }

  async list(status?: PartnerStatus, limit = 20, offset = 0): Promise<Partner[]> {
    let result = Array.from(this.partners.values());
    if (status) {
      result = result.filter(p => p.status === status);
    }
    return result.slice(offset, offset + limit);
  }

  async update(id: string, data: Partial<Partner>): Promise<Partner> {
    const partner = await this.findById(id);
    if (!partner) throw new Error('Partner not found');
    Object.assign(partner, data, { updatedAt: new Date() });
    return partner;
  }

  async updateStatus(id: string, status: PartnerStatus): Promise<Partner> {
    const partner = await this.findById(id);
    if (!partner) throw new Error('Partner not found');
    partner.status = status;
    partner.updatedAt = new Date();
    return partner;
  }

  async checkSlug(slug: string): Promise<boolean> {
    for (const p of this.partners.values()) {
      if (p.slug === slug) return true;
    }
    return false;
  }

  async verifyCipc(cipcNumber: string): Promise<boolean> {
    // In production: call CIPC API
    return cipcNumber.length >= 6;
  }

  async verifyBankAccount(accountNumber: string, bankCode: string): Promise<boolean> {
    // In production: call Paystack API
    return accountNumber.length >= 10;
  }

  async incrementOrders(id: string): Promise<void> {
    const partner = await this.findById(id);
    if (partner) {
      partner.totalOrders++;
      partner.updatedAt = new Date();
    }
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
}