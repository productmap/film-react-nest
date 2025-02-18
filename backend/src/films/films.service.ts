import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Film, FilmDocument } from './schemas/film.schema';
import { FilmDto } from './dto/film.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FilmsService {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  async importFilms(filmsData: any[]): Promise<void> {
    await this.filmModel.insertMany(filmsData);
  }

  async countFilms(): Promise<number> {
    return this.filmModel.countDocuments().exec();
  }

  async findAll(): Promise<{ items: FilmDto[] }> {
    const films = await this.filmModel.find().lean().exec();
    return { items: films.map((film) => this.mapFilmDocumentToDto(film)) };
  }

  async getScheduleByFilmId(filmId: string): Promise<ScheduleDto[]> {
    const film = await this.filmModel.findOne({ id: filmId }).lean().exec();
    if (!film) {
      return null; // Or throw NotFoundException, depending on requirement
    }
    return film.schedule.map((schedule) => this.mapScheduleToDto(schedule));
  }

  private mapFilmDocumentToDto(filmDocument: any): FilmDto {
    return {
      id: filmDocument.id,
      rating: filmDocument.rating,
      director: filmDocument.director,
      tags: filmDocument.tags,
      image: filmDocument.image,
      cover: filmDocument.cover,
      title: filmDocument.title,
      about: filmDocument.about,
      description: filmDocument.description,
      schedule: filmDocument.schedule.map(this.mapScheduleToDto),
    };
  }

  private mapScheduleToDto(schedule: any): ScheduleDto {
    return {
      id: schedule.id,
      daytime: schedule.daytime,
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken,
    };
  }
}
