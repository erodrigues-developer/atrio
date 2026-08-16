import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { QueuesModule } from '../queues/queues.module';
import { StaysModule } from '../stays/stays.module';
import { ConciergeController } from './controllers/concierge.controller';
import { ConciergeMessage } from './entities/concierge-message.entity';
import { ConciergeMessageRepository } from './repositories/concierge-message.repository';
import { ConciergeService } from './services/concierge.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConciergeMessage]), AuthModule, StaysModule, QueuesModule],
  controllers: [ConciergeController],
  providers: [ConciergeMessageRepository, ConciergeService],
  exports: [ConciergeMessageRepository, ConciergeService],
})
export class ConciergeModule {}
