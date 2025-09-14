import * as winston from 'winston';
import { consoleTransport } from './transports/console.transport';
import { fileJsonTransport } from './transports/file-json.transport';
import { fileTskvTransport } from './transports/file-tskv.transport';

export const winstonConfig: winston.LoggerOptions = {
  levels: winston.config.npm.levels,
  transports: [
    consoleTransport, // 1. Транспорт для консоли
    fileJsonTransport, // 2. Транспорт для JSON-файла
    fileTskvTransport, // 3. Транспорт для TSKV-файла
  ],
};
