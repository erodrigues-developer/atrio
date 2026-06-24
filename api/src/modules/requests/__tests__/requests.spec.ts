import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { RequestsController } from '../controllers/requests.controller';
import { StayRequestRepository } from '../repositories/stay-request.repository';
import { RequestsService } from '../services/requests.service';

describe('requests module', () => {
  it('covers repository, service and controller', async () => {
    const save = jest.fn().mockResolvedValue({ id: 'req_001' });
    const find = jest.fn().mockResolvedValue([{ id: 'req_001', stayId: 'stay_001', serviceId: 'towels', type: 'towels', title: 'Toalhas extras', status: 'received', statusLabel: 'Recebido', quantity: 2, note: '', roomNumber: '304', createdAt: new Date('2026-06-13T17:20:00.000Z') }]);
    const findOne = jest.fn().mockResolvedValue({ id: 'req_001', stayId: 'stay_001', serviceId: 'towels', type: 'towels', title: 'Toalhas extras', status: 'received', statusLabel: 'Recebido', quantity: 2, note: '', roomNumber: '304', createdAt: new Date('2026-06-13T17:20:00.000Z') });
    const repository = new StayRequestRepository({ save, find, findOne } as never);

    await repository.create({ id: 'req_001' } as never);
    expect(save).toHaveBeenCalled();
    expect((await repository.listByStayId('stay_001')).length).toBe(1);
    expect((await repository.findById('stay_001', 'req_001'))?.id).toBe('req_001');

    const stayRepository = { findById: jest.fn().mockResolvedValue({ id: 'stay_001' }) };
    const serviceCatalogRepository = { findById: jest.fn().mockResolvedValue({ id: 'towels', title: 'Toalhas' }) };
    const queueService = { publish: jest.fn() };
    const service = new RequestsService(stayRepository as never, serviceCatalogRepository as never, repository, queueService as never);
    const session = { stayId: 'stay_001', roomNumber: '304' };

    expect((await service.createStayRequest('stay_001', { serviceId: 'towels', quantity: 2 }, session as never)).status).toBe('received');
    expect((await service.listStayRequests('stay_001', { status: 'active', limit: 20 }, session as never)).items).toHaveLength(1);
    expect((await service.listStayRequests('stay_001', { status: 'received', limit: 20 }, session as never)).items).toHaveLength(1);
    expect((await service.getStayRequest('stay_001', 'req_001', session as never)).id).toBe('req_001');

    serviceCatalogRepository.findById.mockResolvedValueOnce(null);
    await expect(service.createStayRequest('stay_001', { serviceId: 'missing' }, session as never)).rejects.toBeInstanceOf(ApiException);
    await expect(service.listStayRequests('another', {}, session as never)).rejects.toBeInstanceOf(ApiException);
    stayRepository.findById.mockResolvedValueOnce(null);
    await expect(service.listStayRequests('stay_001', {}, session as never)).rejects.toBeInstanceOf(ApiException);
    findOne.mockResolvedValueOnce(null);
    await expect(service.getStayRequest('stay_001', 'missing', session as never)).rejects.toBeInstanceOf(ApiException);

    const controller = new RequestsController(service);
    await expect(controller.create('stay_001', { serviceId: 'towels' }, session as never)).resolves.toHaveProperty('id');
    await expect(controller.list('stay_001', {}, session as never)).resolves.toHaveProperty('items');
    await expect(controller.getById('stay_001', 'req_001', session as never)).resolves.toHaveProperty('id', 'req_001');
  });
});
