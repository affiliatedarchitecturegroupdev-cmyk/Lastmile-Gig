import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationAPIService {
  async translate(text: string, targetLang: string): Promise<{ translatedText: string }> { return { translatedText: text }; }
}