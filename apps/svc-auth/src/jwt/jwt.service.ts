import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignOptions, verify, sign } from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtService {
  private secret: string;
  private options: SignOptions;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'dev-secret';
    this.options = {
      issuer: 'lastmilegig',
    };
  }

  async generateTokens(payload: JwtPayload) {
    const accessToken = sign(payload, this.secret, {
      ...this.options,
      expiresIn: '15m',
    });

    const refreshToken = sign(payload, this.secret, {
      ...this.options,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verify(token: string): Promise<JwtPayload> {
    try {
      return verify(token, this.secret, this.options) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async decode(token: string): Promise<JwtPayload | null> {
    const decoded = verify(token, this.secret, { complete: true });
    return decoded as unknown as JwtPayload;
  }
}