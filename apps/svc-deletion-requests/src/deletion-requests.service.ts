import { Injectable } from '@nestjs/common';

@Injectable()
export class DeletionRequestsService {
  async createDeletionRequest(userId: string, reason: string): Promise<{ requestId: string }> { return { requestId: 'del_1' }; }
}