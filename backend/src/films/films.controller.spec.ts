import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { MovieDto, SessionDto } from './films.dto';
import { NotFoundException } from '@nestjs/common';

// Моковые данные для сеансов
const MOCK_SESSIONS: SessionDto[] = [
  {
    id: 'session-1',
    daytime: '2024-03-28T20:00:00Z',
    hall: 1,
    rows: 10,
    seats: 10,
    price: 500,
    taken: [],
  },
];

// Моковые данные для фильмов
const MOCK_FILMS: MovieDto[] = [
  {
    id: '1',
    title: 'Тестовый фильм',
    rating: 8.5,
    director: 'Тестовый режиссер',
    duration: 120,
    genre: 'Драма',
    tags: ['Драма'],
    image: 'test-image.jpg',
    cover: 'test-cover.jpg',
    about: 'Описание тестового фильма',
    description: 'Детальное описание',
    schedule: MOCK_SESSIONS,
  },
];

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: {
            findAll: jest.fn(),
            getScheduleByFilmId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать обернутый в ApiListResponse список фильмов', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue(MOCK_FILMS);

      const result = await controller.findAll();

      // Проверяем, что контроллер вернул правильную структуру
      expect(result).toEqual({
        total: MOCK_FILMS.length,
        items: MOCK_FILMS,
      });
      // Убедимся, что метод сервиса был вызван
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getScheduleByFilmId', () => {
    it('должен возвращать расписание для существующего фильма', async () => {
      const filmId = '1';
      jest
        .spyOn(service, 'getScheduleByFilmId')
        .mockResolvedValue(MOCK_SESSIONS);

      const result = await controller.getScheduleByFilmId(filmId);

      // Проверяем, что контроллер вернул правильную структуру
      expect(result).toEqual({
        total: MOCK_SESSIONS.length,
        items: MOCK_SESSIONS,
      });
      // Убедимся, что метод сервиса был вызван с правильным ID
      expect(service.getScheduleByFilmId).toHaveBeenCalledWith(filmId);
    });

    it('должен выбрасывать NotFoundException, если фильм не найден', async () => {
      const filmId = '999';
      const errorMessage = `Фильм с ID ${filmId} не найден`;
      // Настраиваем мок сервиса, чтобы он выбрасывал ошибку
      jest
        .spyOn(service, 'getScheduleByFilmId')
        .mockRejectedValue(new NotFoundException(errorMessage));

      // Проверяем, что вызов контроллера приводит к той же ошибке
      await expect(controller.getScheduleByFilmId(filmId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getScheduleByFilmId(filmId)).rejects.toThrow(
        errorMessage,
      );
      // Убедимся, что метод сервиса был вызван
      expect(service.getScheduleByFilmId).toHaveBeenCalledWith(filmId);
    });
  });
});
