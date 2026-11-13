import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

function readCredentials(body: unknown): { email: unknown; password: unknown } {
  if (typeof body !== 'object' || body === null) {
    throw new BadRequestException('Invalid request body');
  }
  // Pick only the two fields we accept; anything else in the body is ignored.
  const { email, password } = body as Record<string, unknown>;
  return { email, password };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    const { email, password } = readCredentials(body);
    return this.authService.register(email, password);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() body: unknown) {
    const { email, password } = readCredentials(body);
    return this.authService.login(email, password);
  }
}