import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { formatShortDate } from 'src/common/utils/date-label.util';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { StayRepository } from '../repositories/stay.repository';

@Injectable()
export class StaysService {
  constructor(
    private readonly stayRepository: StayRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getStaySummary(stayId: string, session: AuthSessionContext) {
    this.assertStayAccess(stayId, session);
    const stay = await this.getRequiredStay(stayId);
    const usefulInfo = await this.stayRepository.listUsefulInfo(stayId, 'stay');
    const [{ count: requestsCountRaw }] = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM stay_requests WHERE stay_id = $1',
      [stayId],
    );
    const [{ count: reservationsCountRaw }] = await this.dataSource.query(
      'SELECT COUNT(*)::int AS count FROM reservations WHERE stay_id = $1',
      [stayId],
    );
    const requestsCount = Number(requestsCountRaw);
    const reservationsCount = Number(reservationsCountRaw);

    return {
      id: stay.publicId,
      hotelId: stay.hotelId,
      hotelName: stay.hotel.name,
      guestId: stay.guestId,
      roomNumber: stay.roomNumber,
      status: stay.status,
      statusLabel: stay.statusLabel,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      checkInLabel: formatShortDate(new Date(`${stay.checkInDate}T00:00:00.000Z`)),
      checkOutLabel: formatShortDate(new Date(`${stay.checkOutDate}T00:00:00.000Z`)),
      checkOutTime: stay.checkOutTime,
      summaries: {
        requests: `${requestsCount} em andamento`,
        reservations: `${reservationsCount} solicitada`,
      },
      usefulInfo: usefulInfo.map((item) => ({
        id: item.publicId,
        title: item.title,
        description: item.description,
      })),
    };
  }

  async getDashboard(stayId: string, session: AuthSessionContext) {
    this.assertStayAccess(stayId, session);
    const stay = await this.getRequiredStay(stayId);
    const usefulInfo = await this.stayRepository.listUsefulInfo(stayId, 'dashboard');
    const requests = await this.dataSource.query(
      `SELECT public_id AS id, title, status, status_label AS "statusLabel", quantity, room_number AS "roomNumber", created_at AS "createdAt"
       FROM stay_requests WHERE stay_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [stayId],
    );
    const reservations = await this.dataSource.query(
      `SELECT public_id AS id, experience_id AS "experienceId", title, status, status_label AS "statusLabel", scheduled_at AS "scheduledAt", date_label AS "dateLabel", time_label AS "timeLabel"
       FROM reservations WHERE stay_id = $1 ORDER BY scheduled_at ASC LIMIT 3`,
      [stayId],
    );
    const featuredExperience = await this.dataSource.query(
      `SELECT e.public_id AS id, e.title, e.description, e.badge, e.category, e.time_label AS "timeLabel", e.price_label AS "priceLabel", e.image_url AS "imageUrl"
       FROM experiences e
       INNER JOIN experience_collection_items eci ON eci.experience_id = e.public_id
       INNER JOIN experience_collections c ON c.public_id = eci.collection_id
       WHERE c.featured = true
       ORDER BY eci.position ASC
       LIMIT 1`,
    );

    return {
      stay: {
        hotelName: stay.hotel.name,
        roomNumber: stay.roomNumber,
        checkOutTime: stay.checkOutTime,
      },
      featuredExperience: featuredExperience[0],
      requests,
      reservations,
      usefulInfo: usefulInfo.map((item) => ({
        id: item.publicId,
        title: item.title,
        description: item.description,
      })),
    };
  }

  async getWifi(stayId: string, session: AuthSessionContext) {
    this.assertStayAccess(stayId, session);
    const stay = await this.getRequiredStay(stayId);

    return {
      network: stay.wifiNetwork,
      password: stay.wifiPassword,
      updatedAt: new Date().toISOString(),
    };
  }

  async getConsumption(stayId: string, session: AuthSessionContext) {
    this.assertStayAccess(stayId, session);
    const stay = await this.getRequiredStay(stayId);
    const items = stay.consumptionEnabled
      ? await this.stayRepository.listConsumptionItems(stayId)
      : [];
    const totalAmountCents = items.reduce((total, item) => total + item.amountCents, 0);
    const latestOccurrence = items[0]?.occurredAt ?? new Date();

    return {
      enabled: stay.consumptionEnabled,
      view: stay.consumptionView,
      currency: 'BRL',
      totalAmountCents,
      updatedAt: latestOccurrence.toISOString(),
      items: items.map((item) => ({
        id: item.publicId,
        title: item.title,
        description: item.description,
        category: item.category,
        icon: item.icon,
        amountCents: item.amountCents,
        currency: item.currency,
        occurredAt: item.occurredAt.toISOString(),
      })),
      emptyState: {
        title: 'Nenhum consumo registrado.',
        description: 'Quando houver lançamentos vinculados à sua hospedagem, eles aparecerão aqui.',
      },
      unavailableState: {
        title: 'Consumo indisponível no momento.',
        description: 'Não foi possível carregar os lançamentos da estadia.',
        actionLabel: 'Falar com o concierge',
      },
    };
  }

  private async getRequiredStay(stayId: string) {
    const stay = await this.stayRepository.findById(stayId);

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }

    return stay;
  }

  private assertStayAccess(stayId: string, session: AuthSessionContext): void {
    if (session.stayId !== stayId) {
      throw new ApiException(403, 'FORBIDDEN', 'Stay does not belong to the authenticated guest.');
    }
  }
}
