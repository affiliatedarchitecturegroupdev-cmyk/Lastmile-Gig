import { Injectable } from '@nestjs/common';

@Injectable()
export class TextToSpeechService {
  async synthesize(text: string, voice?: string): Promise<{ audioUrl: string }> { return { audioUrl: 'https://...' }; }
}