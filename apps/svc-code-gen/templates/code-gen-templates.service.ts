import { Injectable } from '@nestjs/common';

@Injectable()
export class CodeGenTemplatesService {
  async getTemplate(templateName: string): Promise<{ content: string }> { return { content: 'Template code...' }; }
}