import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExperienceAvailabilitySlot } from '../entities/experience-availability-slot.entity';
import { ExperienceCollectionItem } from '../entities/experience-collection-item.entity';
import { ExperienceCollection } from '../entities/experience-collection.entity';
import { Experience } from '../entities/experience.entity';

@Injectable()
export class ExperienceRepository {
  constructor(
    @InjectRepository(ExperienceCollection)
    private readonly collectionRepository: Repository<ExperienceCollection>,
    @InjectRepository(ExperienceCollectionItem)
    private readonly collectionItemRepository: Repository<ExperienceCollectionItem>,
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(ExperienceAvailabilitySlot)
    private readonly slotRepository: Repository<ExperienceAvailabilitySlot>,
  ) {}

  async listCollections(): Promise<ExperienceCollection[]> {
    return this.collectionRepository.find({ where: { published: true }, order: { featured: 'DESC', title: 'ASC' } });
  }

  async listCollectionItems(collectionId: string): Promise<ExperienceCollectionItem[]> {
    return this.collectionItemRepository.find({
      where: { collectionId },
      order: { position: 'ASC' },
      relations: {
        experience: true,
      },
    });
  }

  async findCollectionById(collectionId: string): Promise<ExperienceCollection | null> {
    return this.collectionRepository.findOne({ where: { publicId: collectionId, published: true } });
  }

  async findExperienceById(experienceId: string): Promise<Experience | null> {
    return this.experienceRepository.findOne({ where: { publicId: experienceId, published: true } });
  }

  async listAvailability(experienceId: string): Promise<ExperienceAvailabilitySlot[]> {
    return this.slotRepository.find({
      where: { experienceId },
      order: { date: 'ASC', position: 'ASC' },
    });
  }

  async findSlotById(slotId: string): Promise<ExperienceAvailabilitySlot | null> {
    return this.slotRepository.findOne({ where: { publicId: slotId } });
  }

  async saveSlot(slot: ExperienceAvailabilitySlot): Promise<ExperienceAvailabilitySlot> {
    return this.slotRepository.save(slot);
  }
}
