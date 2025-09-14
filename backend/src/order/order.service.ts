import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FilmsService } from '../films/films.service';
import { OrderRepository } from './order.repository';
import { BookSeatsDto, OrderDto, OrderResultDto } from './order.dto';

export interface CreatedTicket {
  id: string;
  filmId: string;
  scheduleId: string;
  row: number;
  seat: number;
}

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly filmsService: FilmsService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async createOrder(
    orderDto: OrderDto,
  ): Promise<ApiListResponse<OrderResultDto>> {
    const { tickets } = orderDto;
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

      const createdTickets = await this.bookSeats(bookSeatsDto);

      const orderResultItems: OrderResultDto[] = tickets.map((ticket) => {
        const created = createdTickets.find(
          (c) => c.row === ticket.row && c.seat === ticket.seat,
        );

        return {
          id: created?.id,
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
      this.logger.error('Ошибка при создании заказа', error.stack);
      throw new BadRequestException(
        'Не удалось создать заказ. Пожалуйста, попробуйте снова.',
      );
    }
  }

  async bookSeats(bookSeatsDto: BookSeatsDto): Promise<CreatedTicket[]> {
    const { filmId, scheduleId, seats } = bookSeatsDto;

    const schedule = await this.orderRepository.findSchedule(
      filmId,
      scheduleId,
    );

    if (!schedule) {
      throw new NotFoundException(
        `Сеанс с ID "${scheduleId}" не найден для фильма "${filmId}"`,
      );
    }

    const seatsToBook: string[] = [];
    const takenSeatsInSchedule = schedule.taken || [];

    // Проверяем, не заняты ли какие-либо из запрошенных мест.
    for (const seatToBook of seats) {
      const seatKey = `${seatToBook.row}:${seatToBook.seat}`;
      if (takenSeatsInSchedule.includes(seatKey)) {
        throw new BadRequestException(
          `Место ${seatToBook.row}:${seatToBook.seat} уже занято на этом сеансе.`,
        );
      }
      seatsToBook.push(seatKey);
    }

    // Обновляем информацию о занятых местах в базе данных.
    await this.orderRepository.updateTakenSeats(scheduleId, [
      ...takenSeatsInSchedule,
      ...seatsToBook,
    ]);

    // Создаем результат для каждого забронированного билета.
    return seats.map((seat) => ({
      id: `order_${Date.now()}_${seat.row}_${seat.seat}`,
      filmId: filmId,
      scheduleId: scheduleId,
      row: seat.row,
      seat: seat.seat,
    }));
  }
}
