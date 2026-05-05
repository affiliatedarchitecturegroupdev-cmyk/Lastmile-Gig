import { Injectable } from '@nestjs/common';

@Injectable()
export class PartnerAppSyncService {
  async sync(restaurantId: string, data: any): Promise<boolean> { return true; }
}