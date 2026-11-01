import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../postgres/postgres.module';

export interface Product {
  id: number;
  name: string;
  description: string;
  priceCents: number;
}

@Injectable()
export class ProductsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findAll(q?: string): Promise<Product[]> {
    if (q === undefined || q === '') {
      const all = await this.pool.query<Product>(
        'SELECT id, name, description, price_cents AS "priceCents" FROM products ORDER BY id',
      );
      return all.rows;
    }

    // Escape LIKE wildcards so the user's % and _ are treated as plain characters.
    const pattern = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    const found = await this.pool.query<Product>(
      `SELECT id, name, description, price_cents AS "priceCents"
       FROM products
       WHERE name ILIKE $1 OR description ILIKE $1
       ORDER BY id`,
      [pattern],
    );
    return found.rows;
  }
}