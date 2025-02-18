import { ConfigModule, ConfigService } from '@nestjs/config';

export interface AppConfig {
  database: AppConfigDatabase;
}

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export const configProvider = {
  imports: [ConfigModule.forRoot()],
  provide: 'CONFIG',
  useFactory: async (configService: ConfigService): Promise<AppConfig> => {
    return {
      database: {
        driver: configService.get<string>('DATABASE_DRIVER'),
        url: configService.get<string>('DATABASE_URL'),
      },
    };
  },
  inject: [ConfigService],
};
