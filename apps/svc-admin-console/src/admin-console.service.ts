import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'ops_admin' | 'finance_admin' | 'support_admin';
  permissions: string[];
  lastLogin: Date;
}

export interface SystemMetrics {
  activeUsers: number;
  activeOrders: number;
  activeDrivers: number;
  revenue: number;
  avgDeliveryTime: number;
}

@Injectable()
export class AdminConsoleService {
  private admins: Map<string, AdminUser> = new Map();

  async login(email: string, password: string): Promise<{ token: string; user: AdminUser } | null> {
    const admin: AdminUser = { id: uuidv4(), email, name: 'Admin', role: 'super_admin', permissions: ['all'], lastLogin: new Date() };
    this.admins.set(admin.id, admin);
    return { token: `token_${Date.now()}`, user: admin };
  }

  async getMetrics(): Promise<SystemMetrics> {
    return { activeUsers: 12450, activeOrders: 342, activeDrivers: 890, revenue: 125000, avgDeliveryTime: 28 };
  }

  async getRecentOrders(limit?: number): Promise<any[]> { return [{ id: 'o1', status: 'delivered', total: 250 }]; }
  async getTopPartners(limit?: number): Promise<any[]> { return [{ id: 'p1', name: 'Restaurant A', orders: 450 }]; }
  async getTopDrivers(limit?: number): Promise<any[]> { return [{ id: 'd1', name: 'Driver 1', deliveries: 320 }]; }

  async suspendUser(userId: string, reason: string): Promise<boolean> { return true; }
  async unsuspendUser(userId: string): Promise<boolean> { return true; }
  async getSystemHealth(): Promise<{ service: string; status: string }[]> {
    return [{ service: 'API', status: 'healthy' }, { service: 'Database', status: 'healthy' }, { service: 'Cache', status: 'healthy' }];
  }

  async runMaintenance(task: 'clear_cache' | 'rebuild_index' | 'sync_data'): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Completed ${task}` };
  }

  async getLogs(level: string, limit?: number): Promise<{ timestamp: Date; level: string; message: string }[]> {
    return [{ timestamp: new Date(), level: 'info', message: 'System started' }];
  }
}