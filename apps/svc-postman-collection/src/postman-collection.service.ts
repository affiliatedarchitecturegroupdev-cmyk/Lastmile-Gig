import { Injectable } from '@nestjs/common';

@Injectable()
export class PostmanCollectionService {
  async generateCollection(apiId: string): Promise<{ collection: any }> { return { collection: { info: { name: 'API' } } }; }
}