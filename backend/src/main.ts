import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const config = app.get(ConfigService)
  const port = Number(config.getOrThrow<string>('BACKEND_PORT'))
  await app.listen(port ?? 3000, '127.0.0.1');
}
void bootstrap();
