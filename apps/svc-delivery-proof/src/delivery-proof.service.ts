import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryProofService {
  async captureProof(orderId: string, data: { photo?: string; signature?: string; otp?: string }): Promise<boolean> { return true; }
  async getProof(orderId: string): Promise<{ photo?: string; signature?: string; verifiedAt?: Date }> { return {}; }
}