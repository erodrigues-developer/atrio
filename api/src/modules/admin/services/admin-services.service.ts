import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AdminSessionContext } from 'src/common/interfaces/admin-session-context.interface';
import { buildResourceId } from 'src/common/utils/id.util';
import { StayRequest } from 'src/modules/requests/entities/stay-request.entity';
import { ServiceDefinition } from 'src/modules/services/entities/service-definition.entity';
import { Brackets, Repository } from 'typeorm';
import { UpdateAdminStayRequestStatusDto, UpsertAdminServiceDefinitionDto } from '../dto/admin-services.dto';
import { AuditService } from './audit.service';

@Injectable()
export class AdminServicesService {
  constructor(
    @InjectRepository(ServiceDefinition)
    private readonly serviceDefinitionRepository: Repository<ServiceDefinition>,
    @InjectRepository(StayRequest)
    private readonly stayRequestRepository: Repository<StayRequest>,
    private readonly auditService: AuditService,
  ) {}

  async listServices() {
    const services = await this.serviceDefinitionRepository.find({ order: { title: 'ASC' } });
    return services.map((service) => this.mapService(service));
  }

  async createService(session: AdminSessionContext, input: UpsertAdminServiceDefinitionDto) {
    const service = new ServiceDefinition();
    service.publicId = input.id || buildResourceId('svc');
    this.assignService(service, input);

    const savedService = await this.serviceDefinitionRepository.save(service);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'service.create',
      resourceType: 'service_definition',
      resourceId: savedService.publicId,
      summary: `${session.email} created service ${savedService.title}.`,
    });

    return this.mapService(savedService);
  }

  async updateService(session: AdminSessionContext, serviceId: string, input: UpsertAdminServiceDefinitionDto) {
    const service = await this.getRequiredService(serviceId);
    this.assignService(service, input);

    const savedService = await this.serviceDefinitionRepository.save(service);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'service.update',
      resourceType: 'service_definition',
      resourceId: serviceId,
      summary: `${session.email} updated service ${savedService.title}.`,
    });

    return this.mapService(savedService);
  }

  async setServicePublished(session: AdminSessionContext, serviceId: string, published: boolean) {
    const service = await this.getRequiredService(serviceId);
    service.published = published;

    const savedService = await this.serviceDefinitionRepository.save(service);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: published ? 'service.publish' : 'service.unpublish',
      resourceType: 'service_definition',
      resourceId: serviceId,
      summary: `${session.email} ${published ? 'published' : 'unpublished'} service ${savedService.title}.`,
    });

    return this.mapService(savedService);
  }

  async listRequests(session: AdminSessionContext, query: { status?: string; search?: string }) {
    const builder = this.stayRequestRepository
      .createQueryBuilder('request')
      .innerJoin('stays', 'stay', 'stay.public_id = request.stay_id')
      .innerJoin('guests', 'guest', 'guest.public_id = stay.guest_id')
      .where('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .orderBy('request.created_at', 'DESC')
      .limit(100)
      .select([
        'request.public_id AS id',
        'request.stay_id AS "stayId"',
        'request.service_id AS "serviceId"',
        'request.title AS title',
        'request.status AS status',
        'request.status_label AS "statusLabel"',
        'request.quantity AS quantity',
        'request.note AS note',
        'request.internal_note AS "internalNote"',
        'request.room_number AS "roomNumber"',
        'request.created_at AS "createdAt"',
        "CONCAT(guest.first_name, ' ', guest.last_name) AS \"guestName\"",
      ]);

    if (query.status) {
      builder.andWhere('request.status = :status', { status: query.status });
    }

    if (query.search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('request.room_number ILIKE :search', { search: `%${query.search}%` })
            .orWhere('request.title ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.first_name ILIKE :search', { search: `%${query.search}%` })
            .orWhere('guest.last_name ILIKE :search', { search: `%${query.search}%` });
        }),
      );
    }

    const rows = await builder.getRawMany();
    return rows.map((row) => ({ ...row, createdAt: new Date(row.createdAt).toISOString() }));
  }

  async updateRequestStatus(session: AdminSessionContext, requestId: string, input: UpdateAdminStayRequestStatusDto) {
    const request = await this.stayRequestRepository
      .createQueryBuilder('request')
      .innerJoin('stays', 'stay', 'stay.public_id = request.stay_id')
      .where('request.public_id = :requestId', { requestId })
      .andWhere('stay.hotel_id = :hotelId', { hotelId: session.hotelId })
      .getOne();

    if (!request) {
      throw new ApiException(404, 'REQUEST_NOT_FOUND', 'Stay request was not found.');
    }

    request.status = input.status;
    request.statusLabel = this.requestStatusLabel(input.status);
    request.internalNote = input.internalNote ?? request.internalNote;

    const savedRequest = await this.stayRequestRepository.save(request);
    await this.auditService.record({
      hotelId: session.hotelId,
      adminUserId: session.adminUserId,
      action: 'request.status.update',
      resourceType: 'stay_request',
      resourceId: savedRequest.publicId,
      summary: `${session.email} updated request ${savedRequest.publicId} to ${savedRequest.status}.`,
    });

    return {
      id: savedRequest.publicId,
      stayId: savedRequest.stayId,
      serviceId: savedRequest.serviceId,
      title: savedRequest.title,
      status: savedRequest.status,
      statusLabel: savedRequest.statusLabel,
      quantity: savedRequest.quantity,
      note: savedRequest.note,
      internalNote: savedRequest.internalNote,
      roomNumber: savedRequest.roomNumber,
      guestName: '',
      createdAt: savedRequest.createdAt.toISOString(),
    };
  }

  private async getRequiredService(serviceId: string) {
    const service = await this.serviceDefinitionRepository.findOne({ where: { publicId: serviceId } });

    if (!service) {
      throw new ApiException(404, 'SERVICE_NOT_FOUND', 'Service was not found.');
    }

    return service;
  }

  private assignService(service: ServiceDefinition, input: UpsertAdminServiceDefinitionDto) {
    service.title = input.title;
    service.description = input.description;
    service.icon = input.icon;
    service.fulfillmentType = input.fulfillmentType;
    service.requestSchema = input.requestSchema;
    service.published = input.published;
  }

  private mapService(service: ServiceDefinition) {
    return {
      id: service.publicId,
      title: service.title,
      description: service.description,
      icon: service.icon,
      fulfillmentType: service.fulfillmentType,
      requestSchema: service.requestSchema,
      published: service.published,
    };
  }

  private requestStatusLabel(status: string) {
    const labels: Record<string, string> = {
      received: 'Recebido',
      accepted: 'Aceito',
      in_progress: 'Em preparo',
      on_the_way: 'A caminho',
      completed: 'Concluido',
      cancelled: 'Cancelado',
      rejected: 'Recusado',
    };

    return labels[status] ?? status;
  }
}
