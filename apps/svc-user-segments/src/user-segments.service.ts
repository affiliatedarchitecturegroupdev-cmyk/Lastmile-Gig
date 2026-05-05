import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSegmentsService {
  async getSegments(userId: string): Promise<string[]> { return ['frequent', 'premium']; }
}