import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { GuestSession } from 'src/modules/auth/entities/guest-session.entity';
import { ConsumptionItem } from 'src/modules/stays/entities/consumption-item.entity';
import { Guest } from 'src/modules/stays/entities/guest.entity';
import { Hotel } from 'src/modules/stays/entities/hotel.entity';
import { HotelUsefulInfo } from 'src/modules/stays/entities/hotel-useful-info.entity';
import { Stay } from 'src/modules/stays/entities/stay.entity';
import { StayUsefulInfo } from 'src/modules/stays/entities/stay-useful-info.entity';
import { Brackets, IsNull, MoreThan, Repository } from 'typeorm';
import {
  AdminGuestListQueryDto,
  AdminStayListQueryDto,
  CreateAdminConsumptionItemDto,
  CreateAdminGuestDto,
  CreateAdminStayDto,
  CreateAdminStayUsefulInfoDto,
  UpdateAdminStayDto,
  UpdateAdminGuestDto,
  UpdateAdminStayWifiDto,
  UpdateAdminConsumptionItemDto,
} from '../dto/admin-stays.dto';
import { AuditService } from './audit.service';

@Injectable()
export class AdminStaysService {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
    @InjectRepository(GuestSession)
    private readonly guestSessionRepository: Repository<GuestSession>,
    @InjectRepository(StayUsefulInfo)
    private readonly usefulInfoRepository: Repository<StayUsefulInfo>,
    @InjectRepository(HotelUsefulInfo)
    private readonly hotelUsefulInfoRepository: Repository<HotelUsefulInfo>,
    @InjectRepository(ConsumptionItem)
    private readonly consumptionItemRepository: Repository<ConsumptionItem>,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
  ) {}

  async listGuests(
    session: AdminSessionContext,
    query: AdminGuestListQueryDto,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const builder = this.guestRepository
      .createQueryBuilder('guest')
      .orderBy('guest.lastName', 'ASC')
      .addOrderBy('guest.firstName', 'ASC')
      .addOrderBy('guest.publicId', 'ASC');

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('guest.firstName ILIKE :search', {
            search: `%${query.search}%`,
          })
            .orWhere('guest.lastName ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('guest.phoneNumber ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    const [guests, total] = await builder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'guests.list',
      resourceType: 'guest',
      summary: `${session.email} listed guests.`,
    });

    return {
      items: guests.map((guest) => this.mapGuest(guest)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
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

  async updateGuest(
    session: AdminSessionContext,
    guestId: string,
    input: UpdateAdminGuestDto,
  ) {
    const guest = await this.getRequiredGuest(guestId);
    this.assignGuest(guest, input);
    const savedGuest = await this.guestRepository.save(guest);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'guest.update',
      resourceType: 'guest',
      resourceId: guestId,
      summary: `${session.email} updated guest ${guestId}.`,
    });

    return this.mapGuest(savedGuest);
  }

  async deleteGuest(session: AdminSessionContext, guestId: string) {
    const guest = await this.getRequiredGuest(guestId);
    await this.guestRepository.softRemove(guest);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'guest.delete',
      resourceType: 'guest',
      resourceId: guestId,
      summary: `${session.email} soft-deleted guest ${guestId}.`,
    });

    return { id: guestId };
  }

  async listStays(session: AdminSessionContext, query: AdminStayListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const builder = this.stayRepository
      .createQueryBuilder('stay')
      .withDeleted()
      .leftJoinAndSelect('stay.guest', 'guest')
      .where('stay.hotelId = :hotelId', { hotelId: session.hotelId })
      .orderBy('stay.checkInDate', 'DESC')
      .addOrderBy('stay.roomNumber', 'ASC')
      .addOrderBy('stay.publicId', 'ASC');

    if (query.status) {
      builder.andWhere('stay.status = :status', { status: query.status });
    }

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('stay.roomNumber ILIKE :search', {
            search: `%${query.search}%`,
          })
            .orWhere('guest.firstName ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('guest.lastName ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('guest.phoneNumber ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    if (query.dateFrom && query.dateTo) {
      const dateFrom =
        query.dateFrom <= query.dateTo ? query.dateFrom : query.dateTo;
      const dateTo =
        query.dateFrom <= query.dateTo ? query.dateTo : query.dateFrom;
      builder.andWhere(
        'stay.checkInDate <= :dateTo AND stay.checkOutDate >= :dateFrom',
        { dateFrom, dateTo },
      );
    }

    const [stays, total] = await builder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const items = await Promise.all(stays.map((stay) => this.mapStay(stay)));

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.getRequiredStay(session, stayId);
    return this.mapStay(stay);
  }

  async createStay(session: AdminSessionContext, input: CreateAdminStayDto) {
    const guest = await this.resolveGuest(input);
    const hotel = await this.getRequiredHotel(session.hotelId);
    const stay = new Stay();
    stay.publicId = buildResourceId('stay');
    stay.hotelId = session.hotelId;
    stay.guestId = guest.publicId;
    stay.roomNumber = input.roomNumber;
    stay.status = 'scheduled';
    stay.statusLabel = this.statusLabel(stay.status);
    stay.checkInDate = input.checkInDate;
    stay.checkOutDate = input.checkOutDate;
    stay.checkOutTime = input.checkOutTime;
    stay.wifiNetwork = hotel.wifiNetwork ?? '';
    stay.wifiPassword = hotel.wifiPassword ?? '';
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

  async updateStay(
    session: AdminSessionContext,
    stayId: string,
    input: UpdateAdminStayDto,
  ) {
    const stay = await this.getRequiredStay(session, stayId);

    if (input.guestId && input.guestId !== stay.guestId) {
      const guest = await this.guestRepository.findOne({
        where: { publicId: input.guestId },
      });

      if (!guest) {
        throw new ApiException(404, 'GUEST_NOT_FOUND', 'Guest was not found.');
      }

      stay.guestId = guest.publicId;
      stay.guest = guest;
    }

    stay.roomNumber = input.roomNumber;
    stay.checkInDate = input.checkInDate;
    stay.checkOutDate = input.checkOutDate;
    stay.checkOutTime = input.checkOutTime;
    stay.consumptionEnabled = input.consumptionEnabled;
    stay.consumptionView = input.consumptionView;

    const savedStay = await this.stayRepository.save(stay);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.update',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} updated stay ${stayId}.`,
    });

    return this.mapStay(savedStay);
  }

  async checkInStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.getRequiredStay(session, stayId);

    if (stay.status !== 'scheduled') {
      throw new ApiException(
        409,
        'INVALID_STAY_STATUS',
        'Only scheduled stays can be checked in.',
      );
    }

    stay.status = 'active';
    stay.statusLabel = this.statusLabel(stay.status);
    const savedStay = await this.stayRepository.save(stay);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.check_in',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} checked in stay ${stayId}.`,
    });

    return this.mapStay(savedStay);
  }

  async checkOutStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.getRequiredStay(session, stayId);

    if (stay.status !== 'active') {
      throw new ApiException(
        409,
        'INVALID_STAY_STATUS',
        'Only active stays can be checked out.',
      );
    }

    stay.status = 'checked_out';
    stay.statusLabel = this.statusLabel(stay.status);
    const savedStay = await this.stayRepository.save(stay);
    const result = await this.guestSessionRepository.update(
      { stayId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      { revokedAt: new Date() },
    );

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.check_out',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} checked out stay ${stayId}.`,
      metadata: { revokedSessions: result.affected ?? 0 },
    });

    return {
      stay: await this.mapStay(savedStay),
      revokedSessions: result.affected ?? 0,
    };
  }

  async cancelStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.getRequiredStay(session, stayId);

    if (stay.status !== 'scheduled') {
      throw new ApiException(
        409,
        'INVALID_STAY_STATUS',
        'Only scheduled stays can be cancelled.',
      );
    }

    stay.status = 'cancelled';
    stay.statusLabel = this.statusLabel(stay.status);
    const savedStay = await this.stayRepository.save(stay);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.cancel',
      resourceType: 'stay',
      resourceId: stayId,
      summary: `${session.email} cancelled stay ${stayId}.`,
    });

    return this.mapStay(savedStay);
  }

  async resendAccess(session: AdminSessionContext, stayId: string) {
    await this.getRequiredStay(session, stayId);
    const challenge =
      await this.authService.createStayAccessChallengeForStay(stayId);

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

  async updateWifi(
    session: AdminSessionContext,
    stayId: string,
    input: UpdateAdminStayWifiDto,
  ) {
    await this.getRequiredStay(session, stayId);
    const hotel = await this.getRequiredHotel(session.hotelId);
    hotel.wifiNetwork = input.wifiNetwork;
    hotel.wifiPassword = input.wifiPassword;
    await this.hotelRepository.save(hotel);

    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'hotel.wifi.update',
      resourceType: 'hotel',
      resourceId: session.hotelId,
      summary: `${session.email} updated hotel Wi-Fi from stay ${stayId}.`,
    });

    return this.mapStay(await this.getRequiredStay(session, stayId));
  }

  async listUsefulInfo(session: AdminSessionContext, stayId: string) {
    await this.getRequiredStay(session, stayId);
    const items = await this.hotelUsefulInfoRepository.find({
      where: { hotelId: session.hotelId },
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

  async createUsefulInfo(
    session: AdminSessionContext,
    stayId: string,
    input: CreateAdminStayUsefulInfoDto,
  ) {
    await this.getRequiredStay(session, stayId);
    const item = new HotelUsefulInfo();
    item.publicId = buildResourceId('info');
    item.hotelId = session.hotelId;
    item.scope = input.scope;
    item.title = input.title;
    item.description = input.description;
    item.position = input.position;

    const savedItem = await this.hotelUsefulInfoRepository.save(item);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'hotel.useful_info.create',
      resourceType: 'hotel_useful_info',
      resourceId: savedItem.publicId,
      summary: `${session.email} created hotel useful info from stay ${stayId}.`,
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

  async createConsumption(
    session: AdminSessionContext,
    stayId: string,
    input: CreateAdminConsumptionItemDto,
  ) {
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
      metadata: {
        amountCents: savedItem.amountCents,
        currency: savedItem.currency,
      },
    });

    return this.mapConsumptionItem(savedItem);
  }

  async updateConsumption(
    session: AdminSessionContext,
    stayId: string,
    consumptionId: string,
    input: UpdateAdminConsumptionItemDto,
  ) {
    const item = await this.getRequiredConsumptionItem(
      session,
      stayId,
      consumptionId,
    );
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
      action: 'stay.consumption.update',
      resourceType: 'consumption_item',
      resourceId: savedItem.publicId,
      summary: `${session.email} updated consumption item for ${stayId}.`,
      metadata: {
        amountCents: savedItem.amountCents,
        currency: savedItem.currency,
      },
    });

    return this.mapConsumptionItem(savedItem);
  }

  async deleteConsumption(
    session: AdminSessionContext,
    stayId: string,
    consumptionId: string,
  ) {
    const item = await this.getRequiredConsumptionItem(
      session,
      stayId,
      consumptionId,
    );
    await this.consumptionItemRepository.remove(item);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'stay.consumption.delete',
      resourceType: 'consumption_item',
      resourceId: consumptionId,
      summary: `${session.email} deleted consumption item from ${stayId}.`,
      metadata: {
        amountCents: item.amountCents,
        currency: item.currency,
      },
    });

    return { id: consumptionId };
  }

  private async resolveGuest(input: CreateAdminStayDto) {
    if (input.guestId) {
      const guest = await this.guestRepository.findOne({
        where: { publicId: input.guestId },
      });

      if (!guest) {
        throw new ApiException(404, 'GUEST_NOT_FOUND', 'Guest was not found.');
      }

      return guest;
    }

    if (input.guest) {
      return this.createGuestEntity(input.guest);
    }

    throw new ApiException(
      400,
      'GUEST_REQUIRED',
      'Provide an existing guest or guest data.',
    );
  }

  private async createGuestEntity(input: CreateAdminGuestDto) {
    const guest = new Guest();
    guest.publicId = buildResourceId('guest');
    this.assignGuest(guest, input);

    return this.guestRepository.save(guest);
  }

  private async getRequiredGuest(guestId: string) {
    const guest = await this.guestRepository.findOne({
      where: { publicId: guestId },
    });

    if (!guest) {
      throw new ApiException(404, 'GUEST_NOT_FOUND', 'Guest was not found.');
    }

    return guest;
  }

  private assignGuest(guest: Guest, input: CreateAdminGuestDto) {
    guest.firstName = input.firstName.trim();
    guest.lastName = input.lastName.trim();
    guest.phoneNumber = this.normalizePhone(input.phoneNumber);
    guest.maskedPhone = this.maskPhone(guest.phoneNumber);
  }

  private async getRequiredStay(session: AdminSessionContext, stayId: string) {
    const stay = await this.stayRepository.findOne({
      where: { publicId: stayId, hotelId: session.hotelId },
      relations: { guest: true },
      withDeleted: true,
    });

    if (!stay) {
      throw new ApiException(404, 'STAY_NOT_FOUND', 'Stay was not found.');
    }

    return stay;
  }

  private async getRequiredHotel(hotelId: string) {
    const hotel = await this.hotelRepository.findOne({
      where: { publicId: hotelId },
    });

    if (!hotel) {
      throw new ApiException(404, 'HOTEL_NOT_FOUND', 'Hotel was not found.');
    }

    return hotel;
  }

  private async mapStay(stay: Stay) {
    const activeGuestSessions = await this.guestSessionRepository.count({
      where: {
        stayId: stay.publicId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
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

  private async getRequiredConsumptionItem(
    session: AdminSessionContext,
    stayId: string,
    consumptionId: string,
  ) {
    await this.getRequiredStay(session, stayId);
    const item = await this.consumptionItemRepository.findOne({
      where: { publicId: consumptionId, stayId },
    });

    if (!item) {
      throw new ApiException(
        404,
        'CONSUMPTION_ITEM_NOT_FOUND',
        'Consumption item was not found.',
      );
    }

    return item;
  }

  private statusLabel(status: string) {
    const labels: Record<string, string> = {
      scheduled: 'Agendada',
      active: 'Ativa',
      checked_out: 'Encerrada',
      cancelled: 'Cancelada',
    };

    return labels[status] ?? status;
  }
}
