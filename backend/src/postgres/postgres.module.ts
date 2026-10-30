import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const PG_POOL = 'PG_POOL'

@Global()
@Module({
    providers:[
        {
            provide: PG_POOL,
            inject: [ConfigService],
            useFactory: async (config: ConfigService): Promise<Pool> =>{
                const pool = new Pool({
                    host: config.getOrThrow<string>('POSTGRES_HOST'),
                    port: Number(config.getOrThrow<string>('POSTGRES_PORT')),
                    user: config.getOrThrow<string>('POSTGRES_USER'),
                    password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
                    database: config.getOrThrow<string>('POSTGRES_DB')
                });
                await pool.query("SELECT 1");
                return pool;
            },
        },
    ],
    exports: [PG_POOL]
})
export class PostgresModule {}
