import { Injectable } from '@nestjs/common';
import { ApiException } from 'src/common/exceptions/api.exception';
import { ExperienceRepository } from '../repositories/experience.repository';

@Injectable()
export class ExperiencesService {
  constructor(private readonly experienceRepository: ExperienceRepository) {}

  async listCollections() {
    const collections = await this.experienceRepository.listCollections();

    return {
      collections: await Promise.all(
        collections.map(async (collection) => ({
          id: collection.id,
          title: collection.title,
          description: collection.description,
          featured: collection.featured,
          items: (await this.experienceRepository.listCollectionItems(collection.id)).map((item) =>
            this.mapExperienceCard(item.experience),
          ),
        })),
      ),
    };
  }

  async getCollection(collectionId: string) {
    const collection = await this.experienceRepository.findCollectionById(collectionId);

    if (!collection) {
      throw new ApiException(404, 'COLLECTION_NOT_FOUND', 'Experience collection was not found.');
    }

    return {
      id: collection.id,
      title: collection.title,
      description: collection.description,
      featured: collection.featured,
      items: (await this.experienceRepository.listCollectionItems(collection.id)).map((item) =>
        this.mapExperienceCard(item.experience),
      ),
    };
  }

  async getExperience(experienceId: string) {
    const experience = await this.experienceRepository.findExperienceById(experienceId);

    if (!experience) {
      throw new ApiException(404, 'EXPERIENCE_NOT_FOUND', 'Experience was not found.');
    }

    return {
      ...this.mapExperienceCard(experience),
      durationLabel: experience.durationLabel,
      availabilityLabel: experience.availabilityLabel,
      locationLabel: experience.locationLabel,
      locationDescription: experience.locationDescription,
      included: experience.included,
      policy: experience.policy,
    };
  }

  async getAvailability(experienceId: string) {
    const experience = await this.experienceRepository.findExperienceById(experienceId);

    if (!experience) {
      throw new ApiException(404, 'EXPERIENCE_NOT_FOUND', 'Experience was not found.');
    }

    const slots = await this.experienceRepository.listAvailability(experienceId);
    const daysMap = new Map<string, { id: string; label: string; date: string; dateLabel: string; slots: Array<Record<string, unknown>> }>();

    for (const slot of slots) {
      if (!daysMap.has(slot.date)) {
        daysMap.set(slot.date, {
          id: slot.date,
          label: slot.dayLabel,
          date: slot.date,
          dateLabel: slot.dateLabel,
          slots: [],
        });
      }

      daysMap.get(slot.date)!.slots.push({
        id: slot.id,
        time: slot.time,
        startsAt: slot.startsAt.toISOString(),
        available: slot.isAvailable,
      });
    }

    return {
      experienceId,
      days: [...daysMap.values()],
    };
  }

  private mapExperienceCard(experience: {
    id: string;
    title: string;
    description: string;
    category: string;
    timeLabel: string;
    priceLabel: string;
    badge: string | null;
    imageUrl: string;
  }) {
    return {
      id: experience.id,
      title: experience.title,
      description: experience.description,
      category: experience.category,
      timeLabel: experience.timeLabel,
      priceLabel: experience.priceLabel,
      badge: experience.badge,
      imageUrl: experience.imageUrl,
    };
  }
}
