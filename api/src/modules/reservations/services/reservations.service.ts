import { Injectable } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { formatRelativeDateLabel, formatTime } from 'src/common/utils/date-label.util';
import { buildResourceId } from 'src/common/utils/id.util';
import { paginateItems } from 'src/common/utils/pagination.util';
import { ExperienceRepository } from 'src/modules/experiences/repositories/experience.repository';
import { QueueService } from 'src/modules/queues/services/queue.service';
import { StayRepository } from 'src/modules/stays/repositories/stay.repository';
import { Reservation } from '../entities/reservation.entity';
import { ReservationRepository } from '../repositories/reservation.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly stayRepository: StayRepository,
    private readonly experienceRepository: ExperienceRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly queueService: QueueService,
  ) {}

  async createReservation(
    stayId: string,
    input: { experienceId: string; slotId: string; scheduledAt: string; note?: string },
    session: AuthSessionContext,
  ) {
    await this.assertStay(stayId, session);
    const experience = await this.experienceRepository.findExperienceById(input.experienceId);
    const slot = await this.experienceRepository.findSlotById(input.slotId);

    if (!experience || !slot || slot.experienceId !== input.experienceId) {
      throw new ApiException(404, 'EXPERIENCE_SLOT_NOT_FOUND', 'Experience availability slot was not found.');
    }

    if (!slot.isAvailable) {
      throw new ApiException(409, 'SLOT_UNAVAILABLE', 'Requested slot is no longer available.');
    }

    if (await this.reservationRepository.existsByStayAndSlot(stayId, new Date(input.scheduledAt))) {
      throw new ApiException(409, 'DUPLICATE_RESERVATION', 'A reservation already exists for the selected time.');
    }

    const reservation = new Reservation();
    reservation.publicId = buildResourceId('res');
    reservation.stayId = stayId;
    reservation.experienceId = experience.publicId;
    reservation.title = experience.title;
    reservation.status = 'requested';
    reservation.statusLabel = 'Solicitada';
    reservation.scheduledAt = new Date(input.scheduledAt);
    reservation.dateLabel = formatRelativeDateLabel(reservation.scheduledAt);
    reservation.timeLabel = formatTime(reservation.scheduledAt);
    reservation.locationLabel = experience.locationLabel ?? 'Hotel';
    reservation.priceLabel = experience.priceLabel;
    reservation.note = 'A equipe do hotel irá confirmar os detalhes.';
    reservation.guestNote = input.note ?? null;
    reservation.createdAt = new Date();

    slot.isAvailable = false;

    await this.reservationRepository.create(reservation);
    await this.experienceRepository.saveSlot(slot);
    await this.queueService.publish('reservations.fifo', {
      event: 'reservation.created',
      reservationId: reservation.publicId,
      stayId,
    });

    return this.mapItem(reservation);
  }

  async listReservations(
    stayId: string,
    query: { status?: string; limit?: number; cursor?: string },
    session: AuthSessionContext,
  ) {
    await this.assertStay(stayId, session);
    const reservations = await this.reservationRepository.listByStayId(stayId);
    const filteredReservations = query.status
      ? reservations.filter((reservation) => {
          if (query.status === 'active') {
            return ['requested', 'confirmed', 'in_progress'].includes(reservation.status);
          }

          return reservation.status === query.status;
        })
      : reservations;

    return paginateItems(filteredReservations.map((reservation) => this.mapItem(reservation)), query.limit, query.cursor);
  }

  async getReservation(stayId: string, reservationId: string, session: AuthSessionContext) {
    await this.assertStay(stayId, session);
    const reservation = await this.reservationRepository.findById(stayId, reservationId);

    if (!reservation) {
      throw new ApiException(404, 'RESERVATION_NOT_FOUND', 'Reservation was not found.');
    }

    return this.mapItem(reservation);
  }

  private async assertStay(stayId: string, session: AuthSessionContext) {
    if (stayId !== session.stayId) {
      throw new ApiException(403, 'FORBIDDEN', 'Stay does not belong to the authenticated guest.');
    }

    const stay = await this.stayRepository.findById(stayId);

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }
  }

  private mapItem(reservation: Reservation) {
    return {
      id: reservation.publicId,
      stayId: reservation.stayId,
      experienceId: reservation.experienceId,
      title: reservation.title,
      status: reservation.status,
      statusLabel: reservation.statusLabel,
      dateLabel: reservation.dateLabel,
      timeLabel: reservation.timeLabel,
      scheduledAt: reservation.scheduledAt.toISOString(),
      locationLabel: reservation.locationLabel,
      priceLabel: reservation.priceLabel,
      note: reservation.note,
    };
  }
}
