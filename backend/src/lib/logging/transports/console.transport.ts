import * as winston from 'winston';
import { consoleFormat } from '../formats/console.format';

export const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: consoleFormat,
});
