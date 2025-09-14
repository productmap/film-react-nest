// src/common/logging/winston.config.ts

import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

// Кастомный формат для TSKV
const tskvFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    // Базовые поля
    let log = `tskv\ttimestamp=${timestamp}\tlevel=${level}\tmessage=${message}`;

    // Добавляем остальные метаданные
    for (const key in meta) {
      if (Object.prototype.hasOwnProperty.call(meta, key)) {
        // Для вложенных объектов можно использовать JSON.stringify
        const value =
          typeof meta[key] === 'object' ? JSON.stringify(meta[key]) : meta[key];
        log += `\t${key}=${value}`;
      }
    }
    return log;
  },
);

export const winstonConfig: winston.LoggerOptions = {
  // Уровни логирования (стандартные)
  levels: winston.config.npm.levels,
  // Транспорты - здесь вся магия
  transports: [
    // 1. Логирование в консоль для разработки
    new winston.transports.Console({
      level: 'debug', // Показывать в консоли все логи от 'debug' и выше
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }), // Краткий формат времени
        winston.format.ms(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.colorize(), // Раскрашиваем уровень лога
        winston.format.printf((info) => {
          const { timestamp, level, message, context, ms } = info;

          const symbols: Record<string, string> = {
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '⚙️',
          };

          const rawLevel = info[Symbol.for('level')] as string;
          const symbol = symbols[rawLevel] || ' ';
          const colorizedSymbol = level.replace(rawLevel, symbol);

          // ANSI-коды для цветов
          const grey = '\u001b[90m';
          const magenta = '\u001b[35m';
          const reset = '\u001b[0m';

          const contextMessage = context ? `${magenta}[${context}]${reset}` : '';
          const msMessage = `${grey}${ms}${reset}`;

          return `${timestamp} ${colorizedSymbol} ${contextMessage} ${message} ${msMessage}`;
        }),
      ),
    }),

    // 2. Транспорт для записи логов в формате JSON
    new winston.transports.File({
      level: 'info', // Писать в файл логи от 'info' и выше
      filename: 'logs/app-json.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // 3. Транспорт для записи логов в формате TSKV
    new winston.transports.File({
      level: 'info', // Писать в файл логи от 'info' и выше
      filename: 'logs/app-tskv.log',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), // Удобный формат времени для TSKV
        tskvFormat,
      ),
    }),
  ],
};
