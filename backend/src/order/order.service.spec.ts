import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { FilmsService } from '../films/films.service';
import { OrderDto } from './order.dto';
import { Schedule } from './order.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Моки для репозиториев и сервисов
const mockOrderRepository = {
  findSchedule: jest.fn(),
  updateTakenSeats: jest.fn(),
};

const mockFilmsService = {
  // Этот сервис не используется напрямую в createOrder, но он есть в зависимостях
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('должен создавать заказ и возвращать его элементы', async () => {
      // 1. Подготовка данных
      const orderDto: OrderDto = {
        email: 'test@example.com',
        phone: '+79998887766',
        tickets: [
          {
            film: 'film1',
            session: 'schedule1',
            row: 1,
            seat: 1,
            price: 300,
            daytime: new Date().toISOString(),
          },
        ],
      };

      const mockSchedule: Schedule = {
        id: 'schedule1',
        daytime: new Date(),
        hall: 1,
        rows: 10,
        seats: 10,
        price: 300,
        taken: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        film: null,
      };

      mockOrderRepository.findSchedule.mockResolvedValue(mockSchedule);
      mockOrderRepository.updateTakenSeats.mockResolvedValue(undefined);

      // 2. Вызов тестируемого метода
      const result = await service.createOrder(orderDto);

      // 3. Проверка результата
      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBeDefined(); // ID генерируется динамически
      expect(result.items[0].film).toBe('film1');
      expect(mockOrderRepository.findSchedule).toHaveBeenCalledWith(
        'film1',
        'schedule1',
      );
      expect(mockOrderRepository.updateTakenSeats).toHaveBeenCalledWith(
        'schedule1',
        ['1:1'],
      );
    });

    it('должен выбрасывать BadRequestException, если массив билетов пуст', async () => {
      const orderDto: OrderDto = {
        email: 'test@example.com',
        phone: '+79998887766',
        tickets: [],
      };

      await expect(service.createOrder(orderDto)).rejects.toThrow(
        new BadRequestException('Массив билетов не может быть пустым.'),
      );
    });

    it('должен выбрасывать NotFoundException, если сеанс не найден', async () => {
      const orderDto: OrderDto = {
        email: 'test@example.com',
        phone: '+79998887766',
        tickets: [{ film: 'film1', session: 'non-existent', row: 1, seat: 1 }],
      };

      mockOrderRepository.findSchedule.mockResolvedValue(null);

      await expect(service.createOrder(orderDto)).rejects.toThrow(
        new NotFoundException(
          `Сеанс с ID "non-existent" не найден для фильма "film1"`,
        ),
      );
    });
  });
});
