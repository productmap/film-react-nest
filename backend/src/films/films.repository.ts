import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Film as TypeOrmFilm } from './films.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film as MongooseFilm, FilmDocument } from './films.schema';
import * as fs from 'fs/promises';
import * as path from 'path';

export abstract class FilmsRepository {
  abstract insertMany(films: any[]): Promise<void>;
  abstract countFilms(): Promise<number>;
  abstract findAll(): Promise<any[]>;
  abstract findFilmById(filmId: string): Promise<any | null>;
  abstract seed(): Promise<void>;
}

// Реализация репозитория для TypeORM (PostgreSQL)
@Injectable()
export class TypeOrmFilmsRepository extends FilmsRepository {
  private readonly logger = new Logger('PostgresSeeder');

  constructor(
    @InjectRepository(TypeOrmFilm)
    private readonly filmRepository: Repository<TypeOrmFilm>,
  ) {
    super();
  }

  async seed(): Promise<void> {
    this.logger.log('Наполнение базы данных PostgreSQL...');
    try {
      const stubFilePath = path.join(
        process.cwd(),
        'test',
        'mongodb_initial_stub.json',
      );
      const jsonData = await fs.readFile(stubFilePath, 'utf-8');
      const filmsData = JSON.parse(jsonData);

      const filmsToSave = filmsData.map((film) => {
        return this.filmRepository.create({
          id: film.id,
          title: film.title,
          about: film.about,
          description: film.description,
          rating: film.rating,
          director: film.director,
          tags: film.tags,
          image: film.image,
          cover: film.cover,
          genre: film.genre || (film.tags && film.tags[0]) || 'General',
          duration: film.duration || 90,
          schedules: film.schedule.map((s) => ({
            ...s,
            daytime: new Date(s.daytime),
          })),
        });
      });

      await this.filmRepository.save(filmsToSave);
      this.logger.log('База данных PostgreSQL успешно наполнена.');
    } catch (error) {
      this.logger.error('Ошибка при наполнении базы PostgreSQL:', error.stack);
    }
  }

  async insertMany(filmsData: any[]): Promise<void> {
    const films = this.filmRepository.create(filmsData);
    await this.filmRepository.save(films);
  }

  async countFilms(): Promise<number> {
    return this.filmRepository.count();
  }

  async findAll(): Promise<any[]> {
    return this.filmRepository
      .createQueryBuilder('film')
      .leftJoinAndSelect('film.schedules', 'schedule')
      .getMany();
  }

  async findFilmById(filmId: string): Promise<any | null> {
    return this.filmRepository
      .createQueryBuilder('film')
      .leftJoinAndSelect('film.schedules', 'schedule')
      .where('film.id = :id', { id: filmId })
      .getOne();
  }
}

// Реализация репозитория для Mongoose (MongoDB)
@Injectable()
export class MongooseFilmsRepository extends FilmsRepository {
  private readonly logger = new Logger('MongoSeeder');

  constructor(
    @InjectModel(MongooseFilm.name)
    private readonly filmModel: Model<FilmDocument>,
  ) {
    super();
  }

  async seed(): Promise<void> {
    this.logger.log('Наполнение базы данных MongoDB...');
    try {
      const stubFilePath = path.join(
        process.cwd(),
        'test',
        'mongodb_initial_stub.json',
      );
      const jsonData = await fs.readFile(stubFilePath, 'utf-8');
      const filmsData = JSON.parse(jsonData);
      await this.filmModel.insertMany(filmsData);
      this.logger.log('База данных MongoDB успешно наполнена.');
    } catch (error) {
      this.logger.error('Ошибка при наполнении базы MongoDB:', error.stack);
    }
  }

  async insertMany(films: any[]): Promise<void> {
    await this.filmModel.insertMany(films);
  }

  async countFilms(): Promise<number> {
    return this.filmModel.countDocuments().exec();
  }

  async findAll(): Promise<any[]> {
    return this.filmModel.find().lean().exec();
  }

  async findFilmById(filmId: string): Promise<any | null> {
    return this.filmModel.findOne({ id: filmId }).lean().exec();
  }
}
