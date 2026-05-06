import { Injectable } from '@nestjs/common';

@Injectable()
export class AMLScreeningService {
  async screen(name: string): Promise<{ risk: string; hits: any[] }> { return { risk: 'low', hits: [] }; }
}