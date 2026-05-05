import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderTagService {
  async addTag(orderId: string, tag: string): Promise<boolean> { return true; }
  async removeTag(orderId: string, tag: string): Promise<boolean> { return true; }
  async getTags(orderId: string): Promise<string[]> { return ['rush']; }
}