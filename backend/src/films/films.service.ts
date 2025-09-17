import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FilmsRepository } from './films.repository';
import { MovieDto, SessionDto } from './films.dto';

@Injectable()
export class FilmsService {
  private readonly logger = new Logger(FilmsService.name);

  constructor(private readonly filmsRepository: FilmsRepository) {}

  async seedDatabase(): Promise<void> {
    const filmsCount = await this.filmsRepository.countFilms();
    if (filmsCount === 0) {
      this.logger.log('База данных пуста, запускаем начальное наполнение...');
      await this.filmsRepository.seed();
    } else {
      this.logger.log('В базе данных уже есть записи, наполнение пропущено.');
    }
  }

  async countFilms(): Promise<number> {
    return this.filmsRepository.countFilms();
  }

  async findAll(): Promise<MovieDto[]> {
    const films = await this.filmsRepository.findAll();
    return films.map((film) => this.mapFilmToDto(film, false));
  }

  async getScheduleByFilmId(filmId: string): Promise<SessionDto[]> {
    const film = await this.filmsRepository.findFilmById(filmId);
    if (!film) {
      throw new NotFoundException(`Фильм с ID ${filmId} не найден`);
    }
    const schedules = film.schedules || film.schedule || [];
    return schedules.map((schedule) => this.mapScheduleToDto(schedule));
  }

  private mapFilmToDto(film: any, includeSchedule = true): MovieDto {
    if (!film || !film.id) {
      return {} as MovieDto;
    }

    const dto: MovieDto = {
      id: film.id,
      title: film.title,
      about: film.about,
      description: film.description,
      genre: film.genre,
      duration: film.duration,
      rating: film.rating,
      director: film.director,
      tags: film.tags || [],
      image: film.image,
      cover: film.cover,
    };

    const schedules = film.schedules || film.schedule;

    if (includeSchedule && schedules) {
      dto.schedule = schedules.map((s) => this.mapScheduleToDto(s));
    }

    return dto;
  }

  private mapScheduleToDto(schedule: any): SessionDto {
    return {
      id: schedule.id,
      daytime: new Date(schedule.daytime).toISOString(),
      hall: schedule.hall,
      rows: schedule.rows,
      seats: schedule.seats,
      price: schedule.price,
      taken: schedule.taken || [],
    };
  }
}
