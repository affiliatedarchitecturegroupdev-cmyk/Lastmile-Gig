import { Injectable } from '@nestjs/common';

@Injectable()
export class MLRecommendationsService {
  async getRecommendations(userId: string, context: any): Promise<any[]> { return []; }
}