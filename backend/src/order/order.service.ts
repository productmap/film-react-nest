import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilmsService } from '../films/films.service';
import { OrderRepository } from './order.repository';
import { BookSeatsDto, OrderResponseDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly filmsService: FilmsService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async bookSeats(bookSeatsDto: BookSeatsDto): Promise<OrderResponseDto> {
    const { filmId, scheduleId, seats } = bookSeatsDto;

    const filmSchedule = await this.filmsService.getScheduleByFilmId(filmId);
    if (!filmSchedule) {
      throw new NotFoundException(`Film with ID "${filmId}" not found`);
    }

    const scheduleItem = filmSchedule.find((item) => item.id === scheduleId);
    if (!scheduleItem) {
      throw new NotFoundException(
        `Schedule with ID "${scheduleId}" not found for film "${filmId}"`,
      );
    }

    const bookedSeats: string[] = [];
    const takenSeatsInSchedule = scheduleItem.taken || [];

    for (const seatToBook of seats) {
      const seatKey = `${seatToBook.row}:${seatToBook.seat}`;
      if (takenSeatsInSchedule.includes(seatKey)) {
        throw new BadRequestException(
          `Seat ${seatToBook.row}:${seatToBook.seat} is already taken for this schedule.`,
        );
      }
      bookedSeats.push(seatKey);
    }

    await this.orderRepository.updateTakenSeats(
      filmId,
      scheduleId,
      bookedSeats,
      takenSeatsInSchedule,
    );

    return {
      success: true,
      message: 'Seats booked successfully',
      bookedSeats: bookedSeats,
    };
  }
}
