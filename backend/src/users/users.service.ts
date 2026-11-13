import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../postgres/postgres.module';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

@Injectable()
export class UsersService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async create(email: string, passwordHash: string): Promise<User> {
    const result = await this.pool.query<User>(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash AS "passwordHash", role`,
      [email, passwordHash],
    );
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.pool.query<User>(
      `SELECT id, email, password_hash AS "passwordHash", role
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0];
  }
}