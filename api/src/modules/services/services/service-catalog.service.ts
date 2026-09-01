import { Injectable } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ServiceCatalogRepository } from '../repositories/service-catalog.repository';

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly serviceCatalogRepository: ServiceCatalogRepository) {}

  async listServices() {
    const items = await this.serviceCatalogRepository.list();
    return {
      items: items.map((item) => ({
        id: item.publicId,
        title: item.title,
        description: item.description,
        icon: item.icon,
        requestSchema: item.requestSchema,
      })),
    };
  }

  async getService(serviceId: string) {
    const service = await this.serviceCatalogRepository.findById(serviceId);

    if (!service) {
      throw new ApiException(404, 'SERVICE_NOT_FOUND', 'Service is not available for the stay.');
    }

    return {
      id: service.publicId,
      title: service.title,
      description: service.description,
      icon: service.icon,
      requestSchema: service.requestSchema,
    };
  }
}
