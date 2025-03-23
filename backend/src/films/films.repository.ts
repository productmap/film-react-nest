import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from './films.schema';

/** Репозиторий для управления данными фильмов  */
@Injectable()
export class FilmsRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  /**
   * Вставляет несколько фильмов в базу данных.
   * @param filmsData Массив данных фильмов для вставки
   * @returns Promise, который разрешается, когда вставка завершена
   */
  async insertMany(filmsData: any[]): Promise<void> {
    await this.filmModel.insertMany(filmsData);
  }

  /**
   * Получает общее количество фильмов в базе данных.
   * @returns Promise, который разрешается с количеством фильмов
   */
  async countFilms(): Promise<number> {
    return this.filmModel.countDocuments().exec();
  }

  /**
   * Получает все фильмы из базы данных.
   * @returns Promise, который разрешается с массивом документов Film
   */
  async findAll(): Promise<FilmDocument[]> {
    return this.filmModel.find().lean().exec();
  }

  /**
   * Получает фильм по его ID.
   * @param filmId ID фильма для получения
   * @returns Promise, который разрешается с документом Film или null, если не найден
   */
  async findFilmById(filmId: string): Promise<FilmDocument | null> {
    return this.filmModel.findOne({ id: filmId }).lean().exec();
  }

  /**
   * Получает фильм по его ID для целей бронирования.
   * @param filmId ID фильма для получения
   * @returns Promise, который разрешается с документом Film или null, если не найден
   */
  async findFilmByIdForBooking(filmId: string): Promise<FilmDocument | null> {
    return this.filmModel.findOne({ id: filmId }).exec();
  }
}
