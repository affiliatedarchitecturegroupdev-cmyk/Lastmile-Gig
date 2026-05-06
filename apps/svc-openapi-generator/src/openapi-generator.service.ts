import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAPIGeneratorService {
  async generateOpenAPI(): Promise<{ spec: any }> { return { spec: { openapi: '3.0.0' } }; }
}