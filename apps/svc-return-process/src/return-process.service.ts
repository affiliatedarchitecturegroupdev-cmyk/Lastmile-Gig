import { Injectable } from '@nestjs/common';

@Injectable()
export class ReturnProcessService {
  async initiateReturn(orderId: string, reason: string): Promise<{ returnId: string }> { return { returnId: 'ret_1' }; }
}