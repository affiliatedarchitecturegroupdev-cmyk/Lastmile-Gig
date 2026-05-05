import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderAllocationService {
  async allocate(orderId: string, restaurantId: string): Promise<{ partnerId: string }> { return { partnerId: 'p1' }; }
}