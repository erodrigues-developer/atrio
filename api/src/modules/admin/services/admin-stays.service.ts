import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { GuestSession } from 'src/modules/auth/entities/guest-session.entity';
import { ConsumptionItem } from 'src/modules/stays/entities/consumption-item.entity';
import { Guest } from 'src/modules/stays/entities/guest.entity';
import { Stay } from 'src/modules/stays/entities/stay.entity';
import { StayUsefulInfo } from 'src/modules/stays/entities/stay-useful-info.entity';
import { Brackets, ILike, IsNull, MoreThan, Repository } from 'typeorm';
import {
  CreateAdminConsumptionItemDto,
  CreateAdminGuestDto,
  CreateAdminStayDto,
  CreateAdminStayUsefulInfoDto,
  UpdateAdminStayWifiDto,
} from '../dto/admin-stays.dto';
import { AuditService } from './audit.service';

@Injectable()
export class AdminStaysService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
    @InjectRepository(GuestSession)
    private readonly guestSessionRepository: Repository<GuestSession>,
    @InjectRepository(StayUsefulInfo)
    private readonly usefulInfoRepository: Repository<StayUsefulInfo>,
    @InjectRepository(ConsumptionItem)
    private readonly consumptionItemRepository: Repository<ConsumptionItem>,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  async listGuests(session: AdminSessionContext, search?: string) {
    const where = search
      ? [
          { firstName: ILike(`%${search}%`) },
          { lastName: ILike(`%${search}%`) },
          { phoneNumber: ILike(`%${search}%`) },
        ]
      : {};
    const guests = await this.guestRepository.find({
      where,
      order: { lastName: 'ASC', firstName: 'ASC' },
      take: 50,
    });

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'guests.list',
      resourceType: 'guest',
      summary: `${session.email} listed guests.`,
    });

    return guests.map((guest) => this.mapGuest(guest));
  }

  async createGuest(session: AdminSessionContext, input: CreateAdminGuestDto) {
    const guest = await this.createGuestEntity(input);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'guest.create',
      resourceType: 'guest',
      resourceId: guest.publicId,
      summary: `${session.email} created guest ${guest.firstName} ${guest.lastName}.`,
    });

    return this.mapGuest(guest);
  }

  async listStays(session: AdminSessionContext, query: { search?: string; status?: string }) {
    const builder = this.stayRepository
      .createQueryBuilder('stay')
      .leftJoinAndSelect('stay.guest', 'guest')
      .where('stay.hotelId = :hotelId', { hotelId: session.hotelId })
      .orderBy('stay.checkInDate', 'DESC')
      .addOrderBy('stay.roomNumber', 'ASC')
      .limit(80);

    if (query.status) {
      builder.andWhere('stay.status = :status', { status: query.status });
    }

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('stay.roomNumber ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.firstName ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.lastName ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.phoneNumber ILIKE :search', { search: `%${query.search}%` });
        }),
      );
    }

    const stays = await builder.getMany();

    return Promise.all(stays.map((stay) => this.mapStay(stay)));
  }

  async getStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.getRequiredStay(session, stayId);
    return this.mapStay(stay);
  }

  async createStay(session: AdminSessionContext, input: CreateAdminStayDto) {
    const guest = await this.resolveGuest(input);
    const stay = new Stay();
    stay.publicId = buildResourceId('stay');
    stay.hotelId = session.hotelId;
    stay.guestId = guest.publicId;
    stay.roomNumber = input.roomNumber;
    stay.status = input.status;
    stay.statusLabel = this.statusLabel(input.status);
    stay.checkInDate = input.checkInDate;
    stay.checkOutDate = input.checkOutDate;
    stay.checkOutTime = input.checkOutTime;
    stay.wifiNetwork = input.wifiNetwork;
    stay.wifiPassword = input.wifiPassword;
    stay.consumptionEnabled = input.consumptionEnabled;
    stay.consumptionView = input.consumptionView;

    const savedStay = await this.stayRepository.save(stay);
    savedStay.guest = guest;

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.create',
      resourceType: 'stay',
      resourceId: savedStay.publicId,
      summary: `${session.email} created stay ${savedStay.publicId} for room ${savedStay.roomNumber}.`,
    });

    return this.mapStay(savedStay);
  }

  async resendAccess(session: AdminSessionContext, stayId: string) {
    await this.getRequiredStay(session, stayId);
    const challenge = await this.authService.createStayAccessChallengeForStay(stayId);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.access.resend',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} resent app access for ${stayId}.`,
    });

    return challenge;
  }

  async revokeGuestSessions(session: AdminSessionContext, stayId: string) {
    await this.getRequiredStay(session, stayId);
    const result = await this.guestSessionRepository.update(
      { stayId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      { revokedAt: new Date() },
    );

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.sessions.revoke',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} revoked guest sessions for ${stayId}.`,
      metadata: { affected: result.affected ?? 0 },
    });

    return { revokedSessions: result.affected ?? 0 };
  }

  async updateWifi(session: AdminSessionContext, stayId: string, input: UpdateAdminStayWifiDto) {
    const stay = await this.getRequiredStay(session, stayId);
    stay.wifiNetwork = input.wifiNetwork;
    stay.wifiPassword = input.wifiPassword;

    const savedStay = await this.stayRepository.save(stay);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.wifi.update',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} updated Wi-Fi for ${stayId}.`,
    });

    return this.mapStay(savedStay);
  }

  async listUsefulInfo(session: AdminSessionContext, stayId: string) {
    await this.getRequiredStay(session, stayId);
    const items = await this.usefulInfoRepository.find({
      where: { stayId },
      order: { scope: 'ASC', position: 'ASC' },
    });

    return items.map((item) => ({
      id: item.publicId,
      scope: item.scope,
      title: item.title,
      description: item.description,
      position: item.position,
    }));
  }

  async createUsefulInfo(session: AdminSessionContext, stayId: string, input: CreateAdminStayUsefulInfoDto) {
    await this.getRequiredStay(session, stayId);
    const item = new StayUsefulInfo();
    item.publicId = buildResourceId('info');
    item.stayId = stayId;
    item.scope = input.scope;
    item.title = input.title;
    item.description = input.description;
    item.position = input.position;

    const savedItem = await this.usefulInfoRepository.save(item);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.useful_info.create',
      resourceType: 'stay_useful_info',
      resourceId: savedItem.publicId,
      summary: `${session.email} created useful info for ${stayId}.`,
    });

    return {
      id: savedItem.publicId,
      scope: savedItem.scope,
      title: savedItem.title,
      description: savedItem.description,
      position: savedItem.position,
    };
  }

  async listConsumption(session: AdminSessionContext, stayId: string) {
    await this.getRequiredStay(session, stayId);
    const items = await this.consumptionItemRepository.find({
      where: { stayId },
      order: { occurredAt: 'DESC' },
    });

    return items.map((item) => this.mapConsumptionItem(item));
  }

  async createConsumption(session: AdminSessionContext, stayId: string, input: CreateAdminConsumptionItemDto) {
    await this.getRequiredStay(session, stayId);
    const item = new ConsumptionItem();
    item.publicId = buildResourceId('cons');
    item.stayId = stayId;
    item.title = input.title;
    item.description = input.description;
    item.category = input.category;
    item.icon = input.icon;
    item.amountCents = input.amountCents;
    item.currency = input.currency;
    item.occurredAt = new Date(input.occurredAt);

    const savedItem = await this.consumptionItemRepository.save(item);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.consumption.create',
      resourceType: 'consumption_item',
      resourceId: savedItem.publicId,
      summary: `${session.email} created consumption item for ${stayId}.`,
      metadata: { amountCents: savedItem.amountCents, currency: savedItem.currency },
    });

    return this.mapConsumptionItem(savedItem);
  }

  private async resolveGuest(input: CreateAdminStayDto) {
    if (input.guestId) {
      const guest = await this.guestRepository.findOne({ where: { publicId: input.guestId } });

      if (!guest) {
        throw new ApiException(404, 'GUEST_NOT_FOUND', 'Guest was not found.');
      }

      return guest;
    }

    if (input.guest) {
      return this.createGuestEntity(input.guest);
    }

    throw new ApiException(400, 'GUEST_REQUIRED', 'Provide an existing guest or guest data.');
  }

  private async createGuestEntity(input: CreateAdminGuestDto) {
    const guest = new Guest();
    guest.publicId = buildResourceId('guest');
    guest.firstName = input.firstName.trim();
    guest.lastName = input.lastName.trim();
    guest.phoneNumber = this.normalizePhone(input.phoneNumber);
    guest.maskedPhone = this.maskPhone(guest.phoneNumber);

    return this.guestRepository.save(guest);
  }

  private async getRequiredStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.stayRepository.findOne({
      where: { publicId: stayId, hotelId: session.hotelId },
      relations: { guest: true },
    });

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }

    return stay;
  }

  private async mapStay(stay: Stay) {
    const activeGuestSessions = await this.guestSessionRepository.count({
      where: { stayId: stay.publicId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });

    return {
      id: stay.publicId,
      hotelId: stay.hotelId,
      roomNumber: stay.roomNumber,
      status: stay.status,
      statusLabel: stay.statusLabel,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      checkOutTime: stay.checkOutTime,
      wifiNetwork: stay.wifiNetwork,
      wifiPassword: stay.wifiPassword,
      consumptionEnabled: stay.consumptionEnabled,
      consumptionView: stay.consumptionView,
      guest: this.mapGuest(stay.guest),
      activeGuestSessions,
    };
  }

  private mapGuest(guest: Guest) {
    return {
      id: guest.publicId,
      firstName: guest.firstName,
      lastName: guest.lastName,
      phoneNumber: guest.phoneNumber,
      maskedPhone: guest.maskedPhone,
    };
  }

  private normalizePhone(phoneNumber: string) {
    const trimmed = phoneNumber.trim();
    if (trimmed.startsWith('+')) {
      return `+${trimmed.replace(/\D/g, '')}`;
    }

    return trimmed.replace(/\D/g, '');
  }

  private maskPhone(phoneNumber: string) {
    const digits = phoneNumber.replace(/\D/g, '');
    const suffix = digits.slice(-4).padStart(4, '*');
    return `*****-${suffix}`;
  }

  private mapConsumptionItem(item: ConsumptionItem) {
    return {
      id: item.publicId,
      title: item.title,
      description: item.description,
      category: item.category,
      icon: item.icon,
      amountCents: item.amountCents,
      currency: item.currency,
      occurredAt: item.occurredAt.toISOString(),
    };
  }

  private statusLabel(status: string) {
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      active: 'Hospedagem ativa',
      checked_out: 'Check-out realizado',
      cancelled: 'Cancelada',
    };

    return labels[status] ?? status;
  }
}
