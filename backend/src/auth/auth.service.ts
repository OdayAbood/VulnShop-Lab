import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
  constructor(private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

    private dummyHash?: Promise<string>;

  private getDummyHash(): Promise<string> {
    if (!this.dummyHash) {
      this.dummyHash = argon2.hash('not-a-real-password');
    }
    return this.dummyHash;
  }

  async validateUser(email: unknown, password: unknown): Promise<PublicUser> {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length > 128
    ) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(
      email.trim().toLowerCase(),
    );

    // Always verify a hash, even when the user does not exist, so the
    // response time does not reveal which emails are registered.
    const hash = user ? user.passwordHash : await this.getDummyHash();
    const passwordMatches = await argon2.verify(hash, password);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: unknown,password: unknown,): Promise<{ accessToken: string }> {
    const user = await this.validateUser(email, password);
    const accessToken = await this.jwtService.signAsync({ sub: user.id });
    return { accessToken };
  }

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