import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { StaysController } from '../controllers/stays.controller';
import { StayRepository } from '../repositories/stay.repository';
import { StaysService } from '../services/stays.service';

describe('stays module', () => {
  const stay = {
    publicId: 'stay_001',
    hotelId: 'copacabana-palace',
    guestId: 'guest_001',
    roomNumber: '304',
    status: 'active',
    statusLabel: 'Hospedagem ativa',
    checkInDate: '2026-06-10',
    checkOutDate: '2026-06-15',
    checkOutTime: '12:00',
    wifiNetwork: 'network',
    wifiPassword: 'password',
    consumptionEnabled: true,
    consumptionView: 'ready',
    hotel: { name: 'Copacabana Palace' },
    guest: { firstName: 'Everton', lastName: 'Rodrigues' },
  };

  it('covers the stay repository', async () => {
    const queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(stay),
    };
    const findOne = jest.fn().mockResolvedValue(stay);
    const find = jest.fn().mockResolvedValue([{ publicId: 'info' }]);
    const repository = new StayRepository(
      { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder), findOne } as never,
      { find } as never,
      { find } as never,
    );

    expect(await repository.findByHotelRoomAndLastName('h', '1', 'l')).toBe(stay);
    expect(await repository.findById('stay_001')).toBe(stay);
    expect(await repository.listUsefulInfo('stay_001', 'stay')).toEqual([{ publicId: 'info' }]);
    expect(await repository.listConsumptionItems('stay_001')).toEqual([{ publicId: 'info' }]);
  });

  it('covers stay service flows and controller delegation', async () => {
    const stayRepository = {
      findById: jest.fn().mockResolvedValue(stay),
      listUsefulInfo: jest.fn().mockResolvedValue([{ publicId: 'wifi', title: 'Wi-Fi', description: 'Desc' }]),
      listConsumptionItems: jest.fn().mockResolvedValue([
        {
          publicId: 'cons_001',
          title: 'Room service',
          description: 'Pedido',
          category: 'food',
          icon: 'utensils',
          amountCents: 100,
          currency: 'BRL',
          occurredAt: new Date('2026-06-13T17:20:00.000Z'),
        },
      ]),
    };
    const dataSource = {
      query: jest.fn((sql: string) => {
        if (sql.includes('COUNT(*)::int AS count FROM stay_requests')) {
          return Promise.resolve([{ count: 1 }]);
        }
        if (sql.includes('COUNT(*)::int AS count FROM reservations')) {
          return Promise.resolve([{ count: 1 }]);
        }
        if (sql.includes('FROM stay_requests WHERE')) {
          return Promise.resolve([{ id: 'req_001' }]);
        }
        if (sql.includes('FROM reservations WHERE')) {
          return Promise.resolve([{ id: 'res_001' }]);
        }

        return Promise.resolve([{ id: 'sunset-dinner', title: 'Sunset' }]);
      }),
    };
    const service = new StaysService(stayRepository as never, dataSource as never);
    const session = {
      stayId: 'stay_001',
      guestId: 'guest_001',
      guestName: 'Everton Rodrigues',
      hotelId: 'copacabana-palace',
      roomNumber: '304',
      sessionId: 'session_001',
      accessToken: 'token',
    };

    expect((await service.getStaySummary('stay_001', session as never)).id).toBe('stay_001');
    expect((await service.getDashboard('stay_001', session as never)).featuredExperience.id).toBe('sunset-dinner');
    expect((await service.getWifi('stay_001', session as never)).network).toBe('network');
    expect((await service.getConsumption('stay_001', session as never)).totalAmountCents).toBe(100);
    stayRepository.findById.mockResolvedValueOnce({ ...stay, consumptionEnabled: false });
    expect((await service.getConsumption('stay_001', session as never)).items).toHaveLength(0);

    await expect(service.getStaySummary('another', session as never)).rejects.toBeInstanceOf(ApiException);
    stayRepository.findById.mockResolvedValueOnce(null);
    await expect(service.getWifi('stay_001', session as never)).rejects.toBeInstanceOf(ApiException);
    stayRepository.findById.mockResolvedValue(stay);

    const controller = new StaysController(service);
    await expect(controller.getStay('stay_001', session as never)).resolves.toHaveProperty('id', 'stay_001');
    await expect(controller.getDashboard('stay_001', session as never)).resolves.toHaveProperty('requests');
    await expect(controller.getWifi('stay_001', session as never)).resolves.toHaveProperty('password', 'password');
    await expect(controller.getConsumption('stay_001', session as never)).resolves.toHaveProperty('items');
  });
});
