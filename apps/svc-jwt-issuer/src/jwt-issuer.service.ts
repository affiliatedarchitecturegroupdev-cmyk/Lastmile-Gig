import { Injectable } from '@nestjs/common';

@Injectable()
export class JWTIssuerService {
  async issueToken(payload: any): Promise<{ token: string }> { return { token: 'eyJhbGciOiJIUz...' }; }
}