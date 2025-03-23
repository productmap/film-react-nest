import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { MovieDto, SessionDto } from './films.dto';

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@Controller('/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll(): Promise<ApiListResponse<MovieDto>> {
    const items = await this.filmsService.findAll();
    const total = items.length;
    return { total, items };
  }

  @Get(':id/schedule')
  async getScheduleByFilmId(
    @Param('id') filmId: string,
  ): Promise<ApiListResponse<SessionDto>> {
    const items = await this.filmsService.getScheduleByFilmId(filmId);
    if (!items || items.length === 0) {
      throw new NotFoundException(
        `Schedule for film with ID "${filmId}" not found`,
      );
    }
    const total = items.length;
    return { total, items };
  }
}
