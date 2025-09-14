import { Module, DynamicModule, Logger, Global, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Film } from '../films/films.entity';
import { Schedule } from '../order/order.entity';

@Global()
@Module({})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  onModuleInit() {
    const driver = process.env.DATABASE_DRIVER;
    this.logger.log(`Initializing database connection for driver: ${driver}`);
  }

  static forRoot(): DynamicModule {
    const driver = process.env.DATABASE_DRIVER;

    if (driver === 'mongodb') {
      return {
        module: DatabaseModule,
        imports: [
          MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const uri = configService.get<string>('DATABASE_URL');
              if (!uri) {
                throw new Error(
                  'DATABASE_URL is not defined for mongodb driver',
                );
              }
              return { uri };
            },
          }),
        ],
        exports: [MongooseModule],
      };
    }

    if (driver === 'postgres') {
      return {
        module: DatabaseModule,
        imports: [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              return {
                type: 'postgres',
                host: configService.get<string>('POSTGRES_HOST'),
                port: configService.get<number>('POSTGRES_PORT'),
                username: configService.get<string>('POSTGRES_USERNAME'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DATABASE'),
                entities: [Film, Schedule],
                synchronize: configService.get('NODE_ENV') !== 'production',
              };
            },
          }),
        ],
        exports: [TypeOrmModule],
      };
    }

    throw new Error('DATABASE_DRIVER is not set or invalid.');
  }
}
