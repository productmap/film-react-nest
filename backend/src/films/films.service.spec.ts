import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { FilmsRepository } from './films.repository';
import { Film } from './films.entity';
import { NotFoundException } from '@nestjs/common';

// Мок для FilmsRepository
const mockFilmsRepository = {
  findAll: jest.fn(),
  findFilmById: jest.fn(),
  countFilms: jest.fn(),
  seed: jest.fn(),
};

describe('FilmsService', () => {
  let service: FilmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        {
          provide: FilmsRepository,
          useValue: mockFilmsRepository,
        },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
  });

  // Сбрасываем моки перед каждым тестом
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('должен возвращать массив фильмов', async () => {
      // 1. Подготовка данных
      const mockFilms: Film[] = [
        { id: '1', title: 'Film 1' },
        { id: '2', title: 'Film 2' },
      ] as Film[];

      // 2. Настройка мока
      mockFilmsRepository.findAll.mockResolvedValue(mockFilms);

      // 3. Вызов тестируемого метода
      const result = await service.findAll();

      // 4. Проверка результата
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Film 1');
      expect(result[1].id).toBe('2');
      expect(result[1].title).toBe('Film 2');
      // Убедимся, что метод репозитория был вызван
      expect(mockFilmsRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getScheduleByFilmId', () => {
    it('должен возвращать массив расписаний для валидного ID фильма', async () => {
      const filmId = '1';
      const mockFilmWithSchedule = {
        id: filmId,
        title: 'Film 1',
        schedules: [
          {
            id: 's1',
            daytime: new Date().toISOString(),
            hall: 'Hall 1',
          },
        ],
      };

      mockFilmsRepository.findFilmById.mockResolvedValue(mockFilmWithSchedule);

      const result = await service.getScheduleByFilmId(filmId);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('s1');
      expect(mockFilmsRepository.findFilmById).toHaveBeenCalledWith(filmId);
    });

    it('должен выбрасывать NotFoundException для невалидного ID фильма', async () => {
      const filmId = 'invalid-id';
      mockFilmsRepository.findFilmById.mockResolvedValue(null);

      await expect(service.getScheduleByFilmId(filmId)).rejects.toThrow(
        new NotFoundException(`Фильм с ID ${filmId} не найден`),
      );
      expect(mockFilmsRepository.findFilmById).toHaveBeenCalledWith(filmId);
    });
  });

  describe('countFilms', () => {
    it('должен возвращать количество фильмов', async () => {
      const count = 5;
      mockFilmsRepository.countFilms.mockResolvedValue(count);

      const result = await service.countFilms();

      expect(result).toBe(count);
      expect(mockFilmsRepository.countFilms).toHaveBeenCalledTimes(1);
    });
  });

  describe('seedDatabase', () => {
    it('должен вызывать repository.seed, когда нет фильмов', async () => {
      mockFilmsRepository.countFilms.mockResolvedValue(0);
      mockFilmsRepository.seed.mockResolvedValue(undefined);

      await service.seedDatabase();

      expect(mockFilmsRepository.countFilms).toHaveBeenCalledTimes(1);
      expect(mockFilmsRepository.seed).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать repository.seed, когда есть фильмы', async () => {
      mockFilmsRepository.countFilms.mockResolvedValue(10);

      await service.seedDatabase();

      expect(mockFilmsRepository.countFilms).toHaveBeenCalledTimes(1);
      expect(mockFilmsRepository.seed).not.toHaveBeenCalled();
    });
  });
});
