import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmDto } from './dto/film.dto';
import { ScheduleDto } from './dto/schedule.dto';

@Controller('/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll(): Promise<{ items: FilmDto[] }> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  async getScheduleByFilmId(
    @Param('id') filmId: string,
  ): Promise<ScheduleDto[]> {
    const schedule = await this.filmsService.getScheduleByFilmId(filmId);
    if (!schedule || schedule.length === 0) {
      throw new NotFoundException(
        `Schedule for film with ID "${filmId}" not found`,
      );
    }
    return schedule;
  }
}
