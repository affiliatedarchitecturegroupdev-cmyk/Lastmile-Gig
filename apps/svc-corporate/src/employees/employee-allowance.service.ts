import { Injectable } from '@nestjs/common';
import { CompanyService } from '../companies/company.service';
import { v4 as uuidv4 } from 'uuid';

export type AllowanceType = 'daily' | 'weekly' | 'monthly';
export type AllowanceStatus = 'active' | 'expired' | 'suspended';

export interface EmployeeAllowance {
  id: string;
  companyId: string;
  userId: string;
  departmentId?: string;
  type: AllowanceType;
  amount: number;
  totalBudget: number;
  spent: number;
  remaining: number;
  periodStart: Date;
  periodEnd: Date;
  status: AllowanceStatus;
}

export interface AllowanceTransaction {
  id: string;
  allowanceId: string;
  userId: string;
  orderId: string;
  amount: number;
  description: string;
  timestamp: Date;
}

export interface SpendLimit {
  userId: string;
  companyId: string;
  departmentId?: string;
  maxOrderValue: number;
  maxOrdersPerDay: number;
  allowedOrderTimes?: string[]; // e.g., ["09:00-12:00", "12:00-14:00"]
}

@Injectable()
export class EmployeeAllowanceService {
  private allowances: Map<string, EmployeeAllowance> = new Map();
  private transactions: Map<string, AllowanceTransaction[]> = new Map();
  private spendLimits: Map<string, SpendLimit> = new Map();

  constructor(private companyService: CompanyService) {}

  /**
   * Set up allowance for an employee
   */
  async createAllowance(data: {
    companyId: string;
    userId: string;
    departmentId?: string;
    type: AllowanceType;
    amount: number;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<EmployeeAllowance> {
    const allowance: EmployeeAllowance = {
      id: uuidv4(),
      ...data,
      totalBudget: data.amount,
      spent: 0,
      remaining: data.amount,
      status: 'active',
    };

    this.allowances.set(allowance.id, allowance);
    this.transactions.set(allowance.id, []);

    // Set default spend limit
    this.spendLimits.set(data.userId, {
      userId: data.userId,
      companyId: data.companyId,
      departmentId: data.departmentId,
      maxOrderValue: data.amount, // Can spend full allowance per order
      maxOrdersPerDay: 5,
    });

    return allowance;
  }

  /**
   * Get user's current allowance
   */
  async getUserAllowance(userId: string): Promise<EmployeeAllowance | null> {
    for (const allowance of this.allowances.values()) {
      if (allowance.userId === userId && allowance.status === 'active') {
        const now = new Date();
        if (now >= allowance.periodStart && now <= allowance.periodEnd) {
          return allowance;
        } else if (now > allowance.periodEnd) {
          allowance.status = 'expired';
        }
      }
    }
    return null;
  }

  /**
   * Check if user can make a purchase
   */
  async checkAllowance(userId: string, amount: number): Promise<{
    allowed: boolean;
    reason?: string;
    remaining: number;
  }> {
    const allowance = await this.getUserAllowance(userId);

    if (!allowance) {
      return { allowed: false, reason: 'No active allowance', remaining: 0 };
    }

    if (allowance.remaining < amount) {
      return {
        allowed: false,
        reason: `Insufficient allowance: R${allowance.remaining} remaining`,
        remaining: allowance.remaining,
      };
    }

    // Check spend limit
    const spendLimit = this.spendLimits.get(userId);
    if (spendLimit && amount > spendLimit.maxOrderValue) {
      return {
        allowed: false,
        reason: `Order exceeds max value of R${spendLimit.maxOrderValue}`,
        remaining: allowance.remaining,
      };
    }

    return { allowed: true, remaining: allowance.remaining };
  }

  /**
   * Deduct from allowance
   */
  async applyToAllowance(
    userId: string,
    orderId: string,
    amount: number,
    description: string
  ): Promise<EmployeeAllowance | null> {
    const allowance = await this.getUserAllowance(userId);

    if (!allowance || allowance.remaining < amount) {
      return null;
    }

    // Update allowance
    allowance.spent += amount;
    allowance.remaining -= amount;
    this.allowances.set(allowance.id, allowance);

    // Record transaction
    const transaction: AllowanceTransaction = {
      id: uuidv4(),
      allowanceId: allowance.id,
      userId,
      orderId,
      amount,
      description,
      timestamp: new Date(),
    };

    const transactions = this.transactions.get(allowance.id) || [];
    transactions.push(transaction);
    this.transactions.set(allowance.id, transactions);

    return allowance;
  }

  /**
   * Refund to allowance (if order cancelled)
   */
  async refundAllowance(userId: string, orderId: string, amount: number): Promise<EmployeeAllowance | null> {
    const allowance = await this.getUserAllowance(userId);

    if (!allowance) {
      return null;
    }

    allowance.spent = Math.max(0, allowance.spent - amount);
    allowance.remaining += amount;
    this.allowances.set(allowance.id, allowance);

    return allowance;
  }

  /**
   * Get transaction history for user
   */
  async getTransactionHistory(userId: string): Promise<AllowanceTransaction[]> {
    for (const [allowanceId, allowance] of this.allowances) {
      if (allowance.userId === userId) {
        return this.transactions.get(allowanceId) || [];
      }
    }
    return [];
  }

  /**
   * Get spend limit for user
   */
  async getSpendLimit(userId: string): Promise<SpendLimit | null> {
    return this.spendLimits.get(userId) || null;
  }

  /**
   * Update spend limit
   */
  async updateSpendLimit(userId: string, updates: Partial<SpendLimit>): Promise<SpendLimit | null> {
    const limit = this.spendLimits.get(userId);
    if (limit) {
      Object.assign(limit, updates);
      this.spendLimits.set(userId, limit);
      return limit;
    }
    return null;
  }

  /**
   * Reset allowance for new period
   */
  async resetAllowance(allowanceId: string): Promise<EmployeeAllowance | null> {
    const allowance = this.allowances.get(allowanceId);
    if (allowance) {
      allowance.spent = 0;
      allowance.remaining = allowance.totalBudget;
      allowance.status = 'active';
      this.allowances.set(allowanceId, allowance);
    }
    return allowance || null;
  }

  /**
   * Get company-wide allowance report
   */
  async getCompanyAllowanceReport(companyId: string): Promise<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    employeeCount: number;
  }> {
    let totalBudget = 0;
    let totalSpent = 0;
    let employeeCount = 0;

    for (const allowance of this.allowances.values()) {
      if (allowance.companyId === companyId) {
        totalBudget += allowance.totalBudget;
        totalSpent += allowance.spent;
        employeeCount++;
      }
    }

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      employeeCount,
    };
  }
}