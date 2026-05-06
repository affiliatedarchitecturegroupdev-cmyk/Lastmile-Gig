import { Injectable } from '@nestjs/common';

@Injectable()
export class APIDocsService {
  async generateDocs(): Promise<{ markdown: string }> { return { markdown: '# API Documentation' }; }
}