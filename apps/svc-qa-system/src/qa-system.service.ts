import { Injectable } from '@nestjs/common';

@Injectable()
export class QASystemService {
  async answerQuestion(question: string, context?: string): Promise<{ answer: string }> { return { answer: 'Based on the context...' }; }
}