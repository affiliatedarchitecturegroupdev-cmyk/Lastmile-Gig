import { Injectable } from '@nestjs/common';

@Injectable()
export class StaticGeneratorService {
  async generate(page: string): Promise<{ html: string }> { return { html: '<html></html>' }; }
}