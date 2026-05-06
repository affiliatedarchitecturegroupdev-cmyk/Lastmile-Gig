import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentSummarizerService {
  async summarize(documentUrl: string): Promise<{ summary: string }> { return { summary: 'Document summary...' }; }
}