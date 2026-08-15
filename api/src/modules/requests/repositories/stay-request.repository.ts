import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StayRequest } from '../entities/stay-request.entity';

@Injectable()
export class StayRequestRepository {
  constructor(
    @InjectRepository(StayRequest)
    private readonly repository: Repository<StayRequest>,
  ) {}

  async create(request: StayRequest): Promise<StayRequest> {
    return this.repository.save(request);
  }

  async listByStayId(stayId: string): Promise<StayRequest[]> {
    return this.repository.find({
      where: { stayId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(stayId: string, requestId: string): Promise<StayRequest | null> {
    return this.repository.findOne({
      where: { publicId: requestId, stayId },
    });
  }
}
