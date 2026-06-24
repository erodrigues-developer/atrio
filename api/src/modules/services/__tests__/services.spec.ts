import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ServicesController } from '../controllers/services.controller';
import { ServiceCatalogRepository } from '../repositories/service-catalog.repository';
import { ServiceCatalogService } from '../services/service-catalog.service';

describe('services catalog module', () => {
  it('covers repository, service and controller', async () => {
    const list = jest.fn().mockResolvedValue([{ id: 'towels', title: 'Toalhas', description: 'Desc', icon: 'Bath', requestSchema: { fields: [] }, fulfillmentType: 'hotel_staff' }]);
    const findOne = jest.fn().mockResolvedValue({ id: 'towels', title: 'Toalhas', description: 'Desc', icon: 'Bath', requestSchema: { fields: [] }, fulfillmentType: 'hotel_staff' });
    const repository = new ServiceCatalogRepository({ find: list, findOne } as never);

    expect((await repository.list())[0].id).toBe('towels');
    expect((await repository.findById('towels'))?.id).toBe('towels');

    const service = new ServiceCatalogService(repository);
    expect((await service.listServices()).items).toHaveLength(1);
    expect((await service.getService('towels')).id).toBe('towels');

    findOne.mockResolvedValueOnce(null);
    await expect(service.getService('missing')).rejects.toBeInstanceOf(ApiException);

    const controller = new ServicesController(service);
    await expect(controller.listServices({})).resolves.toHaveProperty('items');
    await expect(controller.getService('towels', {})).resolves.toHaveProperty('id', 'towels');
  });
});
