import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageDetectionService {
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> { return { language: 'en', confidence: 0.99 }; }
}