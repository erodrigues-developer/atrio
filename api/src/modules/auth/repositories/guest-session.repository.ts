import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { GuestSession } from '../entities/guest-session.entity';

@Injectable()
export class GuestSessionRepository {
  constructor(
    @InjectRepository(GuestSession)
    private readonly repository: Repository<GuestSession>,
  ) {}

  async create(session: GuestSession): Promise<GuestSession> {
    return this.repository.save(session);
  }

  async findActiveByAccessToken(accessToken: string): Promise<GuestSession | null> {
    return this.repository.findOne({
      where: {
        accessToken,
        expiresAt: MoreThan(new Date()),
        revokedAt: IsNull(),
      },
    });
  }
}
