import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import UniqueSeeder from './unique.seeder';
import { ConciergeMessage } from 'src/modules/concierge/entities/concierge-message.entity';
import { ExperienceAvailabilitySlot } from 'src/modules/experiences/entities/experience-availability-slot.entity';
import { ExperienceCollectionItem } from 'src/modules/experiences/entities/experience-collection-item.entity';
import { ExperienceCollection } from 'src/modules/experiences/entities/experience-collection.entity';
import { Experience } from 'src/modules/experiences/entities/experience.entity';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import { StayRequest } from 'src/modules/requests/entities/stay-request.entity';
import { ServiceDefinition } from 'src/modules/services/entities/service-definition.entity';
import { ConsumptionItem } from 'src/modules/stays/entities/consumption-item.entity';
import { Guest } from 'src/modules/stays/entities/guest.entity';
import { Hotel } from 'src/modules/stays/entities/hotel.entity';
import { Stay } from 'src/modules/stays/entities/stay.entity';
import { StayUsefulInfo } from 'src/modules/stays/entities/stay-useful-info.entity';
import {
  seedAvailabilitySlots,
  seedCollections,
  seedCollectionItems,
  seedConciergeMessages,
  seedConsumptionItems,
  seedExperiences,
  seedGuest,
  seedHotel,
  seedRequests,
  seedReservations,
  seedServices,
  seedStay,
  seedStayUsefulInfo,
} from './data/ui-mock-seed.data';

export default class InitialSeeder extends UniqueSeeder implements Seeder {
  async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
    await this.execute(dataSource, 'InitialSeeder', async () => {
      await dataSource.getRepository(Hotel).save(seedHotel);
      await dataSource.getRepository(Guest).save(seedGuest);
      await dataSource.getRepository(Stay).save({
        ...seedStay,
        consumptionView: seedStay.consumptionView as 'ready' | 'empty' | 'unavailable',
      });
      await dataSource.getRepository(StayUsefulInfo).save(
        seedStayUsefulInfo.map((item) => ({
          ...item,
          scope: item.scope as 'dashboard' | 'stay',
        })),
      );
      await dataSource.getRepository(ServiceDefinition).save(seedServices);
      await dataSource.getRepository(ExperienceCollection).save(seedCollections);
      await dataSource.getRepository(Experience).save(seedExperiences);
      await dataSource.getRepository(ExperienceCollectionItem).save(
        seedCollectionItems.map((item) => ({
          ...item,
          collectionId: String(item.collectionId),
          experienceId: String(item.experienceId),
          position: Number(item.position),
        })),
      );
      await dataSource.getRepository(ExperienceAvailabilitySlot).save(
        seedAvailabilitySlots.map((slot) => ({
          ...slot,
          startsAt: new Date(slot.startsAt),
        })),
      );
      await dataSource.getRepository(StayRequest).save(
        seedRequests.map((request) => ({
          ...request,
          createdAt: new Date(request.createdAt),
        })),
      );
      await dataSource.getRepository(Reservation).save(
        seedReservations.map((reservation) => ({
          ...reservation,
          scheduledAt: new Date(reservation.scheduledAt),
          createdAt: new Date(reservation.createdAt),
        })),
      );
      await dataSource.getRepository(ConciergeMessage).save(
        seedConciergeMessages.map((message) => ({
          ...message,
          sender: message.sender as 'hotel' | 'guest',
          createdAt: new Date(message.createdAt),
        })),
      );
      await dataSource.getRepository(ConsumptionItem).save(
        seedConsumptionItems.map((item) => ({
          ...item,
          occurredAt: new Date(item.occurredAt),
        })),
      );
    });
  }
}
