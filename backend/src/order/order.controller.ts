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
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Body() orderDto: OrderDto,
  ): Promise<ApiListResponse<OrderResultDto>> {
    const tickets = orderDto.tickets;
    if (!tickets || tickets.length === 0) {
      throw new BadRequestException('Массив билетов не может быть пустым.');
    }

    try {
      const firstTicket = tickets[0];
      const bookSeatsDto: BookSeatsDto = {
        filmId: firstTicket.film,
        scheduleId: firstTicket.session,
        seats: tickets.map((ticket) => ({
          row: ticket.row,
          seat: ticket.seat,
        })),
      };

      // Вызываем сервис для бронирования мест.
      const createdTickets = await this.orderService.bookSeats(bookSeatsDto);

      const orderResultItems: OrderResultDto[] = tickets.map((ticket) => {
        const created = createdTickets.find(
          (c) => c.row === ticket.row && c.seat === ticket.seat,
        );

        return {
          id: created?.id, // Добавляем ID из ответа сервиса
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
        };
      });

      return {
        total: orderResultItems.length,
        items: orderResultItems,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Ошибка при бронировании мест:', error);
      throw new BadRequestException(
        'Не удалось забронировать места. Пожалуйста, попробуйте снова.',
      );
    }
  }
}
