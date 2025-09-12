import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule as TypeOrmSchedule } from './order.entity';
import { Film as MongooseFilm, FilmDocument } from '../films/films.schema';

export abstract class OrderRepository {
  abstract findSchedule(filmId: string, scheduleId: string): Promise<any>;
  abstract updateTakenSeats(
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void>;
}

@Injectable()
export class TypeOrmOrderRepository extends OrderRepository {
  constructor(
    @InjectRepository(TypeOrmSchedule)
    private readonly scheduleRepository: Repository<TypeOrmSchedule>,
  ) {
    super();
  }

  async findSchedule(filmId: string, scheduleId: string): Promise<any> {
    // Исправлено: ищем по ID сеанса и по ID связанного фильма
    return this.scheduleRepository.findOne({
      where: { id: scheduleId, film: { id: filmId } },
    });
  }

  async updateTakenSeats(
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    await this.scheduleRepository.update(
      { id: scheduleId },
      { taken: takenSeats },
    );
  }
}

@Injectable()
export class MongooseOrderRepository extends OrderRepository {
  constructor(
    @InjectModel(MongooseFilm.name)
    private readonly filmModel: Model<FilmDocument>,
  ) {
    super();
  }

  async findSchedule(filmId: string, scheduleId: string): Promise<any> {
    const film = await this.filmModel.findOne({ id: filmId }).lean().exec();
    return film?.schedule.find((s) => s.id === scheduleId) || null;
  }

  async updateTakenSeats(
    scheduleId: string,
    takenSeats: string[],
  ): Promise<void> {
    await this.filmModel.updateOne(
      { 'schedule.id': scheduleId },
      { $set: { 'schedule.$.taken': takenSeats } },
    );
  }
}
