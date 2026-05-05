import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageClassificationService {
  async classify(imageUrl: string): Promise<{ labels: string[] }> { return { labels: ['food'] }; }
}