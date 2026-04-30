import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from './jwt/jwt.service';
import { HashService } from './hash/hash.service';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const passwordHash = await this.hashService.hash(dto.password);

    // Create user
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Generate tokens
    const tokens = await this.jwtService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: { id: user.id, email: user.email },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.hashService.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.jwtService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken);
      
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      return this.jwtService.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch {
      throw new UnauthorizedException();
    }
  }

  async verifyEmail(token: string) {
    const payload = await this.jwtService.verify(token);
    await this.usersService.verifyEmail(payload.sub);
    return { verified: true };
  }

  async verifyPhone(code: string) {
    // SMS verification logic
    return { verified: true };
  }

  async sendPasswordReset(email: string) {
    // Send password reset email
    return { sent: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = await this.jwtService.verify(token);
    const hash = await this.hashService.hash(newPassword);
    await this.usersService.updatePassword(payload.sub, hash);
    return { reset: true };
  }
}

interface RegisterDto {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

interface LoginDto {
  email: string;
  password: string;
}