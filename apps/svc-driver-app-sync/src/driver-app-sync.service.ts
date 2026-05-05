import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverAppSyncService {
  async sync(driverId: string, data: any): Promise<boolean> { return true; }
}