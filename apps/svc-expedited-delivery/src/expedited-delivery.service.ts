import { Injectable } from '@nestjs/common';

@Injectable()
export class ExpeditedDeliveryService {
  async requestExpedited(orderId: string): Promise<{ eligible: boolean; fee: number; newEta: number }> { return { eligible: true, fee: 25, newEta: 15 }; }
}