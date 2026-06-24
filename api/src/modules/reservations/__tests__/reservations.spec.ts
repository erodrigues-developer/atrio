import 'reflect-metadata';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ReservationsController } from '../controllers/reservations.controller';
import { ReservationRepository } from '../repositories/reservation.repository';
import { ReservationsService } from '../services/reservations.service';

describe('reservations module', () => {
  it('covers repository, service and controller', async () => {
    const reservationRecord = { id: 'res_001', stayId: 'stay_001', experienceId: 'sunset-dinner', title: 'Sunset', status: 'requested', statusLabel: 'Solicitada', dateLabel: 'Hoje, 13 jun', timeLabel: '21:30', scheduledAt: new Date('2026-06-13T21:30:00.000Z'), locationLabel: 'Restaurante', priceLabel: 'Sob consulta', note: 'A equipe...', createdAt: new Date(), guestNote: null };
    const save = jest.fn().mockResolvedValue(reservationRecord);
    const find = jest.fn().mockResolvedValue([reservationRecord]);
    const findOne = jest.fn().mockResolvedValue(reservationRecord);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new ReservationRepository({ save, find, findOne, count } as never);

    await repository.create(reservationRecord as never);
    expect(save).toHaveBeenCalled();
    expect((await repository.listByStayId('stay_001')).length).toBe(1);
    expect((await repository.findById('stay_001', 'res_001'))?.id).toBe('res_001');
    expect(await repository.existsByStayAndSlot('stay_001', new Date('2026-06-13T21:30:00.000Z'))).toBe(false);

    const stayRepository = { findById: jest.fn().mockResolvedValue({ id: 'stay_001' }) };
    const experienceRepository = {
      findExperienceById: jest.fn().mockResolvedValue({ id: 'sunset-dinner', title: 'Sunset', locationLabel: 'Restaurante', priceLabel: 'Sob consulta' }),
      findSlotById: jest.fn().mockResolvedValue({ id: 'slot_001', experienceId: 'sunset-dinner', isAvailable: true }),
      saveSlot: jest.fn(),
    };
    const queueService = { publish: jest.fn() };
    const service = new ReservationsService(stayRepository as never, experienceRepository as never, repository, queueService as never);
    const session = { stayId: 'stay_001' };

    expect((await service.createReservation('stay_001', { experienceId: 'sunset-dinner', slotId: 'slot_001', scheduledAt: '2026-06-13T21:30:00.000Z' }, session as never)).id).toBeDefined();
    expect((await service.listReservations('stay_001', { status: 'active', limit: 20 }, session as never)).items).toHaveLength(1);
    expect((await service.listReservations('stay_001', { status: 'requested', limit: 20 }, session as never)).items).toHaveLength(1);
    expect((await service.getReservation('stay_001', 'res_001', session as never)).id).toBe('res_001');

    experienceRepository.findExperienceById.mockResolvedValueOnce(null);
    await expect(service.createReservation('stay_001', { experienceId: 'missing', slotId: 'slot_001', scheduledAt: '2026-06-13T21:30:00.000Z' }, session as never)).rejects.toBeInstanceOf(ApiException);
    experienceRepository.findExperienceById.mockResolvedValueOnce({ id: 'sunset-dinner', title: 'Sunset', locationLabel: null, priceLabel: 'Sob consulta' });
    experienceRepository.findSlotById.mockResolvedValueOnce({ id: 'slot_001', experienceId: 'another', isAvailable: true });
    await expect(service.createReservation('stay_001', { experienceId: 'sunset-dinner', slotId: 'slot_001', scheduledAt: '2026-06-13T21:30:00.000Z' }, session as never)).rejects.toBeInstanceOf(ApiException);
    experienceRepository.findExperienceById.mockResolvedValueOnce({ id: 'sunset-dinner', title: 'Sunset', locationLabel: 'Restaurante', priceLabel: 'Sob consulta' });
    experienceRepository.findSlotById.mockResolvedValueOnce({ id: 'slot_001', experienceId: 'sunset-dinner', isAvailable: false });
    await expect(service.createReservation('stay_001', { experienceId: 'sunset-dinner', slotId: 'slot_001', scheduledAt: '2026-06-13T21:30:00.000Z' }, session as never)).rejects.toBeInstanceOf(ApiException);
    experienceRepository.findSlotById.mockResolvedValueOnce({ id: 'slot_001', experienceId: 'sunset-dinner', isAvailable: true });
    count.mockResolvedValueOnce(1);
    await expect(service.createReservation('stay_001', { experienceId: 'sunset-dinner', slotId: 'slot_001', scheduledAt: '2026-06-13T21:30:00.000Z' }, session as never)).rejects.toBeInstanceOf(ApiException);
    await expect(service.listReservations('another', {}, session as never)).rejects.toBeInstanceOf(ApiException);
    stayRepository.findById.mockResolvedValueOnce(null);
    await expect(service.listReservations('stay_001', {}, session as never)).rejects.toBeInstanceOf(ApiException);
    findOne.mockResolvedValueOnce(null);
    await expect(service.getReservation('stay_001', 'missing', session as never)).rejects.toBeInstanceOf(ApiException);

    experienceRepository.findExperienceById.mockResolvedValue({ id: 'sunset-dinner', title: 'Sunset', locationLabel: 'Restaurante', priceLabel: 'Sob consulta' });
    experienceRepository.findSlotById.mockResolvedValue({ id: 'slot_001', experienceId: 'sunset-dinner', isAvailable: true });
    count.mockResolvedValue(0);
    const controller = new ReservationsController(service);
    await expect(controller.create('stay_001', { experienceId: 'sunset-dinner', slotId: 'slot_001', scheduledAt: '2026-06-13T21:30:00.000Z', partySize: 2 }, session as never)).resolves.toHaveProperty('id');
    await expect(controller.list('stay_001', {}, session as never)).resolves.toHaveProperty('items');
    await expect(controller.getById('stay_001', 'res_001', session as never)).resolves.toHaveProperty('id', 'res_001');
  });
});
