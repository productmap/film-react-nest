import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Проверка работоспособности сервиса' })
  @ApiResponse({ status: 200, description: 'Сервис работает' })
  getHello(): string {
    return this.appService.getHello();
  }
}
