import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectDetectionService {
  async detectObjects(imageUrl: string): Promise<{ objects: any[] }> { return { objects: [] }; }
}