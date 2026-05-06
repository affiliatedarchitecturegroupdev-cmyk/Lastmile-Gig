import { Injectable } from '@nestjs/common';

@Injectable()
export class FaceDetectionService {
  async detectFaces(imageUrl: string): Promise<{ faces: any[] }> { return { faces: [] }; }
}