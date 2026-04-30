import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DriversModule } from './drivers.module';
async function bootstrap() {
  const app = await NestFactory.create(DriversModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();
  const port = process.env.PORT || 3003;
  await app.listen(port);
  console. log(`🚗 Drivers service running on port ${port}`);
}
bootstrap();