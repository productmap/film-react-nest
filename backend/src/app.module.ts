import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { DatabaseModule } from './database';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingMiddleware } from './lib/logging';
import { RateLimiterMiddleware } from './lib/middleware/rate-limiter.middleware';

@Module({
  imports: [
    // Конфигурация
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    // База данных
    DatabaseModule.forRoot(),
    // Бизнес-логика
    FilmsModule,
    OrderModule,
    // Модуль для раздачи статического контента
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    // Модуль для ограничения скорости запросов
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 минута
        limit: 100, // 100 запросов в минуту
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Логирование всех запросов
    consumer.apply(LoggingMiddleware).forRoutes('*');
    // Ограничение скорости запросов
    consumer.apply(RateLimiterMiddleware).forRoutes('*');
  }
}
