import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ConciergeMessage } from '../entities/concierge-message.entity';

@Injectable()
export class ConciergeMessageRepository {
  constructor(
    @InjectRepository(ConciergeMessage)
    private readonly repository: Repository<ConciergeMessage>,
  ) {}

  async create(message: ConciergeMessage): Promise<ConciergeMessage> {
    return this.repository.save(message);
  }

  async listByStayId(stayId: string, limit?: number, before?: ConciergeMessage): Promise<ConciergeMessage[]> {
    return this.repository.find({
      where: before
        ? {
            stayId,
            createdAt: LessThan(before.createdAt),
          }
        : { stayId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findById(messageId: string): Promise<ConciergeMessage | null> {
    return this.repository.findOne({ where: { publicId: messageId } });
  }
}
