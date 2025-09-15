import * as winston from 'winston';
import { tskvFormat } from '../formats/tskv.format';

/**
 * Транспорт для записи логов в формате TSKV
 */
export const fileTskvTransport = new winston.transports.File({
  level: 'info',
  filename: 'logs/app-tskv.log',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    tskvFormat,
  ),
});
