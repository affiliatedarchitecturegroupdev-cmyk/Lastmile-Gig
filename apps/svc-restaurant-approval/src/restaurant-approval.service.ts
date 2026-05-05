import { Injectable } from '@nestjs/common';

@Injectable()
export class RestaurantApprovalService {
  async submitForApproval(restaurantId: string): Promise<{ id: string }> { return { id: 'app_1' }; }
  async getStatus(restaurantId: string): Promise<string> { return 'approved'; }
}