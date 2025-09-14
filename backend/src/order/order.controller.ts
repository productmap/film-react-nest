import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto, OrderResultDto } from './order.dto';

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@Controller('/order')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() orderDto: OrderDto,
  ): Promise<ApiListResponse<OrderResultDto>> {
    return this.orderService.createOrder(orderDto);
  }
}
