import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SeatDto {
  @IsNotEmpty()
  row: number;

  @IsNotEmpty()
  seat: number;
}

export class BookSeatsDto {
  @IsNotEmpty()
  @IsString()
  filmId: string;

  @IsNotEmpty()
  @IsString()
  scheduleId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];
}

// Этот DTO описывает ответ сервера после успешного бронирования
export class OrderResponseDto {
  orderId: string;
  filmId: string;
  scheduleId: string;
  seats: SeatDto[];
  status: string; // e.g., 'confirmed'
}

export class OrderDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('RU')
  phone: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}

export class TicketDto {
  @IsNotEmpty()
  @IsString()
  film: string;
  @IsNotEmpty()
  @IsString()
  session: string;
  @IsNotEmpty()
  row: number;
  @IsNotEmpty()
  seat: number;
  daytime?: string;
  day?: string;
  time?: string;
  price?: number;
}

export class OrderResultDto {
  id?: string;
  film: string;
  session: string;
  daytime: string;
  day?: string;
  time?: string;
  row: number;
  seat: number;
  price: number;
}
