import { Injectable } from '@nestjs/common';

interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: string;
  status: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async create(data: Partial<User>): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: data.email!,
      passwordHash: data.passwordHash!,
      phone: data.phone,
      role: 'customer',
      status: 'active',
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async updatePassword(id: string, hash: string): Promise<void> {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.passwordHash = hash;
      user.updatedAt = new Date();
    }
  }

  async verifyEmail(id: string): Promise<void> {
    // Email verification logic
  }
}