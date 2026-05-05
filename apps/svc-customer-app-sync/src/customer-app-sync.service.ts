import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerAppSyncService {
  async sync(userId: string, data: any): Promise<boolean> { return true; }
}