import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GRPCGatewayService {
  private readonly logger = new Logger(GRPCGatewayService.name);

  async convertToREST(service: string, proto: any): Promise<any> { return {}; }
}