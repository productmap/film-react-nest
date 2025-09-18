import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { OrderService } from '../src/order/order.service';
import { OrderDto } from '../src/order/order.dto';

describe('Эндпоинты заказов (e2e)', () => {
  let app: INestApplication;
  let orderService: OrderService;

  const MOCK_ORDER_DTO: OrderDto = {
    email: 'test@example.com',
    phone: '+79991234567',
    tickets: [
      {
        film: 'film-id-1',
        session: 'session-id-1',
        row: 5,
        seat: 10,
      },
      {
        film: 'film-id-1',
        session: 'session-id-1',
        row: 5,
        seat: 11,
      },
    ],
  };

  const MOCK_ORDER_RESULT = {
    total: 2,
    items: [
      {
        id: 'ticket-id-1',
        film: 'film-id-1',
        session: 'session-id-1',
        daytime: '2024-07-26T19:00:00',
        row: 5,
        seat: 10,
        price: 500,
      },
      {
        id: 'ticket-id-2',
        film: 'film-id-1',
        session: 'session-id-1',
        daytime: '2024-07-26T19:00:00',
        row: 5,
        seat: 11,
        price: 500,
      },
    ],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OrderService)
      .useValue({ createOrder: jest.fn() })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    orderService = moduleFixture.get<OrderService>(OrderService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/order (POST)', () => {
    it('должен успешно создавать заказ', async () => {
      (orderService.createOrder as jest.Mock).mockResolvedValue(
        MOCK_ORDER_RESULT,
      );

      const response = await request(app.getHttpServer())
        .post('/order')
        .send(MOCK_ORDER_DTO)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.total).toBe(2);
      expect(response.body.items[0].id).toBe('ticket-id-1');
      expect(response.body.items.length).toBe(MOCK_ORDER_DTO.tickets.length);
    });

    it('должен возвращать 400 при отсутствии email', async () => {
      const { email, ...invalidOrder } = MOCK_ORDER_DTO;
      await request(app.getHttpServer())
        .post('/order')
        .send({ email, invalidOrder })
        .expect(400);
    });

    it('должен возвращать 400 для пустого массива билетов', async () => {
      const invalidOrder = { ...MOCK_ORDER_DTO, tickets: [] };
      await request(app.getHttpServer())
        .post('/order')
        .send(invalidOrder)
        .expect(400);
    });

    it('должен возвращать 400 для неверного формата билета (отсутствует место)', async () => {
      const invalidOrder = {
        ...MOCK_ORDER_DTO,
        tickets: [{ film: '1', session: '1', row: 1 }],
      } as any;
      await request(app.getHttpServer())
        .post('/order')
        .send(invalidOrder)
        .expect(400);
    });
  });
});
