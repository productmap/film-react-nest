import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderDto, OrderResultDto } from './order.dto';
import { BadRequestException } from '@nestjs/common';

interface ApiListResponse<T> {
  total: number;
  items: T[];
}

// Моковые данные для заказа
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
  ],
};

// Моковые данные для результата
const MOCK_ORDER_RESULT: ApiListResponse<OrderResultDto> = {
  total: 1,
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
  ],
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('контроллер должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('должен вызывать OrderService.createOrder и возвращать результат', async () => {
      jest.spyOn(service, 'createOrder').mockResolvedValue(MOCK_ORDER_RESULT);

      const result = await controller.createOrder(MOCK_ORDER_DTO);

      // Проверяем, что контроллер вернул результат работы сервиса
      expect(result).toEqual(MOCK_ORDER_RESULT);

      // Убедимся, что метод сервиса был вызван с правильными данными
      expect(service.createOrder).toHaveBeenCalledWith(MOCK_ORDER_DTO);
    });

    it('должен выбрасывать BadRequestException, если сервис его выбрасывает', async () => {
      const errorMessage = 'Место уже занято';
      // Настраиваем мок сервиса, чтобы он выбрасывал ошибку
      jest
        .spyOn(service, 'createOrder')
        .mockRejectedValue(new BadRequestException(errorMessage));

      // Проверяем, что вызов контроллера приводит к той же ошибке
      await expect(controller.createOrder(MOCK_ORDER_DTO)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.createOrder(MOCK_ORDER_DTO)).rejects.toThrow(
        errorMessage,
      );

      // Убедимся, что метод сервиса все равно был вызван
      expect(service.createOrder).toHaveBeenCalledWith(MOCK_ORDER_DTO);
    });
  });
});
