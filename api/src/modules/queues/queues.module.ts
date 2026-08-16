import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { SqsModule } from '../sqs/sqs.module';
import { QUEUE_SERVICE } from './constants/queue.constants';
import { QueueService } from './services/queue.service';
import { RedisFifoQueueService } from './services/redis-fifo-queue.service';
import { SqsQueueService } from './services/sqs-queue.service';

export function selectQueueDriver(
  configService: ConfigService,
  redisFifoQueueService: RedisFifoQueueService,
  sqsQueueService: SqsQueueService,
) {
  return configService.get<string>('queues.driver') === 'sqs'
    ? sqsQueueService
    : redisFifoQueueService;
}

@Module({
  imports: [ConfigModule, RedisModule, SqsModule],
  providers: [
    RedisFifoQueueService,
    SqsQueueService,
    {
      provide: QUEUE_SERVICE,
      useFactory: selectQueueDriver,
      inject: [ConfigService, RedisFifoQueueService, SqsQueueService],
    },
    QueueService,
  ],
  exports: [QueueService],
})
export class QueuesModule {}
