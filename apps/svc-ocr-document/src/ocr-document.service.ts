import { Injectable } from '@nestjs/common';

@Injectable()
export class OCRDocumentService {
  async extractText(documentUrl: string): Promise<{ text: string }> { return { text: 'Extracted text' }; }
}