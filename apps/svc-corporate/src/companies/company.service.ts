import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export type CompanyStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  taxNumber: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: CompanyStatus;
  approvedAt?: Date;
  createdAt: Date;
  subscriptionTier: 'standard' | 'premium' | 'enterprise';
  monthlySpendLimit: number;
  allowOvertimeOrders: boolean;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  spendLimit: number;
  employeeLimit: number;
}

export interface CompanyAdmin {
  userId: string;
  companyId: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

@Injectable()
export class CompanyService {
  private companies: Map<string, Company> = new Map();
  private departments: Map<string, Department> = new Map();
  private admins: Map<string, CompanyAdmin> = new Map();
  private companyEmployees: Map<string, Set<string>> = new Map(); // companyId -> employee userIds

  async registerCompany(data: {
    name: string;
    registrationNumber: string;
    taxNumber: string;
    address: Company['address'];
    billingAddress: Company['billingAddress'];
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
  }): Promise<Company> {
    const company: Company = {
      id: uuidv4(),
      ...data,
      status: 'pending',
      createdAt: new Date(),
      subscriptionTier: 'standard',
      monthlySpendLimit: 50000,
      allowOvertimeOrders: false,
    };

    this.companies.set(company.id, company);
    return company;
  }

  async approveCompany(companyId: string): Promise<Company | null> {
    const company = this.companies.get(companyId);
    if (company) {
      company.status = 'approved';
      company.approvedAt = new Date();
      this.companies.set(companyId, company);
    }
    return company || null;
  }

  async suspendCompany(companyId: string): Promise<Company | null> {
    const company = this.companies.get(companyId);
    if (company) {
      company.status = 'suspended';
      this.companies.set(companyId, company);
    }
    return company || null;
  }

  async getCompany(companyId: string): Promise<Company | null> {
    return this.companies.get(companyId) || null;
  }

  async getCompanyByUser(userId: string): Promise<Company | null> {
    const admin = this.admins.get(userId);
    if (!admin) return null;
    return this.companies.get(admin.companyId) || null;
  }

  async updateCompany(companyId: string, updates: Partial<Company>): Promise<Company | null> {
    const company = this.companies.get(companyId);
    if (company) {
      Object.assign(company, updates);
      this.companies.set(companyId, company);
    }
    return company || null;
  }

  async getAllCompanies(status?: CompanyStatus): Promise<Company[]> {
    const all = Array.from(this.companies.values());
    if (status) {
      return all.filter(c => c.status === status);
    }
    return all;
  }

  // Department management
  async addDepartment(companyId: string, name: string, spendLimit: number): Promise<Department> {
    const department: Department = {
      id: uuidv4(),
      companyId,
      name,
      spendLimit,
      employeeLimit: 100,
    };

    this.departments.set(department.id, department);
    return department;
  }

  async getDepartments(companyId: string): Promise<Department[]> {
    return Array.from(this.departments.values())
      .filter(d => d.companyId === companyId);
  }

  async updateDepartment(deptId: string, updates: Partial<Department>): Promise<Department | null> {
    const dept = this.departments.get(deptId);
    if (dept) {
      Object.assign(dept, updates);
      this.departments.set(deptId, dept);
    }
    return dept || null;
  }

  // Employee management
  async addEmployee(companyId: string, userId: string, email: string): Promise<void> {
    const admin: CompanyAdmin = {
      userId,
      companyId,
      email,
      role: 'viewer',
    };

    this.admins.set(userId, admin);

    if (!this.companyEmployees.has(companyId)) {
      this.companyEmployees.set(companyId, new Set());
    }
    this.companyEmployees.get(companyId)!.add(userId);
  }

  async removeEmployee(userId: string): Promise<void> {
    const admin = this.admins.get(userId);
    if (admin) {
      const employees = this.companyEmployees.get(admin.companyId);
      if (employees) {
        employees.delete(userId);
      }
      this.admins.delete(userId);
    }
  }

  async getCompanyEmployees(companyId: string): Promise<string[]> {
    const employees = this.companyEmployees.get(companyId);
    return employees ? Array.from(employees) : [];
  }

  async isCompanyEmployee(userId: string): Promise<boolean> {
    return this.admins.has(userId);
  }

  // Spend limits
  async checkCompanySpendLimit(companyId: string, amount: number): Promise<{
    allowed: boolean;
    remaining: number;
    limit: number;
  }> {
    const company = this.companies.get(companyId);
    if (!company) {
      return { allowed: false, remaining: 0, limit: 0 };
    }

    return {
      allowed: amount <= company.monthlySpendLimit,
      remaining: company.monthlySpendLimit,
      limit: company.monthlySpendLimit,
    };
  }

  // Analytics
  async getCompanyStats(companyId: string): Promise<{
    totalEmployees: number;
    totalDepartments: number;
    monthlySpend: number;
    orderCount: number;
  }> {
    const employees = this.companyEmployees.get(companyId) || new Set();
    const departments = Array.from(this.departments.values())
      .filter(d => d.companyId === companyId);

    return {
      totalEmployees: employees.size,
      totalDepartments: departments.length,
      monthlySpend: 0, // Would aggregate from orders
      orderCount: 0,
    };
  }
}