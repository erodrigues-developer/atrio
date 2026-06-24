import { Injectable } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exception';
import { AuthSessionContext } from 'src/common/interfaces/auth-session-context.interface';
import { formatTimeRequestLabel } from 'src/common/utils/date-label.util';
import { buildResourceId } from 'src/common/utils/id.util';
import { paginateItems } from 'src/common/utils/pagination.util';
import { QueueService } from 'src/modules/queues/services/queue.service';
import { ServiceCatalogRepository } from 'src/modules/services/repositories/service-catalog.repository';
import { StayRepository } from 'src/modules/stays/repositories/stay.repository';
import { StayRequest } from '../entities/stay-request.entity';
import { StayRequestRepository } from '../repositories/stay-request.repository';

@Injectable()
export class RequestsService {
  constructor(
    private readonly stayRepository: StayRepository,
    private readonly serviceCatalogRepository: ServiceCatalogRepository,
    private readonly stayRequestRepository: StayRequestRepository,
    private readonly queueService: QueueService,
  ) {}

  async createStayRequest(
    stayId: string,
    input: { serviceId: string; quantity?: number; note?: string },
    session: AuthSessionContext,
  ) {
    await this.assertStay(stayId, session);
    const serviceDefinition = await this.serviceCatalogRepository.findById(input.serviceId);

    if (!serviceDefinition) {
      throw new ApiException(404, 'SERVICE_NOT_FOUND', 'Service is not available for the stay.');
    }

    const request = new StayRequest();
    request.id = buildResourceId('req');
    request.stayId = stayId;
    request.serviceId = serviceDefinition.id;
    request.type = serviceDefinition.id;
    request.title = serviceDefinition.id === 'towels' ? 'Toalhas extras' : serviceDefinition.title;
    request.status = 'received';
    request.statusLabel = 'Recebido';
    request.quantity = input.quantity ?? null;
    request.note = input.note ?? '';
    request.roomNumber = session.roomNumber;
    request.createdAt = new Date();

    await this.stayRequestRepository.create(request);
    await this.queueService.publish('stay-requests.fifo', {
      event: 'stay.request.created',
      requestId: request.id,
      stayId,
    });

    return this.mapItem(request);
  }

  async listStayRequests(
    stayId: string,
    query: { status?: string; limit?: number; cursor?: string },
    session: AuthSessionContext,
  ) {
    await this.assertStay(stayId, session);
    const requests = await this.stayRequestRepository.listByStayId(stayId);
    const filteredRequests = query.status
      ? requests.filter((request) => {
          if (query.status === 'active') {
            return request.status !== 'completed';
          }

          return request.status === query.status;
        })
      : requests;

    const pagination = paginateItems(filteredRequests.map((request) => this.mapItem(request)), query.limit, query.cursor);

    return pagination;
  }

  async getStayRequest(stayId: string, requestId: string, session: AuthSessionContext) {
    await this.assertStay(stayId, session);
    const request = await this.stayRequestRepository.findById(stayId, requestId);

    if (!request) {
      throw new ApiException(404, 'REQUEST_NOT_FOUND', 'Stay request was not found.');
    }

    return this.mapItem(request);
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

  private mapItem(request: StayRequest) {
    return {
      id: request.id,
      stayId: request.stayId,
      serviceId: request.serviceId,
      type: request.type,
      title: request.title,
      status: request.status,
      statusLabel: request.statusLabel,
      quantity: request.quantity,
      note: request.note,
      roomNumber: request.roomNumber,
      createdAt: request.createdAt.toISOString(),
      timeLabel: formatTimeRequestLabel(request.createdAt),
    };
  }
}
