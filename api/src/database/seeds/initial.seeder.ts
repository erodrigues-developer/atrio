import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import UniqueSeeder from './unique.seeder';
import { AdminUser } from 'src/modules/admin/entities/admin-user.entity';
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

type SeedWithPublicId = {
  id: string;
  [key: string]: unknown;
};

function toEntitySeed<T extends SeedWithPublicId>(seed: T): Omit<T, 'id'> & { publicId: string } {
  const { id, ...rest } = seed;

  return {
    ...rest,
    publicId: id,
  };
}

export default class InitialSeeder extends UniqueSeeder implements Seeder {
  async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<void> {
    await this.execute(dataSource, 'InitialSeeder', async () => {
      await dataSource.getRepository(Hotel).save(toEntitySeed(seedHotel));
      await dataSource.getRepository(AdminUser).save({
        publicId: 'admin_001',
        hotelId: seedHotel.id,
        name: 'Atrio Manager',
        email: 'admin@atrio.app',
        passwordHash:
          'pbkdf2_sha512$120000$atrio-admin-seed-salt$ffb133790918feb58ef749dcd10680b0aa9206c117110813e33c8b68d15637dc8504f8e47021da1aaa072f22f224bc4cd1adf65a958cc4c98bdb796c1c94ef42',
        role: 'owner',
        permissions: [
          'hotel.settings.read/write',
          'staff.read/write',
          'stays.read/write',
          'guests.read/write',
          'services.read/write',
          'requests.read/write',
          'experiences.read/write',
          'experiences.media.write',
          'reservations.read/write',
          'consumption.read/write',
          'concierge.read/write',
          'hotel.media.write',
          'reports.read',
        ],
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await dataSource.getRepository(Guest).save(toEntitySeed(seedGuest));
      await dataSource.getRepository(Stay).save({
        ...toEntitySeed(seedStay),
        consumptionView: seedStay.consumptionView as 'ready' | 'empty' | 'unavailable',
      });
      await dataSource.getRepository(StayUsefulInfo).save(
        seedStayUsefulInfo.map((item) => ({
          ...toEntitySeed(item),
          scope: item.scope as 'dashboard' | 'stay',
        })),
      );
      await dataSource.getRepository(ServiceDefinition).save(seedServices.map((item) => toEntitySeed(item)));
      await dataSource.getRepository(ExperienceCollection).save(seedCollections.map((item) => toEntitySeed(item)));
      await dataSource.getRepository(Experience).save(seedExperiences.map((item) => toEntitySeed(item)));
      await dataSource.getRepository(ExperienceCollectionItem).save(
        seedCollectionItems.map((item) => ({
          ...toEntitySeed(item),
          collectionId: String(item.collectionId),
          experienceId: String(item.experienceId),
          position: Number(item.position),
        })),
      );
      await dataSource.getRepository(ExperienceAvailabilitySlot).save(
        seedAvailabilitySlots.map((slot) => ({
          ...toEntitySeed(slot),
          startsAt: new Date(slot.startsAt),
        })),
      );
      await dataSource.getRepository(StayRequest).save(
        seedRequests.map((request) => ({
          ...toEntitySeed(request),
          createdAt: new Date(request.createdAt),
        })),
      );
      await dataSource.getRepository(Reservation).save(
        seedReservations.map((reservation) => ({
          ...toEntitySeed(reservation),
          scheduledAt: new Date(reservation.scheduledAt),
          createdAt: new Date(reservation.createdAt),
        })),
      );
      await dataSource.getRepository(ConciergeMessage).save(
        seedConciergeMessages.map((message) => ({
          ...toEntitySeed(message),
          sender: message.sender as 'hotel' | 'guest',
          createdAt: new Date(message.createdAt),
        })),
      );
      await dataSource.getRepository(ConsumptionItem).save(
        seedConsumptionItems.map((item) => ({
          ...toEntitySeed(item),
          occurredAt: new Date(item.occurredAt),
        })),
      );
    });
  }
}
