import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportTemplatesService {
  async getTemplate(templateId: string): Promise<{ template: any }> { return { template: { id: templateId } }; }
}