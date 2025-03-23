import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderDto, BookSeatsDto, OrderResultDto } from './order.dto';

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@Controller('/order')
@UsePipes(new ValidationPipe())
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() orderDto: OrderDto,
  ): Promise<ApiListResponse<OrderResultDto>> {
    try {
      const bookSeatsDto: BookSeatsDto = {
        filmId: orderDto.tickets[0].film,
        scheduleId: orderDto.tickets[0].session,
        seats: orderDto.tickets.map((ticket) => ({
          row: ticket.row,
          seat: ticket.seat,
        })),
      };
      await this.orderService.bookSeats(bookSeatsDto);
      const orderResultItems: OrderResultDto[] = orderDto.tickets.map(
        (ticket) => ({
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime || '',
          day: ticket.day || '',
          time: ticket.time || '',
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price || 0,
        }),
      );

      return {
        total: orderResultItems.length,
        items: orderResultItems,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error booking seats:', error);
      throw new BadRequestException('Failed to book seats. Please try again.');
    }
  }
}
