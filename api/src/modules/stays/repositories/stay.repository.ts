import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsumptionItem } from '../entities/consumption-item.entity';
import { HotelUsefulInfo } from '../entities/hotel-useful-info.entity';
import { Stay } from '../entities/stay.entity';
import { StayUsefulInfo } from '../entities/stay-useful-info.entity';

@Injectable()
export class StayRepository {
  constructor(
    @InjectRepository(Stay)
    private readonly stayRepository: Repository<Stay>,
    @InjectRepository(StayUsefulInfo)
    private readonly usefulInfoRepository: Repository<StayUsefulInfo>,
    @InjectRepository(HotelUsefulInfo)
    private readonly hotelUsefulInfoRepository: Repository<HotelUsefulInfo>,
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
      .withDeleted()
      .leftJoinAndSelect('stay.hotel', 'hotel')
      .leftJoinAndSelect('stay.guest', 'guest')
      .where('stay.hotelId = :hotelId', { hotelId })
      .andWhere('stay.roomNumber = :roomNumber', { roomNumber })
      .andWhere('LOWER(guest.lastName) = LOWER(:lastName)', { lastName })
      .orderBy(`CASE
        WHEN stay.status IN ('scheduled', 'active')
          AND stay.checkInDate <= (CURRENT_TIMESTAMP AT TIME ZONE hotel.timezone)::date
          AND stay.checkOutDate >= (CURRENT_TIMESTAMP AT TIME ZONE hotel.timezone)::date
        THEN 0 ELSE 1 END`, 'ASC')
      .addOrderBy('stay.checkInDate', 'DESC')
      .getOne();
  }

  async findById(stayId: string): Promise<Stay | null> {
    return this.stayRepository.findOne({
      where: { publicId: stayId },
      withDeleted: true,
      relations: {
        hotel: true,
        guest: true,
      },
    });
  }

  async listUsefulInfo(
    stayId: string,
    scope: 'dashboard' | 'stay',
  ): Promise<StayUsefulInfo[]> {
    return this.usefulInfoRepository.find({
      where: { stayId, scope },
      order: { position: 'ASC' },
    });
  }

  async listHotelUsefulInfo(
    hotelId: string,
    scope: 'dashboard' | 'stay',
  ): Promise<HotelUsefulInfo[]> {
    const items = await this.hotelUsefulInfoRepository.find({
      where: { hotelId, scope },
      order: { position: 'ASC' },
    });
    const seen = new Set<string>();

    return items.filter((item) => {
      const key = `${item.title.trim().toLocaleLowerCase('pt-BR')}\u0000${item.description.trim().toLocaleLowerCase('pt-BR')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async listConsumptionItems(stayId: string): Promise<ConsumptionItem[]> {
    return this.consumptionRepository.find({
      where: { stayId },
      order: { occurredAt: 'DESC' },
    });
  }
}
