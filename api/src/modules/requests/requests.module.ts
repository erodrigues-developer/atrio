import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { QueuesModule } from '../queues/queues.module';
import { ServicesModule } from '../services/services.module';
import { StaysModule } from '../stays/stays.module';
import { RequestsController } from './controllers/requests.controller';
import { StayRequest } from './entities/stay-request.entity';
import { StayRequestRepository } from './repositories/stay-request.repository';
import { RequestsService } from './services/requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([StayRequest]), AuthModule, StaysModule, ServicesModule, QueuesModule],
  controllers: [RequestsController],
  providers: [StayRequestRepository, RequestsService],
  exports: [StayRequestRepository, RequestsService],
})
export class RequestsModule {}
