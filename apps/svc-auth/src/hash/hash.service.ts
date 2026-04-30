import { Injectable } from '@nestjs/common';
import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';

@Injectable()
export class HashService {
  private readonly rounds = 12;

  async hash(password: string): Promise<string> {
    return bcryptHash(password, this.rounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcryptCompare(password, hash);
  }
}