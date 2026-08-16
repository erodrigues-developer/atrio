import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ExperiencesModule } from '../experiences/experiences.module';
import { QueuesModule } from '../queues/queues.module';
import { StaysModule } from '../stays/stays.module';
import { ReservationsController } from './controllers/reservations.controller';
import { Reservation } from './entities/reservation.entity';
import { ReservationRepository } from './repositories/reservation.repository';
import { ReservationsService } from './services/reservations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), AuthModule, StaysModule, ExperiencesModule, QueuesModule],
  controllers: [ReservationsController],
  providers: [ReservationRepository, ReservationsService],
  exports: [ReservationRepository, ReservationsService],
})
export class ReservationsModule {}
