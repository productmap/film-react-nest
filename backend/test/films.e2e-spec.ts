import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { FilmsService } from '../src/films/films.service';
import { MovieDto } from '../src/films/films.dto';

describe('Эндпоинты фильмов (e2e)', () => {
  let app: INestApplication;
  let filmsService: FilmsService;

  // Моковые данные для тестирования
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
      schedule: [
        {
          id: '1',
          daytime: '2024-03-28T20:00:00',
          hall: 1,
          rows: 10,
          seats: 10,
          price: 500,
          taken: [],
        },
      ],
    },
    {
      id: '2',
      title: 'Фильм без расписания',
      rating: 7.0,
      director: 'Другой режиссер',
      duration: 90,
      genre: 'Комедия',
      tags: ['Комедия'],
      image: 'image.jpg',
      cover: 'cover.jpg',
      about: 'about text',
      description: 'description text',
      schedule: [], // У этого фильма нет расписания
    },
  ];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    filmsService = moduleFixture.get<FilmsService>(FilmsService);

    jest.spyOn(filmsService, 'findAll').mockResolvedValue(MOCK_FILMS);

    jest
      .spyOn(filmsService, 'getScheduleByFilmId')
      .mockImplementation(async (id: string | number) => {
        const film = MOCK_FILMS.find((f) => f.id == id);
        if (!film) {
          throw new NotFoundException(`Фильм с id ${id} не найден`);
        }
        return film.schedule;
      });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/films (GET)', () => {
    it('должен возвращать список фильмов', async () => {
      const response = await request(app.getHttpServer())
        .get('/films')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.total).toBe(2);
      expect(response.body.items).toBeInstanceOf(Array);
    });
  });

  describe('/films/:id/schedule (GET)', () => {
    it('должен возвращать расписание фильма', async () => {
      const response = await request(app.getHttpServer())
        .get('/films/1/schedule') // Исправленный путь
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.total).toBe(1);
      expect(response.body.items).toBeInstanceOf(Array);

      const session = response.body.items[0];
      expect(session).toHaveProperty('id', '1');
    });

    it('должен возвращать 200 и пустой массив для фильма без расписания', async () => {
      const response = await request(app.getHttpServer())
        .get('/films/2/schedule') // Тест-кейс для исправленной логики контроллера
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.total).toBe(0);
      expect(response.body.items).toEqual([]);
    });

    it('должен возвращать 404 для несуществующего фильма', async () => {
      await request(app.getHttpServer()).get('/films/999/schedule').expect(404);
    });
  });
});
