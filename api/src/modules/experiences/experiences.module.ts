import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExperiencesController } from './controllers/experiences.controller';
import { ExperienceAvailabilitySlot } from './entities/experience-availability-slot.entity';
import { ExperienceCollectionItem } from './entities/experience-collection-item.entity';
import { ExperienceCollection } from './entities/experience-collection.entity';
import { Experience } from './entities/experience.entity';
import { ExperienceRepository } from './repositories/experience.repository';
import { ExperiencesService } from './services/experiences.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExperienceCollection,
      Experience,
      ExperienceCollectionItem,
      ExperienceAvailabilitySlot,
    ]),
    AuthModule,
  ],
  controllers: [ExperiencesController],
  providers: [ExperienceRepository, ExperiencesService],
  exports: [ExperienceRepository, ExperiencesService],
})
export class ExperiencesModule {}
