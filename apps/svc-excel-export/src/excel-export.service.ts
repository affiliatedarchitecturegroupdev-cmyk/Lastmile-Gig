import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelExportService {
  async exportToExcel(data: any): Promise<{ excelUrl: string }> { return { excelUrl: 'https://...' }; }
}