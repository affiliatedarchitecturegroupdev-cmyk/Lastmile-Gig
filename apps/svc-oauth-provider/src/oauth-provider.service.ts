import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuthProviderService {
  async authorize(clientId: string, redirectUri: string): Promise<{ authUrl: string }> { return { authUrl: 'https://auth.example.com/authorize' }; }
}