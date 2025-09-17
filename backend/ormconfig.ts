import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config();

const configService = new ConfigService();

const isProduction = configService.get('NODE_ENV') === 'production';
const dbDriver = configService.get('DATABASE_DRIVER', 'postgres');

let configOptions: DataSourceOptions;

if (dbDriver === 'postgres') {
  configOptions = {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get('POSTGRES_USERNAME', 'postgres'),
    password: configService.get('POSTGRES_PASSWORD', 'postgres'),
    database: configService.get('POSTGRES_DATABASE', 'prac'),
    entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'src/database/migrations/*{.ts,.js}')],
    synchronize: !isProduction,
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else if (dbDriver === 'mongodb') {
  configOptions = {
    type: 'mongodb',
    url: configService.get('DATABASE_URL'),
    entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
    synchronize: !isProduction,
  };
} else {
  throw new Error(`Unsupported database driver: ${dbDriver}`);
}

const dataSource = new DataSource(configOptions);

export default dataSource;
