import { Injectable } from '@nestjs/common';

@Injectable()
export class GraphQLSchemaService {
  async generateSchema(): Promise<{ schema: string }> { return { schema: 'type Query { hello: String }' }; }
}