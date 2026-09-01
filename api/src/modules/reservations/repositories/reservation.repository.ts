import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '../entities/reservation.entity';

@Injectable()
export class ReservationRepository {
  constructor(
    @InjectRepository(Reservation)
    private readonly repository: Repository<Reservation>,
  ) {}

  async create(reservation: Reservation): Promise<Reservation> {
    return this.repository.save(reservation);
  }

  async listByStayId(stayId: string): Promise<Reservation[]> {
    return this.repository.find({
      where: { stayId },
      order: { scheduledAt: 'ASC' },
    });
  }

  async findById(stayId: string, reservationId: string): Promise<Reservation | null> {
    return this.repository.findOne({
      where: { publicId: reservationId, stayId },
    });
  }

  async existsByStayAndSlot(stayId: string, scheduledAt: Date): Promise<boolean> {
    return (await this.repository.count({ where: { stayId, scheduledAt } })) > 0;
  }
}
