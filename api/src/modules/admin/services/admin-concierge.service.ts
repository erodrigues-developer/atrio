import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { ConciergeMessage } from 'src/modules/concierge/entities/concierge-message.entity';
import { Stay } from 'src/modules/stays/entities/stay.entity';
import { Brackets, Repository } from 'typeorm';
import { AuditService } from './audit.service';

@Injectable()
export class AdminConciergeService {
  constructor(
    @InjectRepository(ConciergeMessage)
    private readonly messageRepository: Repository<ConciergeMessage>,
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
    private readonly auditService: AuditService,
  ) {}

  async listConversations(session: AdminSessionContext, query: { search?: string }) {
    const builder = this.stayRepository
      .createQueryBuilder('stay')
      .innerJoin('guests', 'guest', 'guest.public_id = stay.guest_id')
      .leftJoin('concierge_messages', 'message', 'message.stay_id = stay.public_id')
      .where('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .groupBy('stay.public_id')
      .addGroupBy('stay.room_number')
      .addGroupBy('guest.first_name')
      .addGroupBy('guest.last_name')
      .select([
        'stay.public_id AS "stayId"',
        'stay.room_number AS "roomNumber"',
        "CONCAT(guest.first_name, ' ', guest.last_name) AS \"guestName\"",
        'MAX(message.created_at) AS "lastMessageAt"',
        "COUNT(message.id) FILTER (WHERE message.sender = 'guest')::int AS \"guestMessageCount\"",
      ])
      .orderBy('"lastMessageAt"', 'DESC', 'NULLS LAST')
      .limit(100);

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('stay.room_number ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.first_name ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.last_name ILIKE :search', { search: `%${query.search}%` });
        }),
      );
    }

    const rows = await builder.getRawMany();
    return rows.map((row) => ({
      ...row,
      lastMessageAt: row.lastMessageAt ? new Date(row.lastMessageAt).toISOString() : null,
    }));
  }

  async listMessages(session: AdminSessionContext, stayId: string) {
    await this.assertStay(session, stayId);
    const messages = await this.messageRepository.find({
      where: { stayId },
      order: { createdAt: 'ASC' },
      take: 200,
    });

    return messages.map((message) => this.mapMessage(message));
  }

  async createHotelMessage(session: AdminSessionContext, stayId: string, input: { text: string }) {
    await this.assertStay(session, stayId);
    const message = new ConciergeMessage();
    message.publicId = buildResourceId('msg');
    message.stayId = stayId;
    message.sender = 'hotel';
    message.text = input.text;
    message.source = 'admin_reply';
    message.createdAt = new Date();

    const saved = await this.messageRepository.save(message);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'concierge.reply.create',
      resourceType: 'concierge_message',
      resourceId: saved.publicId,
      summary: `${session.email} replied to concierge conversation ${stayId}.`,
    });

    return this.mapMessage(saved);
  }

  private async assertStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.stayRepository.findOne({ where: { publicId: stayId, hotelId: session.hotelId } });

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }
  }

  private mapMessage(message: ConciergeMessage) {
    return {
      id: message.publicId,
      stayId: message.stayId,
      sender: message.sender,
      text: message.text,
      source: message.source,
      createdAt: message.createdAt.toISOString(),
    };
  }
}

