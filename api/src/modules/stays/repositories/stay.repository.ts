import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsumptionItem } from '../entities/consumption-item.entity';
import { Stay } from '../entities/stay.entity';
import { StayUsefulInfo } from '../entities/stay-useful-info.entity';

@Injectable()
export class StayRepository {
  constructor(
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
    @InjectRepository(StayUsefulInfo)
    private readonly usefulInfoRepository: Repository<StayUsefulInfo>,
    @InjectRepository(ConsumptionItem)
    private readonly consumptionRepository: Repository<ConsumptionItem>,
  ) {}

  async findByHotelRoomAndLastName(
    hotelId: string,
    roomNumber: string,
    lastName: string,
  ): Promise<Stay | null> {
    return this.stayRepository
      .createQueryBuilder('stay')
      .leftJoinAndSelect('stay.hotel', 'hotel')
      .leftJoinAndSelect('stay.guest', 'guest')
      .where('stay.hotelId = :hotelId', { hotelId })
      .andWhere('stay.roomNumber = :roomNumber', { roomNumber })
      .andWhere('LOWER(guest.lastName) = LOWER(:lastName)', { lastName })
      .getOne();
  }

  async findById(stayId: string): Promise<Stay | null> {
    return this.stayRepository.findOne({
      where: { publicId: stayId },
      relations: {
        hotel: true,
        guest: true,
      },
    });
  }

  async listUsefulInfo(stayId: string, scope: 'dashboard' | 'stay'): Promise<StayUsefulInfo[]> {
    return this.usefulInfoRepository.find({
      where: { stayId, scope },
      order: { position: 'ASC' },
    });
  }

  async listConsumptionItems(stayId: string): Promise<ConsumptionItem[]> {
    return this.consumptionRepository.find({
      where: { stayId },
      order: { occurredAt: 'DESC' },
    });
  }
}
