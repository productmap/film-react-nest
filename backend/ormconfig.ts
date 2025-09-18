import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import appConfig from './src/app.config';

const isProduction = appConfig.env;
const dbDriver = appConfig.dbDriver;

let configOptions: DataSourceOptions;

if (dbDriver === 'postgres') {
  configOptions = {
    type: 'postgres',
    host: appConfig.dbHost,
    port: appConfig.dbPort,
    username: appConfig.dbUser,
    password: appConfig.dbPassword,
    database: appConfig.dbName,
    entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, 'src/database/migrations/*{.ts,.js}')],
    synchronize: !isProduction,
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
} else if (dbDriver === 'mongodb') {
  configOptions = {
    type: 'mongodb',
    url: appConfig.dbUrl,
    entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
    synchronize: !isProduction,
  };
} else {
  throw new Error(`Unsupported database driver: ${dbDriver}`);
}

const dataSource = new DataSource(configOptions);

export default dataSource;
