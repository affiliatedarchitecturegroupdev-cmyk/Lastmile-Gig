import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

@Injectable()
export class AuditLoggingService {
  private readonly logger = new Logger(AuditLoggingService.name);
  private logs: AuditLog[] = [];

  async logAction(data: { userId: string; action: string; resource: string; metadata?: Record<string, any> }): Promise<AuditLog> {
    const log: AuditLog = { id: uuidv4(), ...data, metadata: data.metadata || {}, timestamp: new Date() };
    this.logs.push(log);
    this.logger.log(`Audit: ${data.action} by ${data.userId}`);
    return log;
  }

  async getLogs(filters: { userId?: string; action?: string }): Promise<AuditLog[]> {
    return this.logs.filter(l => !filters.userId || l.userId === filters.userId).filter(l => !filters.action || l.action === filters.action);
  }
}