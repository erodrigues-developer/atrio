import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAccessTokenGuard } from 'src/common/guards/admin-access-token.guard';
import { AdminAuthController, AdminMeController } from './controllers/admin-auth.controller';
import { AdminConciergeController } from './controllers/admin-concierge.controller';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { AdminExperienceCollectionsController, AdminExperiencesController, AdminReservationsController } from './controllers/admin-experiences.controller';
import { AdminExperienceMediaController, AdminHotelSettingsController } from './controllers/admin-media.controller';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminRequestsController, AdminServicesController } from './controllers/admin-services.controller';
import { AdminGuestsController, AdminStaysController } from './controllers/admin-stays.controller';
import { AdminSession } from './entities/admin-session.entity';
import { AdminUser } from './entities/admin-user.entity';
import { AuditLog } from './entities/audit-log.entity';
import { GuestSession } from '../auth/entities/guest-session.entity';
import { Guest } from '../stays/entities/guest.entity';
import { Stay } from '../stays/entities/stay.entity';
import { StayUsefulInfo } from '../stays/entities/stay-useful-info.entity';
import { ConsumptionItem } from '../stays/entities/consumption-item.entity';
import { AuthModule } from '../auth/auth.module';
import { ServiceDefinition } from '../services/entities/service-definition.entity';
import { StayRequest } from '../requests/entities/stay-request.entity';
import { Experience } from '../experiences/entities/experience.entity';
import { ExperienceCollection } from '../experiences/entities/experience-collection.entity';
import { ExperienceCollectionItem } from '../experiences/entities/experience-collection-item.entity';
import { ExperienceAvailabilitySlot } from '../experiences/entities/experience-availability-slot.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ConciergeMessage } from '../concierge/entities/concierge-message.entity';
import { Hotel } from '../stays/entities/hotel.entity';
import { StorageModule } from '../storage/storage.module';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminConciergeService } from './services/admin-concierge.service';
import { AdminDashboardService } from './services/admin-dashboard.service';
import { AdminExperiencesService } from './services/admin-experiences.service';
import { AdminMediaService } from './services/admin-media.service';
import { AdminReportsService } from './services/admin-reports.service';
import { AdminServicesService } from './services/admin-services.service';
import { AdminStaysService } from './services/admin-stays.service';
import { AuditService } from './services/audit.service';
import { PasswordService } from './services/password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      AdminSession,
      AuditLog,
      Guest,
      Stay,
      GuestSession,
      StayUsefulInfo,
      ConsumptionItem,
      ServiceDefinition,
      StayRequest,
      Experience,
      ExperienceCollection,
      ExperienceCollectionItem,
      ExperienceAvailabilitySlot,
      Reservation,
      ConciergeMessage,
      Hotel,
    ]),
    AuthModule,
    StorageModule,
  ],
  controllers: [
    AdminAuthController,
    AdminMeController,
    AdminDashboardController,
    AdminConciergeController,
    AdminGuestsController,
    AdminStaysController,
    AdminServicesController,
    AdminRequestsController,
    AdminExperiencesController,
    AdminExperienceCollectionsController,
    AdminExperienceMediaController,
    AdminReservationsController,
    AdminHotelSettingsController,
    AdminReportsController,
  ],
  providers: [
    AdminAuthService,
    AdminDashboardService,
    AdminConciergeService,
    AdminStaysService,
    AdminServicesService,
    AdminExperiencesService,
    AdminMediaService,
    AdminReportsService,
    AuditService,
    PasswordService,
    AdminAccessTokenGuard,
  ],
  exports: [AdminAuthService, AuditService, AdminAccessTokenGuard],
})
export class AdminModule {}
