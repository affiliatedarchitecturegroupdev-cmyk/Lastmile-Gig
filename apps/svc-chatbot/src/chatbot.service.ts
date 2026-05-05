import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  async processMessage(userId: string, message: string): Promise<{ response: string; actions?: any }> { return { response: 'How can I help?' }; }
}