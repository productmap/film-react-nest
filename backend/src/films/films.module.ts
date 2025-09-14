import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import {
  FilmsRepository,
  TypeOrmFilmsRepository,
  MongooseFilmsRepository,
} from './films.repository';
import { Film as TypeOrmFilm } from './films.entity';
import { Schedule as TypeOrmSchedule } from '../order/order.entity';
import { Film as MongooseFilm, FilmSchema } from './films.schema';

// Определяем, какой драйвер базы данных используется, на основе переменной окружения.
const driver = process.env.DATABASE_DRIVER;

const dbFeatureModule =
  driver === 'mongodb'
    ? MongooseModule.forFeature([
        { name: MongooseFilm.name, schema: FilmSchema },
      ])
    : TypeOrmModule.forFeature([TypeOrmFilm, TypeOrmSchedule]);

@Module({
  imports: [ConfigModule, dbFeatureModule],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    {
      provide: FilmsRepository,
      useClass:
        driver === 'mongodb' ? MongooseFilmsRepository : TypeOrmFilmsRepository,
    },
  ],
  exports: [FilmsService],
})
export class FilmsModule implements OnModuleInit {
  constructor(
    private readonly filmsService: FilmsService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Запускаем начальное наполнение базы данных только в режиме разработки.
    if (this.configService.get('NODE_ENV') !== 'production') {
      await this.filmsService.seedDatabase();
    }
  }
}
