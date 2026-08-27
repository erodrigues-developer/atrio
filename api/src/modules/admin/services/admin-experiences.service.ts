import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import {
  formatRelativeDateLabel,
  formatTime,
} from 'src/common/utils/date-label.util';
import { buildResourceId } from 'src/common/utils/id.util';
import { ExperienceAvailabilitySlot } from 'src/modules/experiences/entities/experience-availability-slot.entity';
import { ExperienceCollectionItem } from 'src/modules/experiences/entities/experience-collection-item.entity';
import { ExperienceCollection } from 'src/modules/experiences/entities/experience-collection.entity';
import { Experience } from 'src/modules/experiences/entities/experience.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { Stay } from 'src/modules/stays/entities/stay.entity';
import { Brackets, Repository } from 'typeorm';
import {
  AdminExperienceQueryDto,
  AdminReservationQueryDto,
  CreateAdminExperienceSlotDto,
  CreateAdminReservationDto,
  LinkExperienceToCollectionDto,
  UpdateAdminExperienceSlotDto,
  UpdateAdminReservationStatusDto,
  UpsertAdminCollectionDto,
  UpsertAdminExperienceDto,
} from '../dto/admin-experiences.dto';
import { AuditService } from './audit.service';

@Injectable()
export class AdminExperiencesService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(ExperienceCollection)
    private readonly collectionRepository: Repository<ExperienceCollection>,
    @InjectRepository(ExperienceCollectionItem)
    private readonly collectionItemRepository: Repository<ExperienceCollectionItem>,
    @InjectRepository(ExperienceAvailabilitySlot)
    private readonly slotRepository: Repository<ExperienceAvailabilitySlot>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
    private readonly auditService: AuditService,
  ) {}

  async listExperiences(query: AdminExperienceQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const builder = this.experienceRepository
      .createQueryBuilder('experience')
      .orderBy('experience.title', 'ASC')
      .addOrderBy('experience.publicId', 'ASC');

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('experience.title ILIKE :search', {
            search: `%${query.search}%`,
          })
            .orWhere('experience.description ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('experience.locationLabel ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    if (query.category) {
      builder.andWhere('experience.category = :category', {
        category: query.category,
      });
    }

    if (query.status) {
      builder.andWhere('experience.published = :published', {
        published: query.status === 'published',
      });
    }

    const [experiences, total] = await builder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: experiences.map((experience) => this.mapExperience(experience)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createExperience(
    session: AdminSessionContext,
    input: UpsertAdminExperienceDto,
  ) {
    const experience = new Experience();
    experience.publicId = input.id || buildResourceId('exp');
    this.assignExperience(experience, input);

    const saved = await this.experienceRepository.save(experience);
    await this.record(
      session,
      'experience.create',
      'experience',
      saved.publicId,
      `created experience ${saved.title}`,
    );
    return this.mapExperience(saved);
  }

  async updateExperience(
    session: AdminSessionContext,
    experienceId: string,
    input: UpsertAdminExperienceDto,
  ) {
    const experience = await this.getRequiredExperience(experienceId);
    this.assignExperience(experience, input);

    const saved = await this.experienceRepository.save(experience);
    await this.record(
      session,
      'experience.update',
      'experience',
      saved.publicId,
      `updated experience ${saved.title}`,
    );
    return this.mapExperience(saved);
  }

  async listCollections() {
    const collections = await this.collectionRepository.find({
      order: { featured: 'DESC', title: 'ASC' },
    });
    return collections.map((collection) => this.mapCollection(collection));
  }

  async createCollection(
    session: AdminSessionContext,
    input: UpsertAdminCollectionDto,
  ) {
    const collection = new ExperienceCollection();
    collection.publicId = input.id || buildResourceId('col');
    collection.title = input.title;
    collection.description = input.description;
    collection.imageUrl = input.imageUrl ?? null;
    collection.featured = input.featured;
    collection.published = input.published;

    const saved = await this.collectionRepository.save(collection);
    await this.record(
      session,
      'experience_collection.create',
      'experience_collection',
      saved.publicId,
      `created collection ${saved.title}`,
    );
    return this.mapCollection(saved);
  }

  async updateCollection(
    session: AdminSessionContext,
    collectionId: string,
    input: UpsertAdminCollectionDto,
  ) {
    const collection = await this.getRequiredCollection(collectionId);
    collection.title = input.title;
    collection.description = input.description;
    collection.imageUrl = input.imageUrl ?? collection.imageUrl ?? null;
    collection.featured = input.featured;
    collection.published = input.published;

    const saved = await this.collectionRepository.save(collection);
    await this.record(
      session,
      'experience_collection.update',
      'experience_collection',
      saved.publicId,
      `updated collection ${saved.title}`,
    );
    return this.mapCollection(saved);
  }

  async linkExperience(
    session: AdminSessionContext,
    collectionId: string,
    input: LinkExperienceToCollectionDto,
  ) {
    await this.getRequiredCollection(collectionId);
    await this.getRequiredExperience(input.experienceId);
    const existing = await this.collectionItemRepository.findOne({
      where: { collectionId, experienceId: input.experienceId },
    });
    const item = existing ?? new ExperienceCollectionItem();
    item.publicId = existing?.publicId ?? buildResourceId('col_item');
    item.collectionId = collectionId;
    item.experienceId = input.experienceId;
    item.position = input.position;

    const saved = await this.collectionItemRepository.save(item);
    await this.record(
      session,
      'experience_collection.item.upsert',
      'experience_collection',
      collectionId,
      `linked experience ${input.experienceId}`,
    );
    return {
      id: saved.publicId,
      collectionId: saved.collectionId,
      experienceId: saved.experienceId,
      position: saved.position,
    };
  }

  async listSlots(experienceId: string) {
    await this.getRequiredExperience(experienceId);
    const slots = await this.slotRepository.find({
      where: { experienceId },
      order: { startsAt: 'ASC' },
    });
    return slots.map((slot) => this.mapSlot(slot));
  }

  async createSlot(
    session: AdminSessionContext,
    experienceId: string,
    input: CreateAdminExperienceSlotDto,
  ) {
    await this.getRequiredExperience(experienceId);
    const startsAt = new Date(input.startsAt);
    const slot = new ExperienceAvailabilitySlot();
    slot.publicId = buildResourceId('slot');
    slot.experienceId = experienceId;
    slot.startsAt = startsAt;
    slot.date = startsAt.toISOString().slice(0, 10);
    slot.dayLabel = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      timeZone: 'UTC',
    }).format(startsAt);
    slot.dateLabel = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'UTC',
    }).format(startsAt);
    slot.time = formatTime(startsAt);
    slot.isAvailable = input.isAvailable;
    slot.position = input.position;

    const saved = await this.slotRepository.save(slot);
    await this.record(
      session,
      'experience_slot.create',
      'experience_availability_slot',
      saved.publicId,
      `created slot for ${experienceId}`,
    );
    return this.mapSlot(saved);
  }

  async updateSlot(
    session: AdminSessionContext,
    experienceId: string,
    slotId: string,
    input: UpdateAdminExperienceSlotDto,
  ) {
    await this.getRequiredExperience(experienceId);
    const slot = await this.slotRepository.findOne({
      where: { publicId: slotId, experienceId },
    });

    if (!slot) {
      throw new ApiException(
        404,
        'EXPERIENCE_SLOT_NOT_FOUND',
        'Experience availability slot was not found.',
      );
    }

    slot.isAvailable = input.isAvailable;
    const saved = await this.slotRepository.save(slot);
    await this.record(
      session,
      'experience_slot.update',
      'experience_availability_slot',
      saved.publicId,
      `updated slot ${slotId}`,
    );
    return this.mapSlot(saved);
  }

  async listReservations(
    session: AdminSessionContext,
    query: AdminReservationQueryDto,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const builder = this.reservationRepository
      .createQueryBuilder('reservation')
      .innerJoin('stays', 'stay', 'stay.public_id = reservation.stay_id')
      .innerJoin('guests', 'guest', 'guest.public_id = stay.guest_id')
      .where('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .orderBy('reservation.scheduled_at', 'ASC')
      .addOrderBy('reservation.public_id', 'ASC');

    if (query.status) {
      builder.andWhere('reservation.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('reservation.title ILIKE :search', {
            search: `%${query.search}%`,
          })
            .orWhere('stay.room_number ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('guest.first_name ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('guest.last_name ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    const total = await builder.getCount();
    const rows = await builder
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .select([
        'reservation.public_id AS id',
        'reservation.stay_id AS "stayId"',
        'reservation.experience_id AS "experienceId"',
        'reservation.title AS title',
        'reservation.status AS status',
        'reservation.status_label AS "statusLabel"',
        'reservation.scheduled_at AS "scheduledAt"',
        'stay.room_number AS "roomNumber"',
        'CONCAT(guest.first_name, \' \', guest.last_name) AS "guestName"',
      ])
      .getRawMany();

    return {
      items: rows.map((row) => ({
        ...row,
        scheduledAt: new Date(row.scheduledAt).toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createReservation(
    session: AdminSessionContext,
    input: CreateAdminReservationDto,
  ) {
    const stay = await this.getRequiredStay(session, input.stayId);
    const experience = await this.getRequiredExperience(input.experienceId);
    const slot = await this.slotRepository.findOne({
      where: { publicId: input.slotId, experienceId: input.experienceId },
    });

    if (!slot || !slot.isAvailable) {
      throw new ApiException(
        409,
        'SLOT_UNAVAILABLE',
        'Experience availability slot is unavailable.',
      );
    }

    const reservation = new Reservation();
    reservation.publicId = buildResourceId('res');
    reservation.stayId = stay.publicId;
    reservation.experienceId = experience.publicId;
    reservation.title = experience.title;
    reservation.status = 'confirmed';
    reservation.statusLabel = this.reservationStatusLabel('confirmed');
    reservation.scheduledAt = slot.startsAt;
    reservation.dateLabel = formatRelativeDateLabel(slot.startsAt);
    reservation.timeLabel = formatTime(slot.startsAt);
    reservation.locationLabel = experience.locationLabel ?? 'Hotel';
    reservation.priceLabel = experience.priceLabel;
    reservation.note = 'Reserva criada pela equipe do hotel.';
    reservation.guestNote = input.guestNote ?? null;
    reservation.createdAt = new Date();
    slot.isAvailable = false;

    const saved = await this.reservationRepository.save(reservation);
    await this.slotRepository.save(slot);
    await this.record(
      session,
      'reservation.create',
      'reservation',
      saved.publicId,
      `created reservation ${saved.publicId}`,
    );

    return this.mapReservation(
      saved,
      stay.roomNumber,
      `${stay.guest.firstName} ${stay.guest.lastName}`,
    );
  }

  async updateReservationStatus(
    session: AdminSessionContext,
    reservationId: string,
    input: UpdateAdminReservationStatusDto,
  ) {
    const reservation = await this.reservationRepository
      .createQueryBuilder('reservation')
      .innerJoinAndMapOne(
        'reservation.stay',
        Stay,
        'stay',
        'stay.public_id = reservation.stay_id',
      )
      .where('reservation.public_id = :reservationId', { reservationId })
      .andWhere('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .getOne();

    if (!reservation) {
      throw new ApiException(
        404,
        'RESERVATION_NOT_FOUND',
        'Reservation was not found.',
      );
    }

    reservation.status = input.status;
    reservation.statusLabel = this.reservationStatusLabel(input.status);
    const saved = await this.reservationRepository.save(reservation);
    await this.record(
      session,
      'reservation.status.update',
      'reservation',
      saved.publicId,
      `updated reservation ${saved.publicId}`,
    );
    return this.mapReservation(saved, '', '');
  }

  private async getRequiredExperience(experienceId: string) {
    const experience = await this.experienceRepository.findOne({
      where: { publicId: experienceId },
    });

    if (!experience) {
      throw new ApiException(
        404,
        'EXPERIENCE_NOT_FOUND',
        'Experience was not found.',
      );
    }

    return experience;
  }

  private async getRequiredCollection(collectionId: string) {
    const collection = await this.collectionRepository.findOne({
      where: { publicId: collectionId },
    });

    if (!collection) {
      throw new ApiException(
        404,
        'COLLECTION_NOT_FOUND',
        'Experience collection was not found.',
      );
    }

    return collection;
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

  private assignExperience(
    experience: Experience,
    input: UpsertAdminExperienceDto,
  ) {
    experience.title = input.title;
    experience.description = input.description;
    experience.category = input.category;
    experience.timeLabel = input.timeLabel;
    experience.priceLabel = input.priceLabel;
    experience.badge = input.badge ?? null;
    experience.imageUrl = input.imageUrl;
    experience.durationLabel = input.durationLabel ?? null;
    experience.availabilityLabel = input.availabilityLabel ?? null;
    experience.locationLabel = input.locationLabel ?? null;
    experience.locationDescription = input.locationDescription ?? null;
    experience.policy = input.policy ?? null;
    experience.included = input.included;
    experience.published = input.published;
  }

  private mapExperience(experience: Experience) {
    return {
      id: experience.publicId,
      title: experience.title,
      description: experience.description,
      category: experience.category,
      timeLabel: experience.timeLabel,
      priceLabel: experience.priceLabel,
      badge: experience.badge,
      imageUrl: experience.imageUrl,
      durationLabel: experience.durationLabel,
      availabilityLabel: experience.availabilityLabel,
      locationLabel: experience.locationLabel,
      locationDescription: experience.locationDescription,
      policy: experience.policy,
      included: experience.included,
      published: experience.published,
    };
  }

  private mapCollection(collection: ExperienceCollection) {
    return {
      id: collection.publicId,
      title: collection.title,
      description: collection.description,
      imageUrl: collection.imageUrl,
      featured: collection.featured,
      published: collection.published,
    };
  }

  private mapSlot(slot: ExperienceAvailabilitySlot) {
    return {
      id: slot.publicId,
      experienceId: slot.experienceId,
      date: slot.date,
      dayLabel: slot.dayLabel,
      dateLabel: slot.dateLabel,
      time: slot.time,
      startsAt: slot.startsAt.toISOString(),
      isAvailable: slot.isAvailable,
      position: slot.position,
    };
  }

  private mapReservation(
    reservation: Reservation,
    roomNumber: string,
    guestName: string,
  ) {
    return {
      id: reservation.publicId,
      stayId: reservation.stayId,
      experienceId: reservation.experienceId,
      title: reservation.title,
      status: reservation.status,
      statusLabel: reservation.statusLabel,
      scheduledAt: reservation.scheduledAt.toISOString(),
      roomNumber,
      guestName,
    };
  }

  private reservationStatusLabel(status: string) {
    const labels: Record<string, string> = {
      requested: 'Solicitada',
      confirmed: 'Confirmada',
      waitlisted: 'Lista de espera',
      cancelled: 'Cancelada',
      completed: 'Concluida',
      no_show: 'Nao compareceu',
      rejected: 'Recusada',
    };

    return labels[status] ?? status;
  }

  private async record(
    session: AdminSessionContext,
    action: string,
    resourceType: string,
    resourceId: string,
    summary: string,
  ) {
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action,
      resourceType,
      resourceId,
      summary: `${session.email} ${summary}.`,
    });
  }
}
