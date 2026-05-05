import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface Customer {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  status: CustomerStatus;
  tier: CustomerTier;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  createdAt: Date;
  lastOrderAt?: Date;
  lastLoginAt?: Date;
  addresses: CustomerAddress[];
  preferences: CustomerPreferences;
}

export type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'banned';
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface CustomerAddress {
  id: string;
  label: 'home' | 'work' | 'other';
  street: string;
  apartment?: string;
  city: string;
  province: string;
  zipCode: string;
  lat: number;
  lng: number;
  instructions?: string;
  isDefault: boolean;
}

export interface CustomerPreferences {
  language: string;
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newPartners: boolean;
    newsletters: boolean;
  };
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  favoriteRestaurants: string[];
  paymentMethod?: string;
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  type: 'login' | 'order' | 'view' | 'search' | 'review';
  details: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class CustomerProfileService {
  private readonly logger = new Logger(CustomerProfileService.name);
  private customers: Map<string, Customer> = new Map();
  private activities: Map<string, CustomerActivity[]> = new Map();

  constructor() {
    this.seedCustomerData();
  }

  private seedCustomerData(): void {
    const customers: Customer[] = [
      {
        id: 'c1', email: 'john@example.com', phone: '+27811234567', firstName: 'John', lastName: 'Doe',
        status: 'active', tier: 'gold', totalOrders: 45, totalSpent: 15750, averageOrderValue: 350,
        createdAt: new Date('2023-01-15'), lastOrderAt: new Date('2024-01-20'), lastLoginAt: new Date('2024-01-25'),
        addresses: [
          { id: 'a1', label: 'home', street: '123 Main St', city: 'Johannesburg', province: 'Gauteng', zipCode: '2001',
            lat: -26.2041, lng: 28.0473, isDefault: true },
        ],
        preferences: {
          language: 'en', notifications: { orderUpdates: true, promotions: true, newPartners: true, newsletters: false },
          dietaryRestrictions: [], favoriteCuisines: ['Pizza', 'Burgers'], favoriteRestaurants: [],
        },
      },
      {
        id: 'c2', email: 'jane@example.com', phone: '+27819876543', firstName: 'Jane', lastName: 'Smith',
        status: 'active', tier: 'platinum', totalOrders: 120, totalSpent: 48000, averageOrderValue: 400,
        createdAt: new Date('2022-06-10'), lastOrderAt: new Date('2024-01-28'), lastLoginAt: new Date('2024-01-28'),
        addresses: [
          { id: 'a2', label: 'work', street: '456 Oak Ave', city: 'Johannesburg', province: 'Gauteng', zipCode: '2001',
            lat: -26.2050, lng: 28.0500, isDefault: true },
        ],
        preferences: {
          language: 'en', notifications: { orderUpdates: true, promotions: true, newPartners: true, newsletters: true },
          dietaryRestrictions: ['vegetarian'], favoriteCuisines: ['Salads', 'Sushi'], favoriteRestaurants: [],
        },
      },
    ];
    customers.forEach(c => this.customers.set(c.id, c));
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<Customer | null> {
    return this.customers.get(customerId) || null;
  }

  /**
   * Create customer
   */
  async createCustomer(data: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  }): Promise<Customer> {
    const customer: Customer = {
      id: uuidv4(),
      ...data,
      status: 'active',
      tier: 'bronze',
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      createdAt: new Date(),
      addresses: [],
      preferences: {
        language: 'en',
        notifications: { orderUpdates: true, promotions: true, newPartners: true, newsletters: false },
        dietaryRestrictions: [],
        favoriteCuisines: [],
        favoriteRestaurants: [],
      },
    };

    this.customers.set(customer.id, customer);
    this.logger.log(`Customer ${customer.id} created`);

    await this.logActivity(customer.id, 'login', 'Account created');
    return customer;
  }

  /**
   * Update customer profile
   */
  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return null;
    }

    const updated = { ...customer, ...updates };
    this.customers.set(customerId, updated);

    this.logger.log(`Customer ${customerId} updated`);
    return updated;
  }

  /**
   * Add/update address
   */
  async addAddress(
    customerId: string,
    address: Omit<CustomerAddress, 'id'>,
    setAsDefault?: boolean
  ): Promise<CustomerAddress> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    // If setting as default, unset others
    if (setAsDefault) {
      customer.addresses.forEach(a => a.isDefault = false);
    }

    const newAddress: CustomerAddress = {
      id: uuidv4(),
      ...address,
      isDefault: setAsDefault || customer.addresses.length === 0,
    };

    customer.addresses.push(newAddress);
    this.customers.set(customerId, customer);

    this.logger.log(`Address added for customer ${customerId}`);
    return newAddress;
  }

  /**
   * Remove address
   */
  async removeAddress(customerId: string, addressId: string): Promise<boolean> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return false;
    }

    const index = customer.addresses.findIndex(a => a.id === addressId);
    if (index === -1) {
      return false;
    }

    customer.addresses.splice(index, 1);
    
    // Set new default if needed
    if (customer.addresses.length > 0 && !customer.addresses.some(a => a.isDefault)) {
      customer.addresses[0].isDefault = true;
    }

    this.customers.set(customerId, customer);
    return true;
  }

  /**
   * Update preferences
   */
  async updatePreferences(customerId: string, updates: Partial<CustomerPreferences>): Promise<boolean> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return false;
    }

    customer.preferences = { ...customer.preferences, ...updates };
    this.customers.set(customerId, customer);

    return true;
  }

  /**
   * Add to favorites
   */
  async addFavorite(customerId: string, restaurantId: string): Promise<boolean> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return false;
    }

    if (!customer.preferences.favoriteRestaurants.includes(restaurantId)) {
      customer.preferences.favoriteRestaurants.push(restaurantId);
      this.customers.set(customerId, customer);
    }

    return true;
  }

  /**
   * Remove from favorites
   */
  async removeFavorite(customerId: string, restaurantId: string): Promise<boolean> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return false;
    }

    customer.preferences.favoriteRestaurants = customer.preferences.favoriteRestaurants.filter(r => r !== restaurantId);
    this.customers.set(customerId, customer);

    return true;
  }

  /**
   * Update order statistics
   */
  async updateOrderStats(customerId: string, orderTotal: number): Promise<boolean> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return false;
    }

    customer.totalOrders++;
    customer.totalSpent += orderTotal;
    customer.averageOrderValue = customer.totalSpent / customer.totalOrders;
    customer.lastOrderAt = new Date();

    // Update tier based on spending
    if (customer.totalSpent > 25000) customer.tier = 'diamond';
    else if (customer.totalSpent > 15000) customer.tier = 'platinum';
    else if (customer.totalSpent > 7500) customer.tier = 'gold';
    else if (customer.totalSpent > 2500) customer.tier = 'silver';

    this.customers.set(customerId, customer);
    return true;
  }

  /**
   * Log activity
   */
  async logActivity(
    customerId: string,
    type: CustomerActivity['type'],
    details: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const activity: CustomerActivity = {
      id: uuidv4(),
      customerId,
      type,
      details,
      timestamp: new Date(),
      metadata,
    };

    const activities = this.activities.get(customerId) || [];
    activities.push(activity);

    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.shift();
    }

    this.activities.set(customerId, activities);
  }

  /**
   * Get activity history
   */
  async getActivityHistory(customerId: string, limit?: number): Promise<CustomerActivity[]> {
    const activities = this.activities.get(customerId) || [];
    return limit ? activities.slice(-limit) : activities;
  }

  /**
   * Search customers
   */
  async searchCustomers(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.customers.values()).filter(c =>
      c.email.toLowerCase().includes(lowerQuery) ||
      c.firstName.toLowerCase().includes(lowerQuery) ||
      c.lastName.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query)
    );
  }

  /**
   * Get customer tier
   */
  async getCustomerTier(customerId: string): Promise<CustomerTier | null> {
    const customer = this.customers.get(customerId);
    return customer?.tier || null;
  }

  /**
   * Suspend customer
   */
  async suspendCustomer(customerId: string, reason: string): Promise<boolean> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return false;
    }

    customer.status = 'suspended';
    this.customers.set(customerId, customer);

    await this.logActivity(customerId, 'login', `Suspended: ${reason}`);
    return true;
  }

  /**
   * Get customer statistics
   */
  async getCustomerStatistics(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    byTier: Record<CustomerTier, number>;
    averageOrderValue: number;
    topSpenders: { customerId: string; totalSpent: number }[];
  }> {
    const customers = Array.from(this.customers.values());
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;

    const byTier: Record<CustomerTier, number> = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
    for (const c of customers) {
      byTier[c.tier]++;
    }

    const averageOrderValue = customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / totalCustomers;

    const topSpenders = customers
      .map(c => ({ customerId: c.id, totalSpent: c.totalSpent }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return { totalCustomers, activeCustomers, byTier, averageOrderValue, topSpenders };
  }

  /**
   * Get default address
   */
  async getDefaultAddress(customerId: string): Promise<CustomerAddress | null> {
    const customer = this.customers.get(customerId);
    return customer?.addresses.find(a => a.isDefault) || customer?.addresses[0] || null;
  }

  /**
   * Update login timestamp
   */
  async recordLogin(customerId: string): Promise<void> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      return;
    }

    customer.lastLoginAt = new Date();
    this.customers.set(customerId, customer);

    await this.logActivity(customerId, 'login', 'User logged in');
  }
}