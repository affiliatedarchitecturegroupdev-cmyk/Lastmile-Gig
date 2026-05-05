import { Injectable } from '@nestjs/common';

@Injectable()
export class OCRReceiptsService {
  async processReceipt(imageUrl: string): Promise<any> { return { items: [], total: 0 }; }
}