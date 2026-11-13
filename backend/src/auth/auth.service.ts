import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';

export interface PublicUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(email: unknown, password: unknown): Promise<PublicUser> {
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw new BadRequestException('Email and password are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
      throw new BadRequestException('Invalid email');
    }
    if (password.length < 12 || password.length > 128) {
      throw new BadRequestException(
        'Password must be between 12 and 128 characters',
      );
    }

    const passwordHash = await argon2.hash(password);

    try {
      const user = await this.usersService.create(normalizedEmail, passwordHash);
      return { id: user.id, email: user.email, role: user.role };
    } catch (error) {
      // 23505 is PostgreSQL's code for a unique constraint violation.
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }
}