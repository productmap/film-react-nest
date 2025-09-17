import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsModule } from '../films/films.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  OrderRepository,
  TypeOrmOrderRepository,
  MongooseOrderRepository,
} from './order.repository';
import { Schedule as TypeOrmSchedule } from './order.entity';
import { Film as MongooseFilm, FilmSchema } from '../films/films.schema';

const driver = process.env.DATABASE_DRIVER;

// Определяем модуль для работы с БД в зависимости от драйвера
const databaseFeatureModule =
  driver === 'mongodb'
    ? MongooseModule.forFeature([
        { name: MongooseFilm.name, schema: FilmSchema },
      ])
    : TypeOrmModule.forFeature([TypeOrmSchedule]);

@Module({
  imports: [ConfigModule, FilmsModule, databaseFeatureModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: OrderRepository,
      useClass:
        driver === 'mongodb' ? MongooseOrderRepository : TypeOrmOrderRepository,
    },
  ],
})
export class OrderModule {}
