import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryNotificationsService {
  async send(orderId: string, type: string, data: any): Promise<boolean> { return true; }
}