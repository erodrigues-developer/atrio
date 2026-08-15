import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ConciergeController } from '../controllers/concierge.controller';
import { ConciergeMessageRepository } from '../repositories/concierge-message.repository';
import { ConciergeService } from '../services/concierge.service';

describe('concierge module', () => {
  it('covers repository, service and controller', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const find = jest.fn().mockResolvedValue([{ publicId: 'msg_001', stayId: 'stay_001', sender: 'hotel', text: 'Hello', createdAt: new Date('2026-06-13T18:00:00.000Z') }]);
    const findOne = jest.fn().mockResolvedValue({ publicId: 'msg_001', stayId: 'stay_001', sender: 'hotel', text: 'Hello', createdAt: new Date('2026-06-13T18:00:00.000Z') });
    const repository = new ConciergeMessageRepository({ save, find, findOne } as never);

    await repository.create({ id: 'msg_001' } as never);
    expect(save).toHaveBeenCalled();
    expect((await repository.listByStayId('stay_001', 50)).length).toBe(1);
    expect(
      (await repository.listByStayId(
        'stay_001',
        50,
        { createdAt: new Date('2026-06-13T18:05:00.000Z') } as never,
      )).length,
    ).toBe(1);
    expect((await repository.findById('msg_001'))?.publicId).toBe('msg_001');

    const stayRepository = { findById: jest.fn().mockResolvedValue({ id: 'stay_001' }) };
    const queueService = { publish: jest.fn() };
    const service = new ConciergeService(stayRepository as never, repository, queueService as never);
    const session = { stayId: 'stay_001' };

    expect((await service.listMessages('stay_001', { limit: 50 }, session as never)).messages).toHaveLength(1);
    expect((await service.createMessage('stay_001', { text: 'Oi' }, session as never)).reply.sender).toBe('hotel');
    await expect(service.listMessages('another', {}, session as never)).rejects.toBeInstanceOf(ApiException);

    const controller = new ConciergeController(service);
    await expect(controller.list('stay_001', {}, session as never)).resolves.toHaveProperty('messages');
    await expect(controller.create('stay_001', { text: 'Oi' }, session as never)).resolves.toHaveProperty('message');
  });
});
