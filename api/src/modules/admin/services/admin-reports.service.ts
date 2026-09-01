import { Injectable } from '@nestjs/common';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async staysCsv(session: AdminSessionContext, query: { status?: string; from?: string; to?: string }) {
    const builder = this.dataSource
      .createQueryBuilder()
      .from('stays', 'stay')
      .innerJoin('guests', 'guest', 'guest.public_id = stay.guest_id')
      .where('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .select([
        'stay.public_id AS id',
        'stay.room_number AS "roomNumber"',
        "CONCAT(guest.first_name, ' ', guest.last_name) AS \"guestName\"",
        'guest.phone_number AS "phoneNumber"',
        'stay.status AS status',
        'stay.check_in_date AS "checkInDate"',
        'stay.check_out_date AS "checkOutDate"',
        'stay.check_out_time AS "checkOutTime"',
      ])
      .orderBy('stay.check_in_date', 'DESC');

    if (query.status) builder.andWhere('stay.status = :status', { status: query.status });
    if (query.from) builder.andWhere('stay.check_in_date >= :from', { from: query.from });
    if (query.to) builder.andWhere('stay.check_in_date <= :to', { to: query.to });

    return this.toCsv(['id', 'roomNumber', 'guestName', 'phoneNumber', 'status', 'checkInDate', 'checkOutDate', 'checkOutTime'], await builder.getRawMany());
  }

  async requestsCsv(session: AdminSessionContext, query: { status?: string; from?: string; to?: string }) {
    const builder = this.dataSource
      .createQueryBuilder()
      .from('stay_requests', 'request')
      .innerJoin('stays', 'stay', 'stay.public_id = request.stay_id')
      .where('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .select([
        'request.public_id AS id',
        'request.title AS title',
        'request.status AS status',
        'request.quantity AS quantity',
        'request.room_number AS "roomNumber"',
        'request.note AS note',
        'request.internal_note AS "internalNote"',
        'request.created_at AS "createdAt"',
      ])
      .orderBy('request.created_at', 'DESC');

    if (query.status) builder.andWhere('request.status = :status', { status: query.status });
    if (query.from) builder.andWhere('request.created_at >= :from', { from: query.from });
    if (query.to) builder.andWhere('request.created_at <= :to', { to: query.to });

    return this.toCsv(['id', 'title', 'status', 'quantity', 'roomNumber', 'note', 'internalNote', 'createdAt'], await builder.getRawMany());
  }

  async reservationsCsv(session: AdminSessionContext, query: { status?: string; from?: string; to?: string }) {
    const builder = this.dataSource
      .createQueryBuilder()
      .from('reservations', 'reservation')
      .innerJoin('stays', 'stay', 'stay.public_id = reservation.stay_id')
      .innerJoin('guests', 'guest', 'guest.public_id = stay.guest_id')
      .where('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .select([
        'reservation.public_id AS id',
        'reservation.title AS title',
        'reservation.status AS status',
        'reservation.scheduled_at AS "scheduledAt"',
        'stay.room_number AS "roomNumber"',
        "CONCAT(guest.first_name, ' ', guest.last_name) AS \"guestName\"",
        'reservation.guest_note AS "guestNote"',
      ])
      .orderBy('reservation.scheduled_at', 'DESC');

    if (query.status) builder.andWhere('reservation.status = :status', { status: query.status });
    if (query.from) builder.andWhere('reservation.scheduled_at >= :from', { from: query.from });
    if (query.to) builder.andWhere('reservation.scheduled_at <= :to', { to: query.to });

    return this.toCsv(['id', 'title', 'status', 'scheduledAt', 'roomNumber', 'guestName', 'guestNote'], await builder.getRawMany());
  }

  private toCsv(headers: string[], rows: Array<Record<string, unknown>>) {
    return [
      headers.join(','),
      ...rows.map((row) => headers.map((header) => this.escapeCell(row[header])).join(',')),
    ].join('\n');
  }

  private escapeCell(value: unknown) {
    if (value === null || value === undefined) return '';
    const normalized = value instanceof Date ? value.toISOString() : String(value);
    return `"${normalized.replace(/"/g, '""')}"`;
  }
}

