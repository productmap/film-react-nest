export default class appConfig {
  static readonly env: string = process.env.NODE_ENV || 'development';
  static readonly protocol: string = process.env.PROTOCOL || 'http';
  static readonly host: string = process.env.HOST || '0.0.0.0';
  static readonly port: number = parseInt(process.env.PORT || '3000', 10);
  static readonly globalPrefix: string = process.env.GLOBAL_PREFIX || 'api';
  static readonly dbDriver: string = process.env.DATABASE_DRIVER || 'postgres';
  static readonly dbHost: string = process.env.POSTGRES_HOST || 'localhost';
  static readonly dbPort: number = parseInt(
    process.env.POSTGRES_PORT || '5432',
    10,
  );
  static readonly dbUser: string = process.env.DB_USER || 'film';
  static readonly dbPassword: string = process.env.DB_PASSWORD || 'film';
  static readonly dbName: string = process.env.DB_NAME || 'prac';
  static readonly dbUrl: string =
    process.env.DATABASE_URL || 'mongodb://localhost:27017/prac';
}
