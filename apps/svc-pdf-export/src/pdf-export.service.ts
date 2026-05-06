import { Injectable } from '@nestjs/common';

@Injectable()
export class PDFExportService {
  async exportToPDF(data: any): Promise<{ pdfUrl: string }> { return { pdfUrl: 'https://...' }; }
}