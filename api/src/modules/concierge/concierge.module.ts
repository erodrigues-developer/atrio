import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { QueuesModule } from '../queues/queues.module';
import { StaysModule } from '../stays/stays.module';
import { ConciergeController } from './controllers/concierge.controller';
import { ConciergeMessage } from './entities/concierge-message.entity';
import { ConciergeMessageRepository } from './repositories/concierge-message.repository';
import { ConciergeService } from './services/concierge.service';
import { AdminSession } from '../admin/entities/admin-session.entity';
import { ConciergeGateway } from './gateways/concierge.gateway';
import { ConciergeRealtimeService } from './services/concierge-realtime.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConciergeMessage, AdminSession]), AuthModule, StaysModule, QueuesModule],
  controllers: [ConciergeController],
  providers: [ConciergeMessageRepository, ConciergeService, ConciergeGateway, ConciergeRealtimeService],
  exports: [ConciergeMessageRepository, ConciergeService, ConciergeRealtimeService],
})
export class ConciergeModule {}
