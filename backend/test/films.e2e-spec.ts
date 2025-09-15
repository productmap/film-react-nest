import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { FilmsService } from './../src/films/films.service';
import { MovieDto, SessionDto } from './../src/films/films.dto';

// Мок для FilmsService
const mockFilmsService = {
  findAll: jest.fn(),
  getScheduleByFilmId: jest.fn(),
};

describe('FilmsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FilmsService)
      .useValue(mockFilmsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('/films (GET)', () => {
    it('should return an array of films', async () => {
      const mockFilms: MovieDto[] = [
        { id: '1', title: 'Film 1' },
        { id: '2', title: 'Film 2' },
      ];
      mockFilmsService.findAll.mockResolvedValue(mockFilms);

      const response = await request(app.getHttpServer()).get('/films');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ total: 2, items: mockFilms });
      expect(mockFilmsService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('/films/:id/schedule (GET)', () => {
    it('should return a schedule for a valid film ID', async () => {
      const filmId = '1';
      const mockSchedule: SessionDto[] = [
        { id: 's1', daytime: new Date().toISOString(), hall: 'Hall 1' },
      ];
      mockFilmsService.getScheduleByFilmId.mockResolvedValue(mockSchedule);

      const response = await request(app.getHttpServer()).get(
        `/films/${filmId}/schedule`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ total: 1, items: mockSchedule });
      expect(mockFilmsService.getScheduleByFilmId).toHaveBeenCalledWith(filmId);
    });

    it('should return 404 if no schedule is found', async () => {
      const filmId = 'non-existent-id';
      mockFilmsService.getScheduleByFilmId.mockResolvedValue([]); // Сервис возвращает пустой массив

      const response = await request(app.getHttpServer()).get(
        `/films/${filmId}/schedule`,
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toContain(
        `Schedule for film with ID "${filmId}" not found`,
      );
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
