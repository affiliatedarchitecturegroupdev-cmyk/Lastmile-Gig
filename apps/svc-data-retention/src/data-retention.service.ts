import { Injectable } from '@nestjs/common';

@Injectable()
export class DataRetentionService {
  async getRetentionPolicy(dataType: string): Promise<{ retentionDays: number }> { return { retentionDays: 365 }; }
}