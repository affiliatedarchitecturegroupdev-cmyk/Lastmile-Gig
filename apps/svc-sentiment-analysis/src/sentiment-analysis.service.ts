import { Injectable } from '@nestjs/common';

@Injectable()
export class SentimentAnalysisService {
  async analyze(text: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; score: number }> { return { sentiment: 'positive', score: 0.8 }; }
}