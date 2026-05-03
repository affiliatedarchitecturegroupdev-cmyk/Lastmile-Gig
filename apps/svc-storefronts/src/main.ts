import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { StorefrontsModule } from './storefronts.module';

async function bootstrap() {
  const app = await NestFactory.create(StorefrontsModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`🏪 Partner Storefronts service running on port ${port}`);
}
bootstrap();