import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (secret.length < 32 || secret.startsWith('change_me')) {
          throw new Error('JWT_SECRET must be a random value of 32+ characters');
        }
        return {
          secret,
          signOptions: { algorithm: 'HS256', expiresIn: 900 },
          verifyOptions: { algorithms: ['HS256'] },
        };
      },
    }),
  ],
  controllers:[AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}