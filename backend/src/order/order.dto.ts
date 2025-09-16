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
import { ApiProperty } from '@nestjs/swagger';

export class SeatDto {
  @ApiProperty({ description: 'Ряд', example: 5 })
  @IsNotEmpty()
  row: number;

  @ApiProperty({ description: 'Место в ряду', example: 12 })
  @IsNotEmpty()
  seat: number;
}

export class BookSeatsDto {
  @ApiProperty({
    description: 'ID фильма',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  @IsString()
  filmId: string;

  @ApiProperty({
    description: 'ID сеанса',
    example: '60d21b4667d0d8992e610c86',
  })
  @IsNotEmpty()
  @IsString()
  scheduleId: string;

  @ApiProperty({ description: 'Массив выбранных мест', type: [SeatDto] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];
}

// Этот DTO описывает ответ сервера после успешного бронирования
export class OrderResponseDto {
  @ApiProperty({
    description: 'ID заказа',
    example: '60d21b4667d0d8992e610c87',
  })
  orderId: string;

  @ApiProperty({
    description: 'ID фильма',
    example: '60d21b4667d0d8992e610c85',
  })
  filmId: string;

  @ApiProperty({
    description: 'ID сеанса',
    example: '60d21b4667d0d8992e610c86',
  })
  scheduleId: string;

  @ApiProperty({ description: 'Массив забронированных мест', type: [SeatDto] })
  seats: SeatDto[];

  @ApiProperty({ description: 'Статус заказа', example: 'confirmed' })
  status: string;
}

export class TicketDto {
  @ApiProperty({
    description: 'ID фильма',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsNotEmpty()
  @IsString()
  film: string;

  @ApiProperty({
    description: 'ID сеанса',
    example: '60d21b4667d0d8992e610c86',
  })
  @IsNotEmpty()
  @IsString()
  session: string;

  @ApiProperty({ description: 'Ряд', example: 5 })
  @IsNotEmpty()
  row: number;

  @ApiProperty({ description: 'Место', example: 12 })
  @IsNotEmpty()
  seat: number;

  @ApiProperty({
    description: 'Время сеанса',
    example: '14:30',
    required: false,
  })
  daytime?: string;

  @ApiProperty({
    description: 'Дата сеанса',
    example: '2024-07-25',
    required: false,
  })
  day?: string;

  @ApiProperty({
    description: 'Время сеанса',
    example: '14:30',
    required: false,
  })
  time?: string;

  @ApiProperty({ description: 'Цена билета', example: 350, required: false })
  price?: number;
}

export class OrderDto {
  @ApiProperty({ description: 'Email покупателя', example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Телефон покупателя', example: '+79261234567' })
  @IsNotEmpty()
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({ description: 'Массив билетов в заказе', type: [TicketDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}

export class OrderResultDto {
  @ApiProperty({
    description: 'ID билета в заказе',
    example: '60d21b4667d0d8992e610c88',
    required: false,
  })
  id?: string;

  @ApiProperty({
    description: 'ID фильма',
    example: '60d21b4667d0d8992e610c85',
  })
  film: string;

  @ApiProperty({
    description: 'ID сеанса',
    example: '60d21b4667d0d8992e610c86',
  })
  session: string;

  @ApiProperty({ description: 'Время сеанса', example: '14:30' })
  daytime: string;

  @ApiProperty({
    description: 'Дата сеанса',
    example: '2024-07-25',
    required: false,
  })
  day?: string;

  @ApiProperty({
    description: 'Время сеанса',
    example: '14:30',
    required: false,
  })
  time?: string;

  @ApiProperty({ description: 'Ряд', example: 5 })
  row: number;

  @ApiProperty({ description: 'Место', example: 12 })
  seat: number;

  @ApiProperty({ description: 'Цена билета', example: 350 })
  price: number;
}
