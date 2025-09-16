import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import appConfig from './app.config';
import helmet from 'helmet';
import { winstonConfig } from './lib/logging';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  const logger = new Logger('App');
  // Защита от поддельных запросов
  app.use(helmet());
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
  // Основный префикс для всех маршрутов
  app.setGlobalPrefix(appConfig.globalPrefix, { exclude: ['/'] });
  // Запуск сервера
  await app.listen(appConfig.port, appConfig.host);
  logger.log(
    `Сервер запущен: ${appConfig.protocol}://${appConfig.host}:${appConfig.port}`,
  );
}

(async () => {
  try {
    await bootstrap();
  } catch (error) {
    console.error('Фатальная ошибка при запуске сервера', error);
    process.exit(1);
  }
})();
