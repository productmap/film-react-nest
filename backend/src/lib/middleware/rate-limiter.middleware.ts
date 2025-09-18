import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

/**
 * Хранилище для ограничения скорости
 * В производственной среде это должно быть заменено на Redis или другой распределенный кэш
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Middleware для ограничения скорости, защищающий API-конечные точки от злоупотреблений
 */
@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimiterMiddleware.name);
  private readonly store: RateLimitStore = {};
  private readonly limit = 100; // Максимальное количество запросов
  private readonly ttl = 60 * 1000; // Временное окно в миллисекундах (1 минута)

  use(req: Request, res: Response, next: NextFunction) {
    // Получить IP-адрес клиента в качестве идентификатора
    const ip = req.ip || 'unknown';
    const now = Date.now();

    // Очистить просроченные записи
    this.cleanupStore(now);

    // Инициализировать или получить существующую запись
    if (!this.store[ip]) {
      this.store[ip] = {
        count: 0,
        resetTime: now + this.ttl,
      };
    }

    // Сбросить, если TTL истек
    if (now > this.store[ip].resetTime) {
      this.store[ip] = {
        count: 0,
        resetTime: now + this.ttl,
      };
    }

    // Увеличить счетчик запросов
    this.store[ip].count++;

    // Проверить, превышен ли лимит
    if (this.store[ip].count > this.limit) {
      const resetTime = this.store[ip].resetTime;
      const timeLeft = Math.ceil((resetTime - now) / 1000);

      // Установить заголовки ограничения скорости
      res.setHeader('Retry-After', timeLeft.toString());
      res.setHeader('X-RateLimit-Limit', this.limit.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(resetTime / 1000).toString(),
      );

      this.logger.warn(`Превышен лимит скорости для IP: ${ip}`);
      throw new ThrottlerException(
        `Слишком много запросов. Пожалуйста, попробуйте позже через ${timeLeft} секунд.`,
      );
    }

    // Установить заголовки ограничения скорости
    res.setHeader('X-RateLimit-Limit', this.limit.toString());
    res.setHeader(
      'X-RateLimit-Remaining',
      (this.limit - this.store[ip].count).toString(),
    );
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil(this.store[ip].resetTime / 1000).toString(),
    );

    next();
  }

  /**
   * Очистить просроченные записи, чтобы предотвратить утечки памяти
   */
  private cleanupStore(now: number) {
    for (const key in this.store) {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    }
  }
}
