import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { winstonConfig } from './lib/logging/winston.config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  const logger = new Logger('App');
  app.setGlobalPrefix('api/afisha');
  app.enableCors();

  const hostname = process.env.HOST || '0.0.0.0';
  const port = process.env.PORT || 3000;
  await app.listen(port, hostname);
  logger.log(`Application is running on: http://${hostname}:${port}`);
}

bootstrap();
