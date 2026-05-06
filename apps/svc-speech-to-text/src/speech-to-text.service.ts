import { Injectable } from '@nestjs/common';

@Injectable()
export class SpeechToTextService {
  async transcribe(audioUrl: string): Promise<{ text: string }> { return { text: 'Hello world' }; }
}