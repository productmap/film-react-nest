export default class appConfig {
  static readonly protocol: string = process.env.PROTOCOL || 'http';
  static readonly host: string = process.env.HOST || 'localhost';
  static readonly port: number = parseInt(process.env.PORT || '3000', 10);
  static readonly globalPrefix: string = process.env.GLOBAL_PREFIX || 'api';
}
