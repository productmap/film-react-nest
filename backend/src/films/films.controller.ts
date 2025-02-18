import { Controller, Get, Param } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('afisha/films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll() {
    return [];
  }

  @Get(':id/schedule')
  async findSchedule(@Param('id') id: string) {
    return {};
  }
}
