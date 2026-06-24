import { Injectable } from '@nestjs/common';
import RedisService from 'src/modules/redis/services/redis.service';
import { QueueDriver } from './queue.service';

@Injectable()
export class RedisFifoQueueService implements QueueDriver {
  constructor(private readonly redisService: RedisService) {}

  async publish(queueName: string, payload: Record<string, unknown>): Promise<void> {
    await this.redisService.pushToQueue(queueName, JSON.stringify(payload));
  }
}
