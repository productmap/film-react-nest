import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilmsService } from '../films/films.service';
import { OrderRepository } from './order.repository';
import { BookSeatsDto } from './order.dto';

export interface CreatedTicket {
  id: string;
  filmId: string;
  scheduleId: string;
  row: number;
  seat: number;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly filmsService: FilmsService,
    private readonly orderRepository: OrderRepository,
  ) {}

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
    const createdTickets: CreatedTicket[] = seats.map((seat) => ({
      id: `order_${Date.now()}_${seat.row}_${seat.seat}`,
      filmId: filmId,
      scheduleId: scheduleId,
      row: seat.row,
      seat: seat.seat,
    }));

    return createdTickets;
  }
}
