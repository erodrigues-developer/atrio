import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceDefinition } from '../entities/service-definition.entity';

@Injectable()
export class ServiceCatalogRepository {
  constructor(
    @InjectRepository(ServiceDefinition)
    private readonly repository: Repository<ServiceDefinition>,
  ) {}

  async list(): Promise<ServiceDefinition[]> {
    return this.repository.find({ where: { published: true }, order: { title: 'ASC' } });
  }

  async findById(serviceId: string): Promise<ServiceDefinition | null> {
    return this.repository.findOne({ where: { publicId: serviceId, published: true } });
  }
}
