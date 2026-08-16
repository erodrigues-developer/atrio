import { Inject, Injectable } from '@nestjs/common';
import { QUEUE_SERVICE } from '../constants/queue.constants';

export type QueueDriver = {
  publish(queueName: string, payload: Record<string, unknown>): Promise<void>;
};

@Injectable()
export class QueueService {
  constructor(
    @Inject(QUEUE_SERVICE)
    private readonly driver: QueueDriver,
  ) {}

  async publish(queueName: string, payload: Record<string, unknown>) {
    await this.driver.publish(queueName, payload);
  }
}
