import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto, OrderResultDto } from './order.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@ApiTags('Заказы')
@Controller('/order')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новый заказ' })
  @ApiBody({ type: OrderDto })
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно создан',
    type: OrderResultDto,
  })
  @ApiResponse({ status: 400, description: 'Неверные данные заказа' })
  async createOrder(
    @Body() orderDto: OrderDto,
  ): Promise<ApiListResponse<OrderResultDto>> {
    return this.orderService.createOrder(orderDto);
  }
}
