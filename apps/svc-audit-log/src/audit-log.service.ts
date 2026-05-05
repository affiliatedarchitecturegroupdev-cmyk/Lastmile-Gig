import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view';
  userId: string;
  changes: Record<string, { old: any; new: any }>;
  timestamp: Date;
  ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  private logs: Map<string, AuditLog> = new Map();

  async log(data: {
    entityType: string;
    entityId: string;
    action: AuditLog['action'];
    userId: string;
    changes?: Record<string, { old: any; new: any }>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const log: AuditLog = {
      id: uuidv4(),
      ...data,
      timestamp: new Date(),
    };
    this.logs.set(log.id, log);
    return log;
  }

  async getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> {
    return Array.from(this.logs.values())
      .filter(l => l.entityType === entityType && l.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getUserActivity(userId: string, limit?: number): Promise<AuditLog[]> {
    const userLogs = Array.from(this.logs.values())
      .filter(l => l.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? userLogs.slice(0, limit) : userLogs;
  }

  async search(filters: { entityType?: string; userId?: string; action?: string; startDate?: Date; endDate?: Date }): Promise<AuditLog[]> {
    let results = Array.from(this.logs.values());
    if (filters.entityType) results = results.filter(l => l.entityType === filters.entityType);
    if (filters.userId) results = results.filter(l => l.userId === filters.userId);
    if (filters.action) results = results.filter(l => l.action === filters.action);
    if (filters.startDate) results = results.filter(l => l.timestamp >= filters.startDate!);
    if (filters.endDate) results = results.filter(l => l.timestamp <= filters.endDate!);
    return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<{ totalActions: number; byType: Record<string, number>; byUser: Record<string, number> }> {
    const logs = await this.search({ startDate, endDate });
    const byType: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    for (const l of logs) { byType[l.action] = (byType[l.action] || 0) + 1; byUser[l.userId] = (byUser[l.userId] || 0) + 1; }
    return { totalActions: logs.length, byType, byUser };
  }

  async getSensitiveChanges(): Promise<AuditLog[]> {
    return Array.from(this.logs.values()).filter(l => Object.keys(l.changes || {}).length > 0 && l.action === 'update');
  }

  async archive(olderThan: Date): Promise<number> {
    let archived = 0;
    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < olderThan) { this.logs.delete(id); archived++; }
    }
    return archived;
  }
}