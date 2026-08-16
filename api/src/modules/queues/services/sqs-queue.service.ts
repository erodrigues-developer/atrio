import { Injectable } from '@nestjs/common';
import { buildResourceId } from 'src/common/utils/id.util';
import { SqsService } from 'src/modules/sqs/services/sqs.service';
import { QueueDriver } from './queue.service';

@Injectable()
export class SqsQueueService implements QueueDriver {
  constructor(private readonly sqsService: SqsService) {}

  async publish(queueName: string, payload: Record<string, unknown>): Promise<void> {
    await this.sqsService.sendMessage(
      JSON.stringify(payload),
      queueName,
      buildResourceId('dedupe'),
      queueName,
    );
  }
}
