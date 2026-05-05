import { Injectable } from '@nestjs/common';

@Injectable()
export class KitchenDisplayService {
  async getOrders(restaurantId: string): Promise<any[]> { return [{ id: 'o1', status: 'preparing', items: [] }]; }
}