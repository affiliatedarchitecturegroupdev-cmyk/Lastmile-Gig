import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: PartnerType;
  status: PartnerStatus;
  address: PartnerAddress;
  operatingHours: OperatingHours[];
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  createdAt: Date;
  owners: PartnerOwner[];
  documents: PartnerDocuments;
  bankDetails: BankDetails;
  commission: number;
}

export type PartnerType = 'restaurant' | 'dark_kitchen' | 'convenience' | 'grocery' | 'pharmacy';
export type PartnerStatus = 'pending' | 'reviewing' | 'active' | 'suspended' | 'closed';

export interface PartnerAddress {
  street: string;
  city: string;
  province: string;
  zipCode: string;
  lat: number;
  lng: number;
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface PartnerOwner {
  name: string;
  email: string;
  phone: string;
  idCard: string;
}

export interface PartnerDocuments {
  businessLicense?: string;
  healthCertificate?: string;
  taxClearance?: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountType: 'current' | 'savings';
  accountHolder: string;
  branchCode: string;
}

export interface PartnerMetrics {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  avgOrderValue: number;
  avgPreparationTime: number;
  rating: number;
}

@Injectable()
export class PartnerDashboardService {
  private readonly logger = new Logger(PartnerDashboardService.name);
  private partners: Map<string, Partner> = new Map();
  private metrics: Map<string, PartnerMetrics> = new Map();

  constructor() {
    this.seedPartnerData();
  }

  private seedPartnerData(): void {
    const partners: Partner[] = [
      {
        id: 'p1', name: 'Joe\'s Pizzeria', email: 'joe@pizzeria.com', phone: '+27811234567',
        type: 'restaurant', status: 'active',
        address: { street: '123 Food St, Johannesburg', city: 'Johannesburg', province: 'Gauteng', zipCode: '2001', lat: -26.2041, lng: 28.0473 },
        operatingHours: [
          { day: 'Monday', open: '09:00', close: '22:00', closed: false },
          { day: 'Tuesday', open: '09:00', close: '22:00', closed: false },
        ],
        rating: 4.7, totalOrders: 2500, totalRevenue: 875000, createdAt: new Date('2023-01-15'),
        owners: [{ name: 'Joe Smith', email: 'joe@pizzeria.com', phone: '+27811234567', idCard: 'doc1' }],
        documents: { businessLicense: 'doc2', healthCertificate: 'doc3' },
        bankDetails: { bankName: 'FNB', accountNumber: '123456789', accountType: 'current', accountHolder: 'Joe\'s Pizzeria', branchCode: '250655' },
        commission: 0.15,
      },
    ];
    partners.forEach(p => {
      this.partners.set(p.id, p);
      this.metrics.set(p.id, { todayOrders: 45, todayRevenue: 12350, activeOrders: 8, avgOrderValue: 275, avgPreparationTime: 18, rating: 4.7 });
    });
  }

  async getPartner(partnerId: string): Promise<Partner | null> { return this.partners.get(partnerId) || null; }
  async getMetrics(partnerId: string): Promise<PartnerMetrics | null> { return this.metrics.get(partnerId) || null; }
  async updateHours(partnerId: string, hours: OperatingHours[]): Promise<boolean> { const p = this.partners.get(partnerId); if (!p) return false; p.operatingHours = hours; this.partners.set(partnerId, p); return true; }
  async suspend(partnerId: string): Promise<boolean> { const p = this.partners.get(partnerId); if (!p) return false; p.status = 'suspended'; this.partners.set(partnerId, p); return true; }
  async getActivePartners(): Promise<Partner[]> { return Array.from(this.partners.values()).filter(p => p.status === 'active'); }
  async getTopPartners(limit: number): Promise<Partner[]> { return Array.from(this.partners.values()).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit); }
}