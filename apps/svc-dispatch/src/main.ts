import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DispatchModule } from './dispatch.module';

async function bootstrap() {
  const app = await NestFactory.create(DispatchModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`📦 Dispatch service running on port ${port}`);
}
bootstrap();