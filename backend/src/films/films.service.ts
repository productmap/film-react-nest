import { Injectable } from '@nestjs/common';
import { FilmsRepository } from './films.repository';
import { MovieDto, SessionDto } from './films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async importFilms(filmsData: any[]): Promise<void> {
    await this.filmsRepository.insertMany(filmsData);
  }

  async countFilms(): Promise<number> {
    return this.filmsRepository.countFilms();
  }

  async findAll(): Promise<MovieDto[]> {
    const films = await this.filmsRepository.findAll();
    return films.map((film) => this.mapFilmDocumentToDto(film));
  }

  async getScheduleByFilmId(filmId: string): Promise<SessionDto[]> {
    const film = await this.filmsRepository.findFilmById(filmId);
    if (!film) {
      return null;
    }
    return film.schedule.map((schedule) => this.mapScheduleToDto(schedule));
  }
  private mapFilmDocumentToDto(filmDocument: any): MovieDto {
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

  private mapScheduleToDto(schedule: any): SessionDto {
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
