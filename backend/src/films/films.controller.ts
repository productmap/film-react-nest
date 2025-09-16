import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FilmsService } from './films.service';
import { MovieDto, SessionDto } from './films.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@ApiTags('Фильмы') // Группируем эндпоинты под тегом "Фильмы"
@Controller('/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех фильмов' })
  @ApiResponse({
    status: 200,
    description: 'Список всех фильмов',
    type: [MovieDto],
  })
  async findAll(): Promise<ApiListResponse<MovieDto>> {
    const items = await this.filmsService.findAll();
    const total = items.length;
    return { total, items };
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Получить расписание сеансов для фильма' })
  @ApiParam({ name: 'id', description: 'ID фильма' })
  @ApiResponse({
    status: 200,
    description: 'Расписание сеансов',
    type: [SessionDto],
  })
  @ApiResponse({ status: 404, description: 'Фильм не найден' })
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
