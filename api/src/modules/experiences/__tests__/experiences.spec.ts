import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ExperiencesController } from '../controllers/experiences.controller';
import { ExperienceRepository } from '../repositories/experience.repository';
import { ExperiencesService } from '../services/experiences.service';

describe('experiences module', () => {
  it('covers repository, service and controller', async () => {
    const collectionRepository = { find: jest.fn().mockResolvedValue([{ id: 'today', title: 'Today', description: 'Desc', featured: true }]), findOne: jest.fn().mockResolvedValue({ id: 'today', title: 'Today', description: 'Desc', featured: true }) };
    const collectionItemRepository = { find: jest.fn().mockResolvedValue([{ experience: { id: 'sunset-dinner', title: 'Sunset', description: 'Desc', category: 'Gastronomia', timeLabel: 'Hoje', priceLabel: 'Sob consulta', badge: 'Featured', imageUrl: 'url' } }]) };
    const experienceRepositoryInner = { findOne: jest.fn().mockResolvedValue({ id: 'sunset-dinner', title: 'Sunset', description: 'Desc', category: 'Gastronomia', timeLabel: 'Hoje', priceLabel: 'Sob consulta', badge: 'Featured', imageUrl: 'url', durationLabel: '2h', availabilityLabel: 'Hoje', locationLabel: 'Restaurante', locationDescription: 'Detalhes', included: ['Mesa'], policy: 'Policy' }) };
    const slotRepository = { find: jest.fn().mockResolvedValue([{ id: 'slot_001', date: '2026-06-13', dayLabel: 'Hoje', dateLabel: '13 jun', time: '18:30', startsAt: new Date('2026-06-13T21:30:00.000Z'), isAvailable: true }]), findOne: jest.fn(), save: jest.fn() };
    const repository = new ExperienceRepository(collectionRepository as never, collectionItemRepository as never, experienceRepositoryInner as never, slotRepository as never);

    expect((await repository.listCollections()).length).toBe(1);
    expect((await repository.listCollectionItems('today')).length).toBe(1);
    expect((await repository.findCollectionById('today'))?.id).toBe('today');
    expect((await repository.findExperienceById('sunset-dinner'))?.id).toBe('sunset-dinner');
    expect((await repository.listAvailability('sunset-dinner')).length).toBe(1);
    expect(await repository.findSlotById('slot_001')).toBeUndefined();
    await repository.saveSlot({ id: 'slot_001' } as never);
    expect(slotRepository.save).toHaveBeenCalled();

    const service = new ExperiencesService(repository);
    expect((await service.listCollections()).collections).toHaveLength(1);
    expect((await service.getCollection('today')).id).toBe('today');
    expect((await service.getExperience('sunset-dinner')).id).toBe('sunset-dinner');
    expect((await service.getAvailability('sunset-dinner')).days).toHaveLength(1);

    collectionRepository.findOne.mockResolvedValueOnce(null);
    await expect(service.getCollection('missing')).rejects.toBeInstanceOf(ApiException);
    experienceRepositoryInner.findOne.mockResolvedValueOnce(null);
    await expect(service.getExperience('missing')).rejects.toBeInstanceOf(ApiException);
    experienceRepositoryInner.findOne.mockResolvedValueOnce(null);
    await expect(service.getAvailability('missing')).rejects.toBeInstanceOf(ApiException);

    const controller = new ExperiencesController(service);
    await expect(controller.listCollections({})).resolves.toHaveProperty('collections');
    await expect(controller.getCollection('today', {})).resolves.toHaveProperty('id', 'today');
    await expect(controller.getExperience('sunset-dinner', {})).resolves.toHaveProperty('id', 'sunset-dinner');
    await expect(controller.getAvailability('sunset-dinner', {})).resolves.toHaveProperty('days');
  });
});
