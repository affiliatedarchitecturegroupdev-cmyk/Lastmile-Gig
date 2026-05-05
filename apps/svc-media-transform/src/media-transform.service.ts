import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaTransformService {
  async transform(imageUrl: string, options: any): Promise<{ url: string }> { return { url: imageUrl }; }
}