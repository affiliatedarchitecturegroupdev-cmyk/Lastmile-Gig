import { Injectable } from '@nestjs/common';

@Injectable()
export class SwaggerUIService {
  async renderSwagger(spec: any): Promise<{ html: string }> { return { html: '<html></html>' }; }
}