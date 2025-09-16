import { ApiProperty } from '@nestjs/swagger';

export class SessionDto {
  @ApiProperty({
    description: 'Уникальный идентификатор сеанса',
    example: '60d21b4667d0d8992e610c86',
  })
  id: string;

  @ApiProperty({ description: 'Время начала сеанса', example: '14:30' })
  daytime: string;

  @ApiProperty({ description: 'Номер зала', example: 1 })
  hall: number;

  @ApiProperty({ description: 'Количество рядов в зале', example: 10 })
  rows: number;

  @ApiProperty({ description: 'Количество мест в ряду', example: 15 })
  seats: number;

  @ApiProperty({ description: 'Цена билета', example: 350 })
  price: number;

  @ApiProperty({ description: 'Массив занятых мест', example: ['1-5', '1-6'] })
  taken: string[];
}

export class MovieDto {
  @ApiProperty({
    description: 'Уникальный идентификатор фильма',
    example: '60d21b4667d0d8992e610c85',
  })
  id: string;

  @ApiProperty({ description: 'Рейтинг фильма', example: 8.5 })
  rating: number;

  @ApiProperty({ description: 'Режиссер фильма', example: 'Квентин Тарантино' })
  director: string;

  @ApiProperty({ description: 'Теги фильма', example: ['криминал', 'драма'] })
  tags: string[];

  @ApiProperty({
    description: 'URL изображения постера',
    example: 'https://example.com/poster.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'URL изображения обложки',
    example: 'https://example.com/cover.jpg',
  })
  cover: string;

  @ApiProperty({
    description: 'Название фильма',
    example: 'Криминальное чтиво',
  })
  title: string;

  @ApiProperty({
    description: 'Краткое описание фильма',
    example: 'Фильм о гангстерах в Лос-Анджелесе.',
  })
  about: string;

  @ApiProperty({
    description: 'Полное описание фильма',
    example:
      'Двое бандитов Винсент Вега и Джулс Винфилд ведут философские беседы в перерывах между разборками и решением проблем с должниками криминального босса Марселласа Уоллеса.',
  })
  description: string;

  @ApiProperty({
    description: 'Продолжительность фильма в минутах',
    example: 154,
  })
  duration: number;

  @ApiProperty({ description: 'Жанр фильма', example: 'Драма' })
  genre: string;

  @ApiProperty({
    description: 'Расписание сеансов',
    type: () => [SessionDto],
    required: false,
  })
  schedule?: SessionDto[];
}
